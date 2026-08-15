import Foundation

struct LaneProject: Identifiable, Sendable {
  let id: String
  let name: String
  let lanes: [LaneItem]
}

struct LaneItem: Identifiable, Sendable {
  let laneID: String
  let number: Int
  let path: String
  let kind: LaneKind
  let projectID: String
  let projectName: String
  let health: LaneHealth
  let healthReason: String?

  var id: String { serviceKey }
  var serviceKey: String { "\(projectID)/\(laneID)" }
  var isCanonical: Bool { kind == .canonical }
  var isDestroyable: Bool { kind == .task }

  var displayName: String {
    laneID == "main"
      ? "Main"
      : laneID.split(separator: "-").map { $0.capitalized }.joined(separator: " ")
  }

  var appURL: URL {
    URL(string: "https://\(projectID)-\(laneID).test")!
  }

  var simulatorName: String {
    isCanonical ? "\(projectName) Main" : "\(projectName) \(laneID)"
  }
}

enum LaneKind: String, Decodable, Sendable {
  case canonical
  case task

  var title: String {
    switch self {
    case .canonical: "Canonical"
    case .task: "Task"
    }
  }
}

enum LaneHealth: String, Decodable, Sendable {
  case ready
  case drifted
  case broken

  var title: String { rawValue.capitalized }
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

  var title: String { rawValue.capitalized }
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
  let health: LaneHealth
  let healthReason: String?

  var item: LaneItem {
    LaneItem(
      laneID: lane.id,
      number: lane.number,
      path: lane.path,
      kind: lane.kind,
      projectID: lane.project.id,
      projectName: lane.project.name,
      health: health,
      healthReason: healthReason
    )
  }
}

struct LaneRecord: Decodable {
  let id: String
  let number: Int
  let path: String
  let kind: LaneKind
  let project: ProjectRecord
}

struct ProjectRecord: Decodable {
  let id: String
  let name: String
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
