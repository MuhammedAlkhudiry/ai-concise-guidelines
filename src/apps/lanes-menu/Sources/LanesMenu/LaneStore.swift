import Combine
import Foundation

@MainActor
final class LaneStore: ObservableObject {
  @Published private(set) var projects: [LaneProject] = []
  @Published private(set) var isRefreshing = false
  @Published private(set) var activeAction: String?
  @Published private(set) var activeDevCommand: String?
  @Published private(set) var serviceStatuses: [String: [LaneService]] = [:]
  @Published private(set) var devCommands: [String: [LaneDevCommand]] = [:]
  @Published var errorMessage: String?

  private let client: LaneCommandClient
  private let devCommandManager: LaneDevCommandManager

  init(
    client: LaneCommandClient = LaneCommandClient(),
    devCommandManager: LaneDevCommandManager = LaneDevCommandManager()
  ) {
    self.client = client
    self.devCommandManager = devCommandManager
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
            (lane.serviceKey, [LaneService(id: "site", name: "Site", state: .checking)])
          }
        )
        async let refreshedServices = client.loadServiceStatuses(for: projects)
        async let refreshedCommands = devCommandManager.loadCommands(for: projects.flatMap(\.lanes))
        serviceStatuses = await refreshedServices
        devCommands = await refreshedCommands
        errorMessage = nil
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func perform(_ action: LaneAction, on lane: LaneItem) {
    let actionID = "\(lane.projectID)/\(lane.id)/\(action.rawValue)"
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
    activeAction == "\(lane.projectID)/\(lane.id)/\(action.rawValue)"
  }

  func services(for lane: LaneItem) -> [LaneService] {
    serviceStatuses[lane.serviceKey] ?? [
      LaneService(id: "site", name: "Site", state: .checking)
    ]
  }

  func commands(for lane: LaneItem) -> [LaneDevCommand] {
    devCommands[lane.serviceKey]
      ?? LaneDevCommandKind.allCases.map { kind in
        LaneDevCommand(
          id: "\(lane.serviceKey)/\(kind.rawValue)",
          laneKey: lane.serviceKey,
          kind: kind,
          directory: nil,
          supportsDev: false,
          state: .unavailable
        )
      }
  }

  func toggle(_ command: LaneDevCommand) {
    guard activeDevCommand == nil else { return }
    activeDevCommand = command.id
    replaceCommand(command.withState(command.state == .running ? .stopping : .starting))
    Task {
      defer { activeDevCommand = nil }
      do {
        if command.state == .running {
          try await devCommandManager.stop(command)
        } else {
          try await devCommandManager.start(command)
        }
        devCommands = await devCommandManager.loadCommands(for: projects.flatMap(\.lanes))
        errorMessage = nil
      } catch {
        devCommands = await devCommandManager.loadCommands(for: projects.flatMap(\.lanes))
        errorMessage = error.localizedDescription
      }
    }
  }

  private func replaceCommand(_ command: LaneDevCommand) {
    guard let index = devCommands[command.laneKey]?.firstIndex(where: { $0.id == command.id })
    else {
      return
    }
    devCommands[command.laneKey]?[index] = command
  }
}
