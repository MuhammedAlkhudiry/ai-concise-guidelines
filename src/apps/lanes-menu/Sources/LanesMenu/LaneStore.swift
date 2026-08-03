import AppKit
import Combine
import Foundation

@MainActor
final class LaneStore: ObservableObject {
  @Published private(set) var projects: [LaneProject] = []
  @Published private(set) var isRefreshing = false
  @Published private(set) var activeAction: String?
  @Published private(set) var activeService: String?
  @Published private(set) var syncingLaneIDs: Set<String> = []
  @Published private(set) var destroyingLaneKeys: Set<String> = []
  @Published private(set) var cleanupJobs: [LaneCleanupJob] = []
  @Published private(set) var serviceStatuses: [String: [LaneService]] = [:]
  @Published private(set) var ciStatuses: [String: LaneCiStatus] = [:]
  @Published private(set) var pullRequestCreationStages: [String: PullRequestCreationStage] = [:]
  @Published var errorMessage: String?

  private let client: LaneCommandClient
  private var ciLoadedAt: [String: Date] = [:]
  private var refreshRequested = false
  private var cleanupRefreshTask: Task<Void, Never>?
  private let ciCacheLifetime: TimeInterval = 60

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
        async let loadedCleanupJobs = client.loadCleanupJobs()
        projects = try await client.loadProjects()
        cleanupJobs = (try? await loadedCleanupJobs) ?? cleanupJobs
        let lanes = projects.flatMap(\.lanes).filter { !isDestroying($0) }
        serviceStatuses = Dictionary(
          uniqueKeysWithValues: lanes.map { lane in
            (
              lane.serviceKey,
              [
                LaneService(
                  id: "site",
                  name: "Site",
                  manageable: false,
                  managed: false,
                  command: nil,
                  detail: nil,
                  state: .checking
                )
              ]
            )
          }
        )
        ciStatuses = Dictionary(
          uniqueKeysWithValues: lanes.map { lane in
            (lane.serviceKey, ciStatuses[lane.serviceKey] ?? .checking(for: lane))
          }
        )
        let now = Date()
        let staleCiProjects = projects.filter { project in
          guard !project.lanes.contains(where: isDestroying) else { return false }
          guard
            let loadedAt = ciLoadedAt[project.id],
            now.timeIntervalSince(loadedAt) < ciCacheLifetime
          else { return true }
          return !project.lanes.allSatisfy { lane in
            ciStatuses[lane.serviceKey]?.branch == lane.branchName
          }
        }
        for project in staleCiProjects {
          for lane in project.lanes {
            ciStatuses[lane.serviceKey] = .checking(for: lane)
          }
        }
        await refreshLiveStatuses(for: lanes, ciProjects: staleCiProjects)
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

  func services(for lane: LaneItem) -> [LaneService] {
    serviceStatuses[lane.serviceKey] ?? [
      LaneService(
        id: "site",
        name: "Site",
        manageable: false,
        managed: false,
        command: nil,
        detail: nil,
        state: .checking
      )
    ]
  }

  func serviceSummary(for lane: LaneItem) -> LaneServiceSummary {
    LaneServiceSummary.summarize(services(for: lane))
  }

  func residentBytes(for lane: LaneItem) -> Int64? {
    let total = services(for: lane).compactMap(\.residentBytes).reduce(0, +)
    return total > 0 ? total : nil
  }

  var totalResidentBytes: Int64? {
    let total = serviceStatuses.values
      .flatMap { $0 }
      .compactMap(\.residentBytes)
      .reduce(0, +)
    return total > 0 ? total : nil
  }

  func ciStatus(for lane: LaneItem) -> LaneCiStatus {
    ciStatuses[lane.serviceKey] ?? .checking(for: lane)
  }

  func openBranch(for lane: LaneItem) {
    let actionID = "\(lane.id)/branch"
    guard activeAction == nil else { return }
    activeAction = actionID
    Task {
      defer { activeAction = nil }
      do {
        try await client.openBranch(on: lane)
        errorMessage = nil
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func isOpeningBranch(for lane: LaneItem) -> Bool {
    activeAction == "\(lane.id)/branch"
  }

  func openGitHubBranch(for lane: LaneItem) {
    let actionID = "\(lane.id)/github-branch"
    guard activeAction == nil else { return }
    activeAction = actionID
    Task {
      defer { activeAction = nil }
      do {
        try await client.openGitHubBranch(on: lane)
        errorMessage = nil
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func createPullRequest(for lane: LaneItem) {
    let actionID = "\(lane.id)/create-pr"
    guard activeAction == nil else { return }
    activeAction = actionID
    pullRequestCreationStages[lane.id] = .inspecting
    Task {
      defer {
        activeAction = nil
        pullRequestCreationStages[lane.id] = nil
      }
      do {
        let url = try await client.createPullRequest(on: lane) { [weak self] stage in
          self?.pullRequestCreationStages[lane.id] = stage
        }
        ciLoadedAt[lane.projectID] = nil
        errorMessage = nil
        NSWorkspace.shared.open(url)
        refresh()
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func isCreatingPullRequest(for lane: LaneItem) -> Bool {
    activeAction == "\(lane.id)/create-pr"
  }

  func pullRequestCreationStage(for lane: LaneItem) -> PullRequestCreationStage? {
    pullRequestCreationStages[lane.id]
  }

  func release(_ lane: LaneItem) {
    guard !lane.hasWorkingTreeChanges, activeAction == nil, activeService == nil,
      !isSyncing(lane)
    else { return }
    activeAction = "\(lane.id)/release"
    Task {
      defer { activeAction = nil }
      do {
        try await client.release(lane)
        errorMessage = nil
        refresh()
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func isReleasing(_ lane: LaneItem) -> Bool {
    activeAction == "\(lane.id)/release"
  }

  func destroy(_ lane: LaneItem) {
    guard lane.isRemovable, activeAction == nil, activeService == nil, !isSyncing(lane),
      !isDestroying(lane)
    else { return }
    destroyingLaneKeys.insert(lane.serviceKey)
    errorMessage = nil
    Task {
      defer { destroyingLaneKeys.remove(lane.serviceKey) }
      do {
        try await client.destroy(lane)
        removeLaneFromLocalState(lane)
        monitorCleanupJobs()
      } catch {
        errorMessage = error.localizedDescription
        refresh()
      }
    }
  }

  func isDestroying(_ lane: LaneItem) -> Bool {
    destroyingLaneKeys.contains(lane.serviceKey)
  }

  func sync(_ lane: LaneItem) {
    guard lane.needsBaseUpdate, activeAction == nil, activeService == nil,
      !syncingLaneIDs.contains(lane.id)
    else { return }
    syncingLaneIDs.insert(lane.id)
    errorMessage = nil
    Task {
      defer {
        syncingLaneIDs.remove(lane.id)
        refresh()
      }
      do {
        try await client.sync(lane)
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func isSyncing(_ lane: LaneItem) -> Bool {
    syncingLaneIDs.contains(lane.id)
  }

  func toggle(_ service: LaneService, on lane: LaneItem) {
    guard service.manageable, activeService == nil else { return }
    activeService = "\(lane.serviceKey)/\(service.id)"
    replaceService(
      service.withState(service.state == .running ? .stopping : .starting),
      on: lane
    )
    Task {
      defer { activeService = nil }
      do {
        serviceStatuses[lane.serviceKey] = try await client.setService(
          service, running: service.state != .running, on: lane)
        errorMessage = nil
      } catch {
        if let services = try? await client.loadServices(for: lane) {
          serviceStatuses[lane.serviceKey] = services
        }
        errorMessage = error.localizedDescription
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
        if let services = try? await client.loadServices(for: lane) {
          serviceStatuses[lane.serviceKey] = services
        }
        errorMessage = error.localizedDescription
      }
    }
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

  func setLaneServices(running: Bool, on lane: LaneItem) {
    guard canControlServices(on: lane), activeService == nil else { return }
    activeService = "\(lane.serviceKey)/all"
    replaceManageableServices(on: lane, with: running ? .starting : .stopping)
    Task {
      defer { activeService = nil }
      do {
        serviceStatuses[lane.serviceKey] = try await client.setLaneServices(
          running: running, on: lane)
        errorMessage = nil
      } catch {
        if let services = try? await client.loadServices(for: lane) {
          serviceStatuses[lane.serviceKey] = services
        }
        errorMessage = error.localizedDescription
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
        let updated = try await client.setProjectServices(running: running, projectID: project.id)
        serviceStatuses.merge(updated) { _, new in new }
        errorMessage = nil
      } catch {
        serviceStatuses = (try? await client.loadServiceStatuses()) ?? serviceStatuses
        errorMessage = error.localizedDescription
      }
    }
  }

  func latestLogs(for service: LaneService, on lane: LaneItem) async -> String {
    if !service.manageable {
      return service.detail
        ?? "\(service.name) health check is \(service.state.title.lowercased())."
    }
    return await client.latestLogs(for: service, on: lane)
  }

  private func replaceService(_ service: LaneService, on lane: LaneItem) {
    guard
      let index = serviceStatuses[lane.serviceKey]?.firstIndex(where: { $0.id == service.id })
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
    ciStatuses[lane.serviceKey] = nil
    ciLoadedAt[lane.projectID] = nil
  }

  private func monitorCleanupJobs() {
    cleanupRefreshTask?.cancel()
    cleanupRefreshTask = Task {
      while !Task.isCancelled {
        if let jobs = try? await client.loadCleanupJobs() {
          cleanupJobs = jobs
          if jobs.isEmpty || jobs.contains(where: { $0.lastError != nil }) { return }
        }
        try? await Task.sleep(for: .seconds(1))
      }
    }
  }

  private func refreshLiveStatuses(for lanes: [LaneItem], ciProjects: [LaneProject]) async {
    let client = client
    var errors: [String] = []
    await withTaskGroup(of: LaneRefreshResult.self) { group in
      for lane in lanes {
        group.addTask {
          do {
            return .services(lane.serviceKey, try await client.loadServices(for: lane), nil)
          } catch {
            let unavailable = LaneService(
              id: "status",
              name: "Services",
              manageable: false,
              managed: false,
              command: nil,
              detail: error.localizedDescription,
              state: .unavailable
            )
            return .services(lane.serviceKey, [unavailable], error.localizedDescription)
          }
        }
      }
      for project in ciProjects {
        group.addTask {
          do {
            return .ci(project.id, try await client.loadCiStatuses(for: project), nil)
          } catch {
            let unavailable = Dictionary(
              uniqueKeysWithValues: project.lanes.map {
                ($0.serviceKey, LaneCiStatus.unavailable(for: $0))
              }
            )
            return .ci(
              project.id,
              unavailable,
              error.localizedDescription
            )
          }
        }
      }

      for await result in group {
        switch result {
        case .services(let key, let services, let error):
          serviceStatuses[key] = services
          if let error { errors.append(error) }
        case .ci(let projectID, let statuses, let error):
          ciStatuses.merge(statuses) { _, new in new }
          if error == nil { ciLoadedAt[projectID] = Date() }
          if let error { errors.append(error) }
        }
      }
    }
    errorMessage = errors.first
  }
}

private enum LaneRefreshResult: Sendable {
  case services(String, [LaneService], String?)
  case ci(String, [String: LaneCiStatus], String?)
}
