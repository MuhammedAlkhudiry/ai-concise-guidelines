import Foundation
import Testing

@testable import LanesMenu

@Test func decodesLaneStatusIntoProjectSectionsAndNavigationTargets() throws {
  let data = Data(
    #"""
    {
      "lanes": [
        {
          "lane": {
            "id": "lane-2",
            "number": 2,
            "path": "/projects/awraq-lane-2",
            "project": { "id": "awraq", "name": "Awraq" }
          },
          "availability": "occupied",
          "health": "broken",
          "branch": "codex/example",
          "occupancyReason": "Git changes present",
          "healthReason": "Simulator is not booted\nLong command output"
        }
      ]
    }
    """#.utf8
  )

  let projects = try JSONDecoder().decode(LaneStatusDocument.self, from: data).projects()

  #expect(projects.count == 1)
  #expect(projects[0].name == "Awraq")
  #expect(projects[0].lanes.count == 1)
  let lane = projects[0].lanes[0]
  #expect(lane.appURL.absoluteString == "https://awraq-lane-2.test")
  #expect(lane.simulatorName == "Awraq Lane 2")
  #expect(lane.displayName == "Lane 2")
  #expect(lane.detail == "Simulator is not booted")
}

@Test func mapsEverySoloCommandProcessToLaneServices() throws {
  let data = Data(
    #"""
    {
      "data": {
        "processes": [
          { "id": 1, "name": "Bun web", "kind": "command", "status": "running", "projectName": "awraq-lane-1" },
          { "id": 2, "name": "Laravel queues", "kind": "command", "status": "failed", "projectName": "awraq-lane-1" },
          { "id": 3, "name": "Bun mobile", "kind": "command", "status": "stopped", "projectName": "awraq-lane-1" },
          { "id": 4, "name": "Debug shell", "kind": "terminal", "status": "running", "projectName": "awraq-lane-1" },
          { "id": 5, "name": "Mobile", "kind": "command", "status": "running", "projectName": "harium-lane-2" }
        ]
      }
    }
    """#.utf8
  )

  let services = try JSONDecoder().decode(SoloProcessDocument.self, from: data).servicesByProject()

  #expect(services["awraq-lane-1"]?.map(\.name) == ["Web", "Queues", "Mobile"])
  #expect(services["awraq-lane-1"]?.map(\.state) == [.running, .failed, .stopped])
  #expect(services["harium-lane-2"]?.map(\.name) == ["Mobile"])
}

@Test func discoversFrontendAndMetroDevCommandsWithoutSolo() async throws {
  let root = FileManager.default.temporaryDirectory.appending(
    path: "lanes-menu-tests-\(UUID().uuidString)", directoryHint: .isDirectory)
  defer { try? FileManager.default.removeItem(at: root) }
  let laneDirectory = root.appending(path: "awraq-lane-1", directoryHint: .isDirectory)
  let frontendDirectory = laneDirectory.appending(path: "family-tree", directoryHint: .isDirectory)
  let metroDirectory = laneDirectory.appending(path: "mobile", directoryHint: .isDirectory)
  try FileManager.default.createDirectory(at: frontendDirectory, withIntermediateDirectories: true)
  try FileManager.default.createDirectory(at: metroDirectory, withIntermediateDirectories: true)
  try Data(#"{"scripts":{"dev":"vite"}}"#.utf8).write(
    to: frontendDirectory.appending(path: "package.json"))
  try Data(#"{"dependencies":{"expo":"latest"},"scripts":{"dev":"expo start"}}"#.utf8)
    .write(to: metroDirectory.appending(path: "package.json"))

  let lane = LaneItem(
    id: "lane-1",
    number: 1,
    path: laneDirectory.path,
    projectID: "awraq",
    projectName: "Awraq",
    availability: "available",
    health: "ready",
    detail: nil
  )
  let commands = await LaneDevCommandManager(homeDirectory: root).loadCommands(for: [lane])

  #expect(commands[lane.serviceKey]?.map(\.kind) == [.frontend, .metro])
  #expect(commands[lane.serviceKey]?.allSatisfy(\.supportsDev) == true)
  #expect(commands[lane.serviceKey]?.map(\.state) == [.stopped, .stopped])
}

@Test func reportsMetroWithoutADevScriptAsUnavailable() async throws {
  let root = FileManager.default.temporaryDirectory.appending(
    path: "lanes-menu-tests-\(UUID().uuidString)", directoryHint: .isDirectory)
  defer { try? FileManager.default.removeItem(at: root) }
  let laneDirectory = root.appending(path: "awraq-lane-1", directoryHint: .isDirectory)
  let metroDirectory = laneDirectory.appending(path: "mobile", directoryHint: .isDirectory)
  try FileManager.default.createDirectory(at: metroDirectory, withIntermediateDirectories: true)
  try Data(#"{"dependencies":{"expo":"latest"},"scripts":{"start":"expo start"}}"#.utf8)
    .write(to: metroDirectory.appending(path: "package.json"))

  let lane = LaneItem(
    id: "lane-1",
    number: 1,
    path: laneDirectory.path,
    projectID: "awraq",
    projectName: "Awraq",
    availability: "available",
    health: "ready",
    detail: nil
  )
  let commands = await LaneDevCommandManager(homeDirectory: root).loadCommands(for: [lane])
  let metro = try #require(commands[lane.serviceKey]?.first { $0.kind == .metro })

  #expect(metro.supportsDev == false)
  #expect(metro.state == .unavailable)
}

@Test func startsAndStopsBunDevWithoutSolo() async throws {
  let root = FileManager.default.temporaryDirectory.appending(
    path: "lanes-menu-tests-\(UUID().uuidString)", directoryHint: .isDirectory)
  defer { try? FileManager.default.removeItem(at: root) }
  let laneDirectory = root.appending(path: "awraq-lane-1", directoryHint: .isDirectory)
  let frontendDirectory = laneDirectory.appending(path: "frontend", directoryHint: .isDirectory)
  let stateDirectory = root.appending(path: "state", directoryHint: .isDirectory)
  try FileManager.default.createDirectory(at: frontendDirectory, withIntermediateDirectories: true)
  try Data(
    #"{"devDependencies":{"vite":"latest"},"scripts":{"dev":"sleep 30"}}"#
      .utf8
  ).write(to: frontendDirectory.appending(path: "package.json"))

  let lane = LaneItem(
    id: "lane-1",
    number: 1,
    path: laneDirectory.path,
    projectID: "awraq",
    projectName: "Awraq",
    availability: "available",
    health: "ready",
    detail: nil
  )
  let manager = LaneDevCommandManager(
    stateDirectory: stateDirectory,
    bunExecutable: FileManager.default.homeDirectoryForCurrentUser.appending(path: ".bun/bin/bun")
  )
  let initial = await manager.loadCommands(for: [lane])
  let command = try #require(initial[lane.serviceKey]?.first { $0.kind == .frontend })

  do {
    try await manager.start(command)
    let running = await manager.loadCommands(for: [lane])
    #expect(running[lane.serviceKey]?.first { $0.kind == .frontend }?.state == .running)
    try await manager.stop(command.withState(.running))
  } catch {
    try? await manager.stop(command.withState(.running))
    throw error
  }

  let stopped = await manager.loadCommands(for: [lane])
  #expect(stopped[lane.serviceKey]?.first { $0.kind == .frontend }?.state == .stopped)
}
