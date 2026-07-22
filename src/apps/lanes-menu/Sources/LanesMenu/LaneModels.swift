import Foundation

struct LaneProject: Identifiable, Sendable {
  let id: String
  let name: String
  let lanes: [LaneItem]
}

struct LaneItem: Identifiable, Sendable {
  let id: String
  let number: Int
  let path: String
  let projectID: String
  let projectName: String
  let availability: String
  let health: String
  let detail: String?

  var appURL: URL {
    URL(string: "https://\(projectID)-\(id).test")!
  }

  var simulatorName: String {
    "\(projectName) Lane \(number)"
  }

  var displayName: String {
    "Lane \(number)"
  }

  var serviceKey: String {
    "\(projectID)/\(id)"
  }

  var soloProjectName: String {
    "\(projectID)-\(id)"
  }
}

struct LaneService: Identifiable, Sendable, Equatable {
  let id: String
  let name: String
  var state: LaneServiceState
}

struct LaneDevCommand: Identifiable, Sendable, Equatable {
  let id: String
  let laneKey: String
  let kind: LaneDevCommandKind
  let directory: URL?
  let supportsDev: Bool
  let state: LaneDevCommandState

  func withState(_ state: LaneDevCommandState) -> LaneDevCommand {
    LaneDevCommand(
      id: id,
      laneKey: laneKey,
      kind: kind,
      directory: directory,
      supportsDev: supportsDev,
      state: state
    )
  }
}

enum LaneDevCommandKind: String, CaseIterable, Sendable {
  case frontend
  case metro

  var title: String {
    rawValue.capitalized
  }
}

enum LaneDevCommandState: String, Sendable, Equatable {
  case starting
  case running
  case stopping
  case stopped
  case unavailable

  var title: String {
    switch self {
    case .unavailable: "Missing dev script"
    default: rawValue.capitalized
    }
  }
}

enum LaneServiceState: String, Sendable, Equatable {
  case checking
  case running
  case starting
  case stopped
  case failed
  case unavailable

  var title: String {
    rawValue.capitalized
  }

  fileprivate init(soloStatus: String) {
    switch soloStatus {
    case "running": self = .running
    case "starting": self = .starting
    case "stopped", "stopping": self = .stopped
    case "failed", "exited": self = .failed
    default: self = .unavailable
    }
  }
}

struct SoloProcessDocument: Decodable {
  let data: SoloProcessData

  func servicesByProject() -> [String: [LaneService]] {
    data.processes.reduce(into: [:]) { services, process in
      guard process.kind == "command" else { return }
      services[process.projectName, default: []].append(
        LaneService(
          id: "solo-\(process.id)",
          name: process.displayName,
          state: LaneServiceState(soloStatus: process.status)
        )
      )
    }
  }
}

struct SoloProcessData: Decodable {
  let processes: [SoloProcessRecord]
}

struct SoloProcessRecord: Decodable {
  let id: Int
  let name: String
  let kind: String
  let status: String
  let projectName: String

  var displayName: String {
    let normalized = name.lowercased()
    if normalized.contains("queue") { return "Queues" }
    if normalized.contains("mobile") { return "Mobile" }
    if normalized.contains("web") { return "Web" }
    return name.hasPrefix("Bun ") ? String(name.dropFirst(4)) : name
  }
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
      id: lane.id,
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

enum LaneAction: String, Sendable {
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
}
