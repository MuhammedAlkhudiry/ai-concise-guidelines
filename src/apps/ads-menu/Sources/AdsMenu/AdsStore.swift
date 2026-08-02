import Foundation

@MainActor
final class AdsStore: ObservableObject {
  @Published private(set) var platforms: [AdsPlatformSnapshot] = []
  @Published private(set) var projects: [AdsProject] = []
  @Published private(set) var isRefreshing = false
  @Published var errorMessage: String?
  @Published var period: AdsPeriod = .sevenDays
  @Published var selectedProjectID = "all"

  private let client: AdsCommandClient

  init(client: AdsCommandClient = AdsCommandClient()) {
    self.client = client
  }

  func refresh(bypassingCache: Bool = false) {
    guard !isRefreshing else { return }
    isRefreshing = true
    Task {
      defer { isRefreshing = false }
      do {
        if projects.isEmpty {
          projects = try await client.loadProjects().projects
        }
        let (status, stats, campaigns) = try await client.load(
          period: period,
          project: selectedProjectID == "all" ? nil : selectedProjectID,
          refresh: bypassingCache
        )
        platforms = status.platforms.map { access in
          AdsPlatformSnapshot(
            access: access,
            stats: stats.platforms.first { $0.platform == access.platform },
            campaigns: campaigns.platforms.first { $0.platform == access.platform }?.campaigns ?? []
          )
        }
        errorMessage = nil
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func selectPeriod(_ period: AdsPeriod) {
    self.period = period
    refresh()
  }

  func selectProject(_ projectID: String) {
    selectedProjectID = projectID
    refresh()
  }

  func open(_ platform: String) {
    Task {
      do {
        try await client.open(platform: platform)
        errorMessage = nil
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }
}
