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
  let projectID: String
  let projectName: String
  let availability: String
  let health: String
  let detail: String?

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

  var id: String { serviceKey }
}

struct LaneService: Identifiable, Sendable, Equatable {
  let id: String
  let name: String
  let manageable: Bool
  let managed: Bool
  let command: String?
  let detail: String?
  var state: LaneServiceState

  func withState(_ state: LaneServiceState) -> LaneService {
    LaneService(
      id: id,
      name: name,
      manageable: manageable,
      managed: managed,
      command: command,
      detail: detail,
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
  let health: String
  let occupancyReason: String?
  let healthReason: String?

  var item: LaneItem {
    LaneItem(
      laneID: lane.id,
      number: lane.number,
      path: lane.path,
      projectID: lane.project.id,
      projectName: lane.project.name,
      availability: availability,
      health: health,
      detail: conciseDetail
    )
  }

  private var conciseDetail: String? {
    let detail = healthReason ?? occupancyReason
    guard let firstLine = detail?.split(separator: "\n", maxSplits: 1).first else {
      return nil
    }
    let value = String(firstLine)
    return value.count > 110 ? "\(value.prefix(107))…" : value
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
}

enum LaneAction: String, CaseIterable, Sendable {
  case editor
  case simulator
  case browser

  var title: String {
    switch self {
    case .editor: "PhpStorm"
    case .simulator: "Simulator"
    case .browser: "Browser"
    }
  }

  var systemImage: String {
    switch self {
    case .editor: "chevron.left.forwardslash.chevron.right"
    case .simulator: "iphone"
    case .browser: "globe"
    }
  }

  var cliTarget: String {
    switch self {
    case .editor: "phpstorm"
    case .simulator: "simulator"
    case .browser: "browser"
    }
  }
}
