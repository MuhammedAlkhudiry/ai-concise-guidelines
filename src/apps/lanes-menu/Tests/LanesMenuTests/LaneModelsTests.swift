import Foundation
import Testing

@testable import LanesMenu

@Test func decodesCanonicalAndTaskRuntimeEnvironments() throws {
  let data = Data(
    #"""
    {
      "lanes": [
        {
          "lane": {
            "id": "main",
            "number": 0,
            "path": "/projects/awraq-project",
            "kind": "canonical",
            "project": { "id": "awraq", "name": "Awraq", "baseBranch": "main" }
          },
          "health": "ready"
        },
        {
          "lane": {
            "id": "excel-tree-import",
            "number": 2,
            "path": "/worktrees/excel-tree-import",
            "kind": "task",
            "project": { "id": "awraq", "name": "Awraq", "baseBranch": "main" }
          },
          "health": "drifted",
          "healthReason": "shared environment runtime changed; run lanes repair"
        }
      ]
    }
    """#.utf8
  )

  let projects = try JSONDecoder().decode(LaneStatusDocument.self, from: data).projects()
  let main = try #require(projects.first?.lanes.first)
  let task = try #require(projects.first?.lanes.last)

  #expect(projects.count == 1)
  #expect(main.displayName == "Main")
  #expect(main.kind == .canonical)
  #expect(main.number == 0)
  #expect(main.health == .ready)
  #expect(main.appURL.absoluteString == "https://awraq-main.test")
  #expect(main.simulatorName == "Awraq Main")
  #expect(!main.isDestroyable)
  #expect(task.displayName == "Excel Tree Import")
  #expect(task.laneID == "excel-tree-import")
  #expect(task.kind == .task)
  #expect(task.health == .drifted)
  #expect(task.healthReason?.contains("lanes repair") == true)
  #expect(task.simulatorName == "Awraq excel-tree-import")
  #expect(task.isDestroyable)
}

@Test func decodesTheSharedRuntimeServiceContract() throws {
  let data = Data(
    #"{"lanes":[{"project":"awraq","lane":"main","path":"/projects/awraq-project","services":[{"id":"site","name":"Site","state":"running","manageable":false,"managed":false,"detail":"HTTP 200 OK"},{"id":"frontend","name":"Frontend","state":"running","manageable":true,"managed":true,"command":"bun dev","residentBytes":104857600},{"id":"metro","name":"Metro","state":"stopped","manageable":true,"managed":false,"command":"bun start"}]}]}"#.utf8
  )

  let services = try JSONDecoder().decode(LaneServicesDocument.self, from: data).servicesByLane()
  let environment = try #require(services["awraq/main"])

  #expect(environment.map(\.name) == ["Site", "Frontend", "Metro"])
  #expect(environment.map(\.state) == [.running, .running, .stopped])
  #expect(environment.filter(\.manageable).count == 2)
  #expect(environment.first?.detail == "HTTP 200 OK")
  #expect(environment.first { $0.id == "frontend" }?.residentBytes == 104_857_600)
  #expect(LaneServiceSummary.summarize(environment) == .partial)
}

@Test func summarizesRuntimeServiceHealth() {
  func services(_ states: LaneServiceState...) -> [LaneService] {
    states.enumerated().map { index, state in
      LaneService(
        id: "service-\(index)",
        name: "Service \(index)",
        manageable: true,
        managed: true,
        command: nil,
        detail: nil,
        residentBytes: nil,
        state: state
      )
    }
  }

  #expect(LaneServiceSummary.summarize(services(.running, .running)) == .running)
  #expect(LaneServiceSummary.summarize(services(.running, .stopped)) == .partial)
  #expect(LaneServiceSummary.summarize(services(.stopped, .stopped)) == .stopped)
  #expect(LaneServiceSummary.summarize(services(.running, .starting)) == .changing)
  #expect(LaneServiceSummary.summarize(services(.running, .failed)) == .failed)
  #expect(LaneServiceSummary.summarize(services(.running, .degraded)) == .degraded)
  #expect(LaneServiceSummary.summarize(services(.running, .crashLooping)) == .crashLooping)
  #expect(LaneServiceSummary.summarize(services(.running, .unreachable)) == .unreachable)
  #expect(LaneServiceSummary.summarize([]) == .checking)
}
