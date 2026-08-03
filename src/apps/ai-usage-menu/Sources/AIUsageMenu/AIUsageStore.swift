import Foundation

@MainActor
final class AIUsageStore: ObservableObject {
  @Published private(set) var providers: [ProviderUsage] = []
  @Published private(set) var isRefreshing = false
  @Published private(set) var lastRefreshedAt: Date?

  private let collector: AIUsageCollector

  init(collector: AIUsageCollector = AIUsageCollector()) {
    self.collector = collector
  }

  var menuBarTitle: String {
    guard let remaining = providers.compactMap(\.lowestRemainingPercent).min() else { return "AI" }
    return UsageFormatting.percent(remaining)
  }

  func refresh() {
    guard !isRefreshing else { return }
    isRefreshing = true
    Task {
      providers = await collector.load()
      lastRefreshedAt = Date()
      isRefreshing = false
    }
  }

}
