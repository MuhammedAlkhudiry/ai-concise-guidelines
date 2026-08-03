import Foundation

struct LaneCommandClient: Sendable {
  private let lanesExecutable: URL

  init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
    lanesExecutable = homeDirectory.appending(path: "bin/lanes")
  }

  func loadServiceStatuses() async throws -> [String: [LaneService]] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .utility) {
      let data = try run(
        executable,
        arguments: ["services", "status", "--json", "--site-timeout", "750"]
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
      let services = try JSONDecoder().decode(LaneServicesDocument.self, from: data)
        .servicesByLane()
      guard let laneServices = services[lane.serviceKey] else {
        throw LaneMenuError.message("No service status returned for \(lane.serviceKey).")
      }
      return laneServices
    }.value
  }

  func loadCiStatuses(for project: LaneProject) async throws -> [String: LaneCiStatus] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .utility) {
      let data = try run(
        executable,
        arguments: ["ci", "status", project.id, "--json"]
      )
      return try JSONDecoder().decode(LaneCiDocument.self, from: data).statusesByLane()
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

  func loadCleanupJobs() async throws -> [LaneCleanupJob] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .utility) {
      let data = try run(executable, arguments: ["cleanup", "status", "--json"])
      return try JSONDecoder().decode(LaneCleanupDocument.self, from: data).jobs
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

  func openBranch(on lane: LaneItem) async throws {
    let executable = lanesExecutable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(
        executable,
        arguments: ["open", lane.projectID, lane.laneID, "branch"]
      )
    }.value
  }

  func openGitHubBranch(on lane: LaneItem) async throws {
    let executable = lanesExecutable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(
        executable,
        arguments: ["open", lane.projectID, lane.laneID, "github-branch"]
      )
    }.value
  }

  func createPullRequest(
    on lane: LaneItem,
    progress: @escaping @MainActor @Sendable (PullRequestCreationStage) -> Void
  ) async throws -> URL {
    let process = Process()
    let standardOutput = Pipe()
    let standardError = Pipe()
    process.executableURL = lanesExecutable
    process.arguments = ["pr", "create", lane.projectID, lane.laneID, "--json"]
    process.standardOutput = standardOutput
    process.standardError = standardError

    try process.run()
    async let errorData = collectData(from: standardError.fileHandleForReading)
    var createdURL: URL?
    for try await line in standardOutput.fileHandleForReading.bytes.lines {
      guard let data = line.data(using: .utf8) else { continue }
      let event = try JSONDecoder().decode(PullRequestCreationEvent.self, from: data)
      if let stage = event.stage {
        await progress(stage)
      }
      if event.type == "complete" {
        createdURL = event.url
      }
    }
    process.waitUntilExit()
    let error = try await errorData
    guard process.terminationStatus == 0 else {
      let message = String(decoding: error, as: UTF8.self)
        .trimmingCharacters(in: .whitespacesAndNewlines)
      throw LaneMenuError.message(message.isEmpty ? "Pull-request creation failed" : message)
    }
    guard let createdURL else {
      throw LaneMenuError.message("Pull-request creation completed without a URL")
    }
    return createdURL
  }

  func release(_ lane: LaneItem) async throws {
    let executable = lanesExecutable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(
        executable,
        arguments: [
          "release", lane.projectID, lane.laneID, "--confirm", "--compact",
        ]
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

  func sync(_ lane: LaneItem) async throws {
    let executable = lanesExecutable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(
        executable,
        arguments: ["sync", lane.projectID, lane.laneID]
      )
    }.value
  }

  func setService(
    _ service: LaneService, running: Bool, on lane: LaneItem
  ) async throws -> [LaneService] {
    let statuses = try await setServices(
      running: running,
      projectID: lane.projectID,
      laneID: lane.laneID,
      serviceID: service.id
    )
    return try laneServices(for: lane, in: statuses)
  }

  func setLaneServices(running: Bool, on lane: LaneItem) async throws -> [LaneService] {
    let statuses = try await setServices(
      running: running,
      projectID: lane.projectID,
      laneID: lane.laneID,
      serviceID: "all"
    )
    return try laneServices(for: lane, in: statuses)
  }

  func setProjectServices(
    running: Bool, projectID: String
  ) async throws -> [String: [LaneService]] {
    try await setServices(
      running: running,
      projectID: projectID,
      laneID: "all",
      serviceID: "all"
    )
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

  func restartService(_ service: LaneService, on lane: LaneItem) async throws -> [LaneService] {
    let executable = lanesExecutable
    return try await Task.detached(priority: .userInitiated) {
      let data = try run(
        executable,
        arguments: [
          "services", "restart", lane.projectID, lane.laneID, service.id, "--json",
        ]
      )
      let services = try JSONDecoder().decode(LaneServicesDocument.self, from: data)
        .servicesByLane()
      return try laneServices(for: lane, in: services)
    }.value
  }

  func latestLogs(for service: LaneService, on lane: LaneItem) async -> String {
    let executable = lanesExecutable
    return await Task.detached(priority: .utility) {
      guard
        let data = try? run(
          executable,
          arguments: [
            "services", "logs", lane.projectID, lane.laneID, service.id, "--lines", "50", "--raw",
          ]
        )
      else { return "Could not load service logs." }
      return String(decoding: data, as: UTF8.self)
    }.value
  }
}

private func laneServices(
  for lane: LaneItem, in statuses: [String: [LaneService]]
) throws -> [LaneService] {
  guard let services = statuses[lane.serviceKey] else {
    throw LaneMenuError.message("No service status returned for \(lane.serviceKey).")
  }
  return services
}

private func collectData(from handle: FileHandle) async throws -> Data {
  var data = Data()
  for try await byte in handle.bytes {
    data.append(byte)
  }
  return data
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
