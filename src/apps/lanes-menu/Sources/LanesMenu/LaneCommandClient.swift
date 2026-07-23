import Foundation

struct LaneCommandClient: Sendable {
  private let lanesExecutable: URL

  init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
    lanesExecutable = homeDirectory.appending(path: "bin/lanes")
  }

  func loadServiceStatuses() async throws -> [String: [LaneService]] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .utility) {
      let data = try run(executable, arguments: ["services", "status", "--json"])
      return try JSONDecoder().decode(LaneServicesDocument.self, from: data).servicesByLane()
    }.value
  }

  func loadProjects() async throws -> [LaneProject] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .userInitiated) {
      guard FileManager.default.isExecutableFile(atPath: executable.path) else {
        throw LaneMenuError.message("The lanes command is missing. Run mise run install.")
      }
      let data = try run(executable, arguments: ["status", "--json"])
      return try JSONDecoder().decode(LaneStatusDocument.self, from: data).projects()
    }.value
  }

  func perform(_ action: LaneAction, on lane: LaneItem) async throws {
    let executable = lanesExecutable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(
        executable,
        arguments: ["open", lane.projectID, lane.laneID, action.cliTarget]
      )
    }.value
  }

  func setService(_ service: LaneService, running: Bool, on lane: LaneItem) async throws {
    let executable = lanesExecutable
    _ = try await Task.detached(priority: .userInitiated) {
      try run(
        executable,
        arguments: [
          "services", running ? "start" : "stop", lane.projectID, lane.laneID, service.id, "--json",
        ]
      )
    }.value
  }

  func latestLogs(for service: LaneService, on lane: LaneItem) async -> String {
    let executable = lanesExecutable
    return await Task.detached(priority: .utility) {
      guard
        let data = try? run(
          executable,
          arguments: [
            "services", "logs", lane.projectID, lane.laneID, service.id, "--lines", "200", "--raw",
          ]
        )
      else { return "Could not load service logs." }
      return String(decoding: data, as: UTF8.self)
    }.value
  }
}

@discardableResult
private func run(_ executable: URL, arguments: [String]) throws -> Data {
  let process = Process()
  let standardOutput = Pipe()
  let standardError = Pipe()
  process.executableURL = executable
  process.arguments = arguments
  process.standardOutput = standardOutput
  process.standardError = standardError

  try process.run()
  let output = standardOutput.fileHandleForReading.readDataToEndOfFile()
  let error = standardError.fileHandleForReading.readDataToEndOfFile()
  process.waitUntilExit()

  guard process.terminationStatus == 0 else {
    let message = String(decoding: error.isEmpty ? output : error, as: UTF8.self)
      .trimmingCharacters(in: .whitespacesAndNewlines)
    throw LaneMenuError.message(
      message.isEmpty ? "Command failed: \(executable.lastPathComponent)" : message)
  }
  return output
}

@discardableResult
private func run(_ executable: String, arguments: [String]) throws -> Data {
  try run(URL(fileURLWithPath: executable), arguments: arguments)
}

private enum LaneMenuError: LocalizedError {
  case message(String)

  var errorDescription: String? {
    switch self {
    case .message(let message): message
    }
  }
}
