import Foundation

struct AIUsageCollector: Sendable {
  private let homeDirectory: URL
  private let now: @Sendable () -> Date

  init(
    homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser,
    now: @escaping @Sendable () -> Date = Date.init
  ) {
    self.homeDirectory = homeDirectory
    self.now = now
  }

  func load() async -> [ProviderUsage] {
    async let claude = ClaudeUsageClient(now: now).load()
    let openCode = await OpenCodeUsageClient(now: now).load()
    return [codexUsage(), openCode, await claude]
  }

  func codexUsage() -> ProviderUsage {
    let sessions = homeDirectory.appending(path: ".codex/sessions")
    guard let files = recentJSONLFiles(in: sessions, limit: 40) else {
      return .unavailable(.codex, "No local Codex sessions found.")
    }

    for file in files {
      guard let data = try? Data(contentsOf: file),
        let text = String(data: data, encoding: .utf8)
      else { continue }

      for line in text.split(separator: "\n").reversed() {
        guard let lineData = line.data(using: .utf8),
          let object = try? JSONSerialization.jsonObject(with: lineData) as? [String: Any],
          object["type"] as? String == "event_msg",
          let payload = object["payload"] as? [String: Any],
          payload["type"] as? String == "token_count",
          let limits = payload["rate_limits"] as? [String: Any]
        else { continue }

        let windows = [
          parseCodexWindow(limits["primary"], id: "primary"),
          parseCodexWindow(limits["secondary"], id: "secondary"),
        ].compactMap { $0 }
        guard !windows.isEmpty else { continue }

        let observedAt = ISO8601DateFormatter().date(from: object["timestamp"] as? String ?? "")
        let lowest = windows.map(\.remainingPercent).min() ?? 0
        let reset = windows.compactMap(\.resetsAt).min()
        return ProviderUsage(
          provider: .codex,
          availability: .allowance,
          primaryValue: "\(UsageFormatting.percent(lowest)) remaining",
          summary: reset.map { UsageFormatting.reset($0) } ?? "Current subscription window",
          details: windows.map {
            UsageDetail(label: $0.title, value: "\(UsageFormatting.percent($0.remainingPercent)) left")
          },
          windows: windows,
          observedAt: observedAt,
          error: nil
        )
      }
    }
    return .unavailable(.codex, "No recent allowance snapshot found.")
  }

  private func parseCodexWindow(_ value: Any?, id: String) -> UsageWindow? {
    guard let object = value as? [String: Any],
      let usedPercent = number(object["used_percent"]),
      let windowMinutes = number(object["window_minutes"])
    else { return nil }
    let resetTimestamp = number(object["resets_at"])
    return UsageWindow(
      id: id,
      title: Self.windowTitle(minutes: windowMinutes),
      usedPercent: usedPercent,
      resetsAt: resetTimestamp.map(Date.init(timeIntervalSince1970:))
    )
  }

  private func recentJSONLFiles(
    in root: URL,
    limit: Int? = nil
  ) -> [URL]? {
    guard let enumerator = FileManager.default.enumerator(
      at: root,
      includingPropertiesForKeys: [.contentModificationDateKey, .isRegularFileKey],
      options: [.skipsHiddenFiles]
    ) else { return nil }
    var entries: [(URL, Date)] = []
    for case let file as URL in enumerator where file.pathExtension == "jsonl" {
      guard let values = try? file.resourceValues(forKeys: [.contentModificationDateKey, .isRegularFileKey]),
        values.isRegularFile == true,
        let modified = values.contentModificationDate
      else { continue }
      entries.append((file, modified))
    }
    let sorted = entries.sorted { $0.1 > $1.1 }.map(\.0)
    return limit.map { Array(sorted.prefix($0)) } ?? sorted
  }

  private func number(_ value: Any?) -> Double? {
    if let value = value as? NSNumber { return value.doubleValue }
    if let value = value as? String { return Double(value) }
    return nil
  }

  static func windowTitle(minutes: Double) -> String {
    if minutes >= 10_080 { return "Weekly" }
    if minutes >= 1_440 { return "Daily" }
    if minutes >= 60 { return "\(Int(minutes / 60))-hour" }
    return "\(Int(minutes))-minute"
  }

}
