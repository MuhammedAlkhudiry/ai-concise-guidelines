import Combine
import Foundation

@MainActor
final class LaneStore: ObservableObject {
  @Published private(set) var projects: [LaneProject] = []
  @Published private(set) var isRefreshing = false
  @Published private(set) var activeAction: String?
  @Published private(set) var activeService: String?
  @Published private(set) var serviceStatuses: [String: [LaneService]] = [:]
  @Published var errorMessage: String?

  private let client: LaneCommandClient

  init(client: LaneCommandClient = LaneCommandClient()) {
    self.client = client
  }

  func refresh() {
    guard !isRefreshing else { return }
    isRefreshing = true
    Task {
      defer { isRefreshing = false }
      do {
        projects = try await client.loadProjects()
        serviceStatuses = Dictionary(
          uniqueKeysWithValues: projects.flatMap(\.lanes).map { lane in
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
        serviceStatuses = try await client.loadServiceStatuses()
        errorMessage = nil
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
        try await client.setService(service, running: service.state != .running, on: lane)
        serviceStatuses = try await client.loadServiceStatuses()
        errorMessage = nil
      } catch {
        serviceStatuses = (try? await client.loadServiceStatuses()) ?? serviceStatuses
        errorMessage = error.localizedDescription
      }
    }
  }

  func latestLogs(for service: LaneService, on lane: LaneItem) async -> String {
    if !service.manageable {
      return service.detail ?? "\(service.name) health check is \(service.state.title.lowercased())."
    }
    return await client.latestLogs(for: service, on: lane)
  }

  private func replaceService(_ service: LaneService, on lane: LaneItem) {
    guard
      let index = serviceStatuses[lane.serviceKey]?.firstIndex(where: { $0.id == service.id })
    else { return }
    serviceStatuses[lane.serviceKey]?[index] = service
  }
}
