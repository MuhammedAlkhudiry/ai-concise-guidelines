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
            "project": { "id": "awraq", "name": "Awraq", "baseBranch": "main" }
          },
          "availability": "occupied",
          "health": "broken",
          "branch": "codex/example",
          "baseBranchAhead": 3,
          "baseBranchBehind": 2,
          "gitDiff": { "additions": 12, "deletions": 4, "untrackedFiles": 1 },
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
  #expect(lane.branch == "codex/example")
  #expect(lane.branchName == "codex/example")
  #expect(lane.baseBranchAhead == 3)
  #expect(lane.baseBranchBehind == 2)
  #expect(lane.baseSyncState == .unavailable)
  #expect(lane.gitDiff?.additions == 12)
  #expect(lane.gitDiff?.deletions == 4)
  #expect(lane.gitDiff?.untrackedFiles == 1)
}

@Test func identifiesAvailableLanesBehindTheBaseBranch() throws {
  let latest = LaneItem(
    laneID: "lane-1",
    number: 1,
    path: "/projects/lane-1",
    projectID: "project",
    projectName: "Project",
    baseBranch: "main",
    availability: "available",
    branch: "main",
    baseBranchAhead: 0,
    baseBranchBehind: 0,
    gitDiff: nil
  )
  let behind = LaneItem(
    laneID: "lane-2",
    number: 2,
    path: "/projects/lane-2",
    projectID: "project",
    projectName: "Project",
    baseBranch: "main",
    availability: "available",
    branch: "main",
    baseBranchAhead: 0,
    baseBranchBehind: 2,
    gitDiff: nil
  )
  let project = LaneProject(id: "project", name: "Project", lanes: [latest, behind])

  #expect(latest.baseSyncState == .latest)
  #expect(behind.baseSyncState == .behind(2))
  #expect(project.availableLanes.map(\.laneID) == ["lane-1", "lane-2"])
}

@Test func identifiesWhetherALaneHasChangesToPropose() {
  let cleanBranch = LaneItem(
    laneID: "lane-1",
    number: 1,
    path: "/projects/lane-1",
    projectID: "project",
    projectName: "Project",
    baseBranch: "main",
    availability: "occupied",
    branch: "feature/clean",
    baseBranchAhead: 0,
    baseBranchBehind: 0,
    gitDiff: nil
  )
  let committedBranch = LaneItem(
    laneID: "lane-2",
    number: 2,
    path: "/projects/lane-2",
    projectID: "project",
    projectName: "Project",
    baseBranch: "main",
    availability: "occupied",
    branch: "feature/committed",
    baseBranchAhead: 1,
    baseBranchBehind: 0,
    gitDiff: nil
  )
  let workingTreeBranch = LaneItem(
    laneID: "lane-3",
    number: 3,
    path: "/projects/lane-3",
    projectID: "project",
    projectName: "Project",
    baseBranch: "main",
    availability: "occupied",
    branch: "feature/working-tree",
    baseBranchAhead: 0,
    baseBranchBehind: 0,
    gitDiff: LaneGitDiff(additions: 0, deletions: 0, untrackedFiles: 1)
  )

  #expect(!cleanBranch.hasProposableChanges)
  #expect(committedBranch.hasProposableChanges)
  #expect(workingTreeBranch.hasWorkingTreeChanges)
  #expect(workingTreeBranch.hasProposableChanges)
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
  #expect(LaneServiceSummary.summarize(lane) == .failed)
}

@Test func summarizesLaneServiceHealth() {
  func services(_ states: LaneServiceState...) -> [LaneService] {
    states.enumerated().map { index, state in
      LaneService(
        id: "service-\(index)",
        name: "Service \(index)",
        manageable: true,
        managed: true,
        command: nil,
        detail: nil,
        state: state
      )
    }
  }

  #expect(LaneServiceSummary.summarize(services(.running, .running)) == .running)
  #expect(LaneServiceSummary.summarize(services(.running, .stopped)) == .partial)
  #expect(LaneServiceSummary.summarize(services(.stopped, .stopped)) == .stopped)
  #expect(LaneServiceSummary.summarize(services(.running, .starting)) == .changing)
  #expect(LaneServiceSummary.summarize(services(.running, .failed)) == .failed)
  #expect(LaneServiceSummary.summarize([]) == .checking)
}

@Test func decodesProjectLaneCiStatuses() throws {
  let data = Data(
    #"{"lanes":[{"project":"awraq","lane":"lane-2","branch":"codex/example","state":"passing","url":"https://github.com/example/repo/pull/1","number":1,"checks":6},{"project":"awraq","lane":"lane-3","branch":"codex/merged","state":"merged","url":"https://github.com/example/repo/pull/2","number":2,"checks":6}]}"#.utf8
  )

  let statuses = try JSONDecoder().decode(LaneCiDocument.self, from: data).statusesByLane()
  let status = try #require(statuses["awraq/lane-2"])

  #expect(status.state == .passing)
  #expect(status.state.title == "CI passing")
  #expect(status.number == 1)
  #expect(status.checks == 6)
  #expect(status.url?.absoluteString == "https://github.com/example/repo/pull/1")
  #expect(statuses["awraq/lane-3"]?.state == .merged)
  #expect(statuses["awraq/lane-3"]?.state.title == "Merged")
}

@Test func decodesPullRequestCreationProgressEvents() throws {
  let progress = try JSONDecoder().decode(
    PullRequestCreationEvent.self,
    from: #"{"type":"progress","stage":"generating"}"#.data(using: .utf8)!
  )
  let complete = try JSONDecoder().decode(
    PullRequestCreationEvent.self,
    from: #"{"type":"complete","project":"awraq","lane":"lane-4","branch":"feature/example","url":"https://github.com/example/repo/pull/4"}"#.data(using: .utf8)!
  )

  #expect(progress.stage == .generating)
  #expect(progress.stage?.title == "Generating commit and PR copy…")
  #expect(complete.url?.absoluteString == "https://github.com/example/repo/pull/4")
}
