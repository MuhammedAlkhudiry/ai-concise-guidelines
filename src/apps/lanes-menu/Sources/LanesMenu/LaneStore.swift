import Combine
import Foundation

@MainActor
final class LaneStore: ObservableObject {
  @Published private(set) var projects: [LaneProject] = []
  @Published private(set) var serviceStatuses: [String: [LaneService]] = [:]
  @Published private(set) var isRefreshing = false
  @Published private(set) var activeAction: String?
  @Published private(set) var activeService: String?
  @Published private(set) var destroyingLaneKeys: Set<String> = []
  @Published var errorMessage: String?

  private let client: LaneCommandClient
  private var refreshRequested = false

  init(client: LaneCommandClient = LaneCommandClient()) {
    self.client = client
  }

  func refresh() {
    guard !isRefreshing else {
      refreshRequested = true
      return
    }
    isRefreshing = true
    Task {
      defer {
        isRefreshing = false
        if refreshRequested {
          refreshRequested = false
          refresh()
        }
      }
      do {
        projects = try await client.loadProjects()
        let lanes = projects.flatMap(\.lanes).filter { !isDestroying($0) }
        serviceStatuses = Dictionary(
          uniqueKeysWithValues: lanes.map { ($0.serviceKey, [LaneService.checking]) }
        )
        await refreshServiceStatuses(for: lanes)
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func perform(_ action: LaneAction, on lane: LaneItem) {
    let actionID = "\(lane.id)/\(action.rawValue)"
    guard activeAction == nil else { return }
    activeAction = actionID
    Task {
      defer { activeAction = nil }
      do {
        try await client.perform(action, on: lane)
        errorMessage = nil
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func isPerforming(_ action: LaneAction, on lane: LaneItem) -> Bool {
    activeAction == "\(lane.id)/\(action.rawValue)"
  }

  func repair(_ lane: LaneItem) {
    guard activeAction == nil, activeService == nil else { return }
    activeAction = "\(lane.id)/repair"
    Task {
      do {
        try await client.repair(lane)
        activeAction = nil
        errorMessage = nil
        refresh()
      } catch {
        activeAction = nil
        errorMessage = error.localizedDescription
      }
    }
  }

  func isRepairing(_ lane: LaneItem) -> Bool {
    activeAction == "\(lane.id)/repair"
  }

  func destroy(_ lane: LaneItem) {
    guard lane.isDestroyable, activeAction == nil, activeService == nil, !isDestroying(lane)
    else { return }
    destroyingLaneKeys.insert(lane.serviceKey)
    errorMessage = nil
    Task {
      do {
        try await client.destroy(lane)
        removeLaneFromLocalState(lane)
      } catch {
        errorMessage = error.localizedDescription
      }
      destroyingLaneKeys.remove(lane.serviceKey)
      refresh()
    }
  }

  func isDestroying(_ lane: LaneItem) -> Bool {
    destroyingLaneKeys.contains(lane.serviceKey)
  }

  func services(for lane: LaneItem) -> [LaneService] {
    serviceStatuses[lane.serviceKey] ?? [.checking]
  }

  func serviceSummary(for lane: LaneItem) -> LaneServiceSummary {
    LaneServiceSummary.summarize(services(for: lane))
  }

  func compactServiceActivity(for lane: LaneItem) -> String {
    let running = services(for: lane).count { $0.state == .running || $0.state == .starting }
    return running > 0 ? "\(running) running" : serviceSummary(for: lane).title
  }

  func serviceActivity(for lane: LaneItem) -> String {
    let statuses = services(for: lane)
    let running = statuses.count { $0.state == .running || $0.state == .starting }
    let stopped = statuses.count { $0.state == .stopped || $0.state == .stopping }
    guard running > 0, stopped > 0 else { return serviceSummary(for: lane).title }
    return "\(running) running · \(stopped) stopped"
  }

  func residentBytes(for lane: LaneItem) -> Int64? {
    let total = services(for: lane).compactMap(\.residentBytes).reduce(0, +)
    return total > 0 ? total : nil
  }

  var totalResidentBytes: Int64? {
    let total = serviceStatuses.values.flatMap { $0 }.compactMap(\.residentBytes).reduce(0, +)
    return total > 0 ? total : nil
  }

  func hasRunningServices(on lane: LaneItem) -> Bool {
    services(for: lane).contains {
      $0.manageable && ($0.state == .running || $0.state == .starting)
    }
  }

  func hasRunningServices(in project: LaneProject) -> Bool {
    project.lanes.contains(where: hasRunningServices)
  }

  func canControlServices(on lane: LaneItem) -> Bool {
    services(for: lane).contains { $0.manageable && $0.state != .unavailable }
  }

  func toggle(_ service: LaneService, on lane: LaneItem) {
    guard service.manageable, activeService == nil else { return }
    activeService = "\(lane.serviceKey)/\(service.id)"
    replaceService(service.withState(service.state == .running ? .stopping : .starting), on: lane)
    Task {
      defer { activeService = nil }
      do {
        serviceStatuses[lane.serviceKey] = try await client.setService(
          service,
          running: service.state != .running,
          on: lane
        )
        errorMessage = nil
      } catch {
        await recoverServices(for: lane, error: error)
      }
    }
  }

  func restart(_ service: LaneService, on lane: LaneItem) {
    guard service.manageable, service.state == .running, activeService == nil else { return }
    activeService = "\(lane.serviceKey)/\(service.id)"
    replaceService(service.withState(.starting), on: lane)
    Task {
      defer { activeService = nil }
      do {
        serviceStatuses[lane.serviceKey] = try await client.restartService(service, on: lane)
        errorMessage = nil
      } catch {
        await recoverServices(for: lane, error: error)
      }
    }
  }

  func setLaneServices(running: Bool, on lane: LaneItem) {
    guard canControlServices(on: lane), activeService == nil else { return }
    activeService = "\(lane.serviceKey)/all"
    replaceManageableServices(on: lane, with: running ? .starting : .stopping)
    Task {
      defer { activeService = nil }
      do {
        serviceStatuses[lane.serviceKey] = try await client.setLaneServices(
          running: running,
          on: lane
        )
        errorMessage = nil
      } catch {
        await recoverServices(for: lane, error: error)
      }
    }
  }

  func setProjectServices(running: Bool, in project: LaneProject) {
    guard project.lanes.contains(where: canControlServices), activeService == nil else { return }
    activeService = "\(project.id)/all/all"
    for lane in project.lanes {
      replaceManageableServices(on: lane, with: running ? .starting : .stopping)
    }
    Task {
      defer { activeService = nil }
      do {
        serviceStatuses.merge(
          try await client.setProjectServices(running: running, projectID: project.id)
        ) { _, new in new }
        errorMessage = nil
      } catch {
        serviceStatuses = (try? await client.loadServiceStatuses()) ?? serviceStatuses
        errorMessage = error.localizedDescription
      }
    }
  }

  func latestLogs(for service: LaneService, on lane: LaneItem) async -> String {
    if !service.manageable {
      return service.detail ?? "\(service.name) is \(service.state.title.lowercased())."
    }
    return await client.latestLogs(for: service, on: lane)
  }

  private func refreshServiceStatuses(for lanes: [LaneItem]) async {
    do {
      let loaded = try await client.loadServiceStatuses()
      serviceStatuses = Dictionary(
        uniqueKeysWithValues: lanes.map { ($0.serviceKey, loaded[$0.serviceKey] ?? []) }
      )
      errorMessage = nil
    } catch {
      let unavailable = LaneService.unavailable(error.localizedDescription)
      serviceStatuses = Dictionary(
        uniqueKeysWithValues: lanes.map { ($0.serviceKey, [unavailable]) }
      )
      errorMessage = error.localizedDescription
    }
  }

  private func recoverServices(for lane: LaneItem, error: Error) async {
    if let services = try? await client.loadServices(for: lane) {
      serviceStatuses[lane.serviceKey] = services
    }
    errorMessage = error.localizedDescription
  }

  private func replaceService(_ service: LaneService, on lane: LaneItem) {
    guard let index = serviceStatuses[lane.serviceKey]?.firstIndex(where: { $0.id == service.id })
    else { return }
    serviceStatuses[lane.serviceKey]?[index] = service
  }

  private func replaceManageableServices(on lane: LaneItem, with state: LaneServiceState) {
    serviceStatuses[lane.serviceKey] = serviceStatuses[lane.serviceKey]?.map { service in
      service.manageable && service.state != .unavailable ? service.withState(state) : service
    }
  }

  private func removeLaneFromLocalState(_ lane: LaneItem) {
    projects = projects.compactMap { project in
      guard project.id == lane.projectID else { return project }
      let remaining = project.lanes.filter { $0.id != lane.id }
      return remaining.isEmpty
        ? nil
        : LaneProject(id: project.id, name: project.name, lanes: remaining)
    }
    serviceStatuses[lane.serviceKey] = nil
  }
}

extension LaneService {
  fileprivate static let checking = LaneService(
    id: "status",
    name: "Services",
    manageable: false,
    managed: false,
    command: nil,
    detail: nil,
    residentBytes: nil,
    state: .checking
  )

  fileprivate static func unavailable(_ detail: String) -> LaneService {
    LaneService(
      id: "status",
      name: "Services",
      manageable: false,
      managed: false,
      command: nil,
      detail: detail,
      residentBytes: nil,
      state: .unavailable
    )
  }
}
