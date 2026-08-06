import Foundation

@MainActor
final class AdsStore: ObservableObject {
  @Published private(set) var platforms: [AdsPlatformSnapshot] = []
  @Published private(set) var projects: [AdsProject] = []
  @Published private(set) var isRefreshing = false
  @Published var errorMessage: String?
  @Published var period: AdsPeriod = .sevenDays
  @Published var selectedProjectID = "all"
  @Published private(set) var selectedCampaignIDs: [String: String] = [:]

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
        var platformStats = stats.platforms
        for (platform, campaign) in selectedCampaignIDs {
          let filtered = try await client.loadStats(
            period: period,
            project: selectedProjectID == "all" ? nil : selectedProjectID,
            platform: platform,
            campaign: campaign,
            refresh: bypassingCache
          )
          if let replacement = filtered.platforms.first,
            let index = platformStats.firstIndex(where: { $0.platform == platform })
          {
            platformStats[index] = replacement
          }
        }
        platforms = status.platforms.map { access in
          AdsPlatformSnapshot(
            access: access,
            stats: platformStats.first { $0.platform == access.platform },
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
    selectedCampaignIDs = [:]
    refresh()
  }

  func selectedCampaignID(for platform: String) -> String? {
    selectedCampaignIDs[platform]
  }

  func selectCampaign(_ campaignID: String?, for platform: String) {
    if let campaignID {
      selectedCampaignIDs[platform] = campaignID
    } else {
      selectedCampaignIDs.removeValue(forKey: platform)
    }
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
