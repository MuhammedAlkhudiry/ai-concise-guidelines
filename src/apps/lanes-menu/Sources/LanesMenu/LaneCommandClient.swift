import Foundation

struct LaneCommandClient: Sendable {
  private let lanesExecutable: URL

  init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
    lanesExecutable = homeDirectory.appending(path: "bin/lanes")
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

  func loadServiceStatuses() async throws -> [String: [LaneService]] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .utility) {
      let data = try run(
        executable,
        arguments: ["services", "status", "--json", "--site-timeout", "3000"]
      )
      return try JSONDecoder().decode(LaneServicesDocument.self, from: data).servicesByLane()
    }.value
  }

  func loadServices(for lane: LaneItem) async throws -> [LaneService] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .utility) {
      let data = try run(
        executable,
        arguments: ["services", "status", lane.projectID, lane.laneID, "--json"]
      )
      return try services(for: lane, in: data)
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

  func repair(_ lane: LaneItem) async throws {
    let executable = lanesExecutable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(
        executable,
        arguments: ["repair", lane.projectID, lane.laneID, "--compact"]
      )
    }.value
  }

  func destroy(_ lane: LaneItem) async throws {
    let executable = lanesExecutable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(
        executable,
        arguments: ["destroy", lane.projectID, lane.laneID, "--confirm"]
      )
    }.value
  }

  func setService(
    _ service: LaneService,
    running: Bool,
    on lane: LaneItem
  ) async throws -> [LaneService] {
    try await setServices(
      running: running,
      projectID: lane.projectID,
      laneID: lane.laneID,
      serviceID: service.id
    )[lane.serviceKey] ?? []
  }

  func setLaneServices(running: Bool, on lane: LaneItem) async throws -> [LaneService] {
    try await setServices(
      running: running,
      projectID: lane.projectID,
      laneID: lane.laneID,
      serviceID: "all"
    )[lane.serviceKey] ?? []
  }

  func setProjectServices(
    running: Bool,
    projectID: String
  ) async throws -> [String: [LaneService]] {
    try await setServices(
      running: running,
      projectID: projectID,
      laneID: "all",
      serviceID: "all"
    )
  }

  func restartService(_ service: LaneService, on lane: LaneItem) async throws -> [LaneService] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .userInitiated) {
      let data = try run(
        executable,
        arguments: [
          "services", "restart", lane.projectID, lane.laneID, service.id, "--json",
        ]
      )
      return try services(for: lane, in: data)
    }.value
  }

  func latestLogs(for service: LaneService, on lane: LaneItem) async -> String {
    let executable = lanesExecutable
    return await Task.detached(priority: .utility) {
      guard
        let data = try? run(
          executable,
          arguments: [
            "services", "logs", lane.projectID, lane.laneID, service.id, "--lines", "80",
            "--raw",
          ]
        )
      else { return "Could not load service logs." }
      return String(decoding: data, as: UTF8.self)
    }.value
  }

  private func setServices(
    running: Bool,
    projectID: String,
    laneID: String,
    serviceID: String
  ) async throws -> [String: [LaneService]] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .userInitiated) {
      let data = try run(
        executable,
        arguments: [
          "services", running ? "start" : "stop", projectID, laneID, serviceID, "--json",
        ]
      )
      return try JSONDecoder().decode(LaneServicesDocument.self, from: data).servicesByLane()
    }.value
  }
}

private func services(for lane: LaneItem, in data: Data) throws -> [LaneService] {
  let services = try JSONDecoder().decode(LaneServicesDocument.self, from: data).servicesByLane()
  guard let laneServices = services[lane.serviceKey] else {
    throw LaneMenuError.message("No service status returned for \(lane.serviceKey).")
  }
  return laneServices
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
      message.isEmpty ? "Command failed: \(executable.lastPathComponent)" : message
    )
  }
  return output
}

private enum LaneMenuError: LocalizedError {
  case message(String)

  var errorDescription: String? {
    switch self {
    case .message(let message): message
    }
  }
}
