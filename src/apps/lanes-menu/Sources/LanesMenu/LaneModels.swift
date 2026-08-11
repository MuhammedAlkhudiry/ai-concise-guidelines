import Foundation

struct LaneProject: Identifiable, Sendable {
  let id: String
  let name: String
  let lanes: [LaneItem]

  var availableLanes: [LaneItem] {
    lanes.filter { $0.availability == "available" }
  }
}

struct LaneCleanupJob: Identifiable, Decodable, Sendable {
  let id: String
  let laneId: String
  let phase: String
  let attempts: Int
  let lastError: String?
  let project: LaneCleanupProject

  var title: String {
    "\(project.name) · \(laneId.replacingOccurrences(of: "lane-", with: "Lane "))"
  }
}

struct LaneCleanupProject: Decodable, Sendable {
  let id: String
  let name: String
}

struct LaneCleanupDocument: Decodable, Sendable {
  let jobs: [LaneCleanupJob]
}

struct LaneItem: Identifiable, Sendable {
  let laneID: String
  let number: Int
  let path: String
  let projectID: String
  let projectName: String
  let baseBranch: String
  let availability: String
  let branch: String?
  let baseBranchAhead: Int?
  let baseBranchBehind: Int?
  let gitDiff: LaneGitDiff?

  var appURL: URL {
    URL(string: "https://\(projectID)-\(laneID).test")!
  }

  var simulatorName: String {
    "\(projectName) Lane \(number)"
  }

  var displayName: String {
    "Lane \(number)"
  }

  var serviceKey: String {
    "\(projectID)/\(laneID)"
  }

  var branchName: String {
    branch ?? (availability == "available" ? baseBranch : "detached")
  }

  var baseSyncState: LaneBaseSyncState {
    guard availability == "available", let baseBranchBehind else { return .unavailable }
    return baseBranchBehind == 0 ? .latest : .behind(baseBranchBehind)
  }

  var needsBaseUpdate: Bool {
    if case .behind = baseSyncState { return true }
    return false
  }

  var hasWorkingTreeChanges: Bool {
    guard let gitDiff else { return false }
    return gitDiff.additions > 0 || gitDiff.deletions > 0 || gitDiff.untrackedFiles > 0
  }

  var hasProposableChanges: Bool {
    hasWorkingTreeChanges || (baseBranchAhead ?? 0) > 0
  }

  var isRemovable: Bool {
    availability == "available" && !hasWorkingTreeChanges
  }

  var id: String { serviceKey }
}

enum LaneBaseSyncState: Equatable, Sendable {
  case latest
  case behind(Int)
  case unavailable

  var title: String {
    switch self {
    case .latest: "Latest"
    case .behind(let count): "Behind \(count)"
    case .unavailable: "Unknown"
    }
  }
}

struct LaneGitDiff: Decodable, Sendable {
  let additions: Int
  let deletions: Int
  let untrackedFiles: Int

  static let clean = LaneGitDiff(additions: 0, deletions: 0, untrackedFiles: 0)
}

struct LaneCiStatus: Decodable, Sendable {
  let project: String
  let lane: String
  let branch: String
  let state: LaneCiState
  let url: URL?
  let number: Int?
  let checks: Int

  static func checking(for lane: LaneItem) -> LaneCiStatus {
    LaneCiStatus(
      project: lane.projectID,
      lane: lane.laneID,
      branch: lane.branchName,
      state: .checking,
      url: nil,
      number: nil,
      checks: 0
    )
  }

  static func unavailable(for lane: LaneItem) -> LaneCiStatus {
    LaneCiStatus(
      project: lane.projectID,
      lane: lane.laneID,
      branch: lane.branchName,
      state: .unavailable,
      url: nil,
      number: nil,
      checks: 0
    )
  }
}

struct LaneCiDocument: Decodable, Sendable {
  let lanes: [LaneCiStatus]

  func statusesByLane() -> [String: LaneCiStatus] {
    Dictionary(uniqueKeysWithValues: lanes.map { ("\($0.project)/\($0.lane)", $0) })
  }
}

struct CreatedPullRequest: Decodable, Sendable {
  let project: String
  let lane: String
  let branch: String
  let url: URL
}

enum PullRequestCreationStage: String, Decodable, Sendable {
  case inspecting
  case generating
  case committing
  case pushing
  case creating

  var title: String {
    switch self {
    case .inspecting: "Inspecting changes…"
    case .generating: "Generating commit and PR copy…"
    case .committing: "Committing changes…"
    case .pushing: "Pushing branch…"
    case .creating: "Creating pull request…"
    }
  }
}

struct PullRequestCreationEvent: Decodable, Sendable {
  let type: String
  let stage: PullRequestCreationStage?
  let url: URL?
}

enum LaneCiState: String, Decodable, Sendable {
  case checking
  case passing
  case running
  case failed
  case none
  case merged
  case closed
  case noPR = "no-pr"
  case unavailable

  var title: String {
    switch self {
    case .checking: "CI…"
    case .passing: "CI passing"
    case .running: "CI running"
    case .failed: "CI failed"
    case .none: "No checks"
    case .merged: "Merged"
    case .closed: "Closed"
    case .noPR: "No PR"
    case .unavailable: "CI unavailable"
    }
  }
}

enum LaneServiceSummary: String, Sendable {
  case checking
  case running
  case changing
  case partial
  case stopped
  case failed
  case degraded
  case crashLooping = "crash-looping"
  case unreachable
  case unavailable

  var title: String { rawValue.capitalized }

  static func summarize(_ services: [LaneService]) -> LaneServiceSummary {
    let states = services.map(\.state)
    if states.contains(.failed) { return .failed }
    if states.contains(.crashLooping) { return .crashLooping }
    if states.contains(.degraded) { return .degraded }
    if states.contains(.unreachable) { return .unreachable }
    if states.contains(.unavailable) { return .unavailable }
    if states.contains(.starting) || states.contains(.stopping) { return .changing }
    if states.contains(.checking) || states.isEmpty { return .checking }
    if states.allSatisfy({ $0 == .running }) { return .running }
    if states.allSatisfy({ $0 == .stopped }) { return .stopped }
    return .partial
  }
}

struct LaneService: Identifiable, Sendable, Equatable {
  let id: String
  let name: String
  let manageable: Bool
  let managed: Bool
  let command: String?
  let detail: String?
  let residentBytes: Int64?
  var state: LaneServiceState

  init(
    id: String,
    name: String,
    manageable: Bool,
    managed: Bool,
    command: String?,
    detail: String?,
    residentBytes: Int64? = nil,
    state: LaneServiceState
  ) {
    self.id = id
    self.name = name
    self.manageable = manageable
    self.managed = managed
    self.command = command
    self.detail = detail
    self.residentBytes = residentBytes
    self.state = state
  }

  func withState(_ state: LaneServiceState) -> LaneService {
    LaneService(
      id: id,
      name: name,
      manageable: manageable,
      managed: managed,
      command: command,
      detail: detail,
      residentBytes: residentBytes,
      state: state
    )
  }
}

enum LaneServiceState: String, Sendable, Equatable, Decodable {
  case checking
  case running
  case starting
  case stopping
  case stopped
  case failed
  case degraded
  case crashLooping = "crash-looping"
  case unreachable
  case unavailable

  var title: String {
    rawValue.capitalized
  }
}

struct LaneServicesDocument: Decodable {
  let lanes: [LaneServicesRecord]

  func servicesByLane() -> [String: [LaneService]] {
    Dictionary(
      uniqueKeysWithValues: lanes.map { lane in
        (
          "\(lane.project)/\(lane.lane)",
          lane.services.map { service in
            LaneService(
              id: service.id,
              name: service.name,
              manageable: service.manageable,
              managed: service.managed,
              command: service.command,
              detail: service.detail,
              residentBytes: service.residentBytes,
              state: service.state
            )
          }
        )
      }
    )
  }
}

struct LaneServicesRecord: Decodable {
  let project: String
  let lane: String
  let services: [LaneServiceRecord]
}

struct LaneServiceRecord: Decodable {
  let id: String
  let name: String
  let state: LaneServiceState
  let manageable: Bool
  let managed: Bool
  let command: String?
  let detail: String?
  let residentBytes: Int64?
}

struct LaneStatusDocument: Decodable {
  let lanes: [LaneStatusRecord]

  func projects() -> [LaneProject] {
    var projectOrder: [String] = []
    var projectNames: [String: String] = [:]
    var projectLanes: [String: [LaneItem]] = [:]

    for record in lanes {
      let project = record.lane.project
      if projectNames[project.id] == nil {
        projectOrder.append(project.id)
        projectNames[project.id] = project.name
      }
      projectLanes[project.id, default: []].append(record.item)
    }

    return projectOrder.map { projectID in
      LaneProject(
        id: projectID,
        name: projectNames[projectID]!,
        lanes: projectLanes[projectID, default: []].sorted { $0.number < $1.number }
      )
    }
  }
}

struct LaneStatusRecord: Decodable {
  let lane: LaneRecord
  let availability: String
  let branch: String?
  let baseBranchAhead: Int?
  let baseBranchBehind: Int?
  let gitDiff: LaneGitDiff?

  var item: LaneItem {
    LaneItem(
      laneID: lane.id,
      number: lane.number,
      path: lane.path,
      projectID: lane.project.id,
      projectName: lane.project.name,
      baseBranch: lane.project.baseBranch,
      availability: availability,
      branch: branch,
      baseBranchAhead: baseBranchAhead,
      baseBranchBehind: baseBranchBehind,
      gitDiff: gitDiff
    )
  }
}

struct LaneRecord: Decodable {
  let id: String
  let number: Int
  let path: String
  let project: ProjectRecord
}

struct ProjectRecord: Decodable {
  let id: String
  let name: String
  let baseBranch: String
}

enum LaneAction: String, CaseIterable, Sendable {
  case editor
  case finder
  case simulator
  case browser

  var title: String {
    switch self {
    case .editor: "PhpStorm"
    case .finder: "Finder"
    case .simulator: "Simulator"
    case .browser: "Browser"
    }
  }

  var systemImage: String {
    switch self {
    case .editor: "chevron.left.forwardslash.chevron.right"
    case .finder: "folder"
    case .simulator: "iphone"
    case .browser: "globe"
    }
  }

  var cliTarget: String {
    switch self {
    case .editor: "phpstorm"
    case .finder: "finder"
    case .simulator: "simulator"
    case .browser: "browser"
    }
  }
}
