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
  #expect(lane.id == "awraq/lane-2")
  #expect(lane.laneID == "lane-2")
  #expect(lane.detail == "Simulator is not booted")
}

@Test func decodesTheSharedLanesServiceContract() throws {
  let data = Data(
    #"""
    {
      "lanes": [
        {
          "project": "awraq",
          "lane": "lane-1",
          "path": "/projects/awraq-lane-1",
          "services": [
            { "id": "site", "name": "Site", "state": "running", "manageable": false, "managed": false, "detail": "HTTP 200 OK" },
            { "id": "frontend", "name": "Frontend", "state": "running", "manageable": true, "managed": true, "command": "bun dev" },
            { "id": "metro", "name": "Metro", "state": "stopped", "manageable": true, "managed": false, "command": "bun start:lane" },
            { "id": "horizon", "name": "Horizon", "state": "failed", "manageable": true, "managed": true, "command": "php artisan horizon" }
          ]
        }
      ]
    }
    """#.utf8
  )

  let services = try JSONDecoder().decode(LaneServicesDocument.self, from: data).servicesByLane()
  let lane = try #require(services["awraq/lane-1"])

  #expect(lane.map(\.name) == ["Site", "Frontend", "Metro", "Horizon"])
  #expect(lane.map(\.state) == [.running, .running, .stopped, .failed])
  #expect(lane.filter(\.manageable).count == 3)
  #expect(lane.first?.detail == "HTTP 200 OK")
  #expect(lane.first { $0.id == "frontend" }?.managed == true)
}
