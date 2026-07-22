import Foundation

struct LaneCommandClient: Sendable {
  private let lanesExecutable: URL
  private let soloExecutable: URL

  init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
    lanesExecutable = homeDirectory.appending(path: "bin/lanes")
    soloExecutable = homeDirectory.appending(path: ".local/bin/solo")
  }

  func loadServiceStatuses(for projects: [LaneProject]) async -> [String: [LaneService]] {
    let soloServices = await loadSoloServices()
    var statuses: [String: [LaneService]] = [:]
    for project in projects {
      let catalog = serviceCatalog(
        project.lanes.flatMap { soloServices[$0.soloProjectName] ?? [] }
      )
      for lane in project.lanes {
        let laneServices = Dictionary(
          (soloServices[lane.soloProjectName] ?? []).map { ($0.name, $0) },
          uniquingKeysWith: { first, _ in first }
        )
        statuses[lane.serviceKey] =
          [LaneService(id: "site", name: "Site", state: .checking)]
          + catalog.map { name in
            laneServices[name]
              ?? LaneService(id: "missing-\(name)", name: name, state: .unavailable)
          }
      }
    }

    await withTaskGroup(of: (String, LaneServiceState).self) { group in
      for lane in projects.flatMap(\.lanes) {
        group.addTask {
          (lane.serviceKey, await webState(for: lane.appURL))
        }
      }
      for await (key, state) in group {
        guard let siteIndex = statuses[key]?.firstIndex(where: { $0.id == "site" }) else {
          continue
        }
        statuses[key]?[siteIndex].state = state
      }
    }
    return statuses
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
    try await Task.detached(priority: .userInitiated) {
      switch action {
      case .editor:
        _ = try run("/usr/bin/open", arguments: ["-a", "PhpStorm", lane.path])
      case .browser:
        _ = try run("/usr/bin/open", arguments: [lane.appURL.absoluteString])
      case .simulator:
        try openSimulator(named: lane.simulatorName)
      }
    }.value
  }

  private func loadSoloServices() async -> [String: [LaneService]] {
    let executable = soloExecutable
    return await Task.detached(priority: .utility) {
      guard FileManager.default.isExecutableFile(atPath: executable.path) else { return [:] }
      guard
        let data = try? run(
          executable,
          arguments: ["processes", "list", "--json", "--limit", "500"]
        ),
        let document = try? JSONDecoder().decode(SoloProcessDocument.self, from: data)
      else {
        return [:]
      }
      return document.servicesByProject()
    }.value
  }
}

private func serviceCatalog(_ services: [LaneService]) -> [String] {
  let names = Set(services.map(\.name))
  let preferred = ["Web", "Queues", "Mobile"].filter(names.contains)
  return preferred + names.subtracting(preferred).sorted()
}

private func webState(for url: URL) async -> LaneServiceState {
  var request = URLRequest(url: url, timeoutInterval: 3)
  request.httpMethod = "HEAD"
  do {
    let (_, response) = try await URLSession.shared.data(for: request)
    guard let response = response as? HTTPURLResponse else { return .failed }
    return (200..<400).contains(response.statusCode) ? .running : .failed
  } catch {
    return .failed
  }
}

private func openSimulator(named name: String) throws {
  let data = try run("/usr/bin/xcrun", arguments: ["simctl", "list", "devices", "-j"])
  let document = try JSONDecoder().decode(SimulatorDocument.self, from: data)
  let matchingDevices = document.devices.values
    .flatMap { $0 }
    .filter { $0.name == name && $0.isAvailable != false }
  guard let device = matchingDevices.first(where: { $0.state == "Booted" }) ?? matchingDevices.first
  else {
    throw LaneMenuError.message("Simulator “\(name)” is missing.")
  }

  if device.state != "Booted" {
    _ = try run("/usr/bin/xcrun", arguments: ["simctl", "boot", device.udid])
  }
  _ = try run("/usr/bin/open", arguments: ["-a", "Simulator"])
}

private struct SimulatorDocument: Decodable {
  let devices: [String: [SimulatorDevice]]
}

private struct SimulatorDevice: Decodable {
  let name: String
  let udid: String
  let state: String
  let isAvailable: Bool?
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
