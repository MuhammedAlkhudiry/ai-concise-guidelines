import Foundation
import SwiftUI

enum UsageProvider: String, CaseIterable, Identifiable, Sendable {
  case codex
  case opencodeGo
  case claude

  var id: String { rawValue }

  var name: String {
    switch self {
    case .codex: "Codex"
    case .opencodeGo: "OpenCode Go"
    case .claude: "Claude"
    }
  }

  var icon: String {
    switch self {
    case .codex: "chevron.left.forwardslash.chevron.right"
    case .opencodeGo: "bolt.horizontal.circle"
    case .claude: "sparkles"
    }
  }

  var tint: Color {
    switch self {
    case .codex: .green
    case .opencodeGo: .blue
    case .claude: .orange
    }
  }
}

enum UsageAvailability: Sendable {
  case allowance
  case unavailable

  var label: String {
    switch self {
    case .allowance: "Allowance"
    case .unavailable: "Unavailable"
    }
  }

  var color: Color {
    switch self {
    case .allowance: .green
    case .unavailable: .secondary
    }
  }
}

struct UsageWindow: Identifiable, Sendable {
  let id: String
  let title: String
  let usedPercent: Double
  let resetsAt: Date?

  var remainingPercent: Double { max(0, min(100, 100 - usedPercent)) }
}

struct ProviderUsage: Identifiable, Sendable {
  var id: String { provider.id }

  let provider: UsageProvider
  let availability: UsageAvailability
  let primaryValue: String
  let summary: String
  let details: [UsageDetail]
  let windows: [UsageWindow]
  let observedAt: Date?
  let error: String?

  var lowestRemainingPercent: Double? {
    windows.map(\.remainingPercent).min()
  }

  static func unavailable(_ provider: UsageProvider, _ message: String) -> ProviderUsage {
    ProviderUsage(
      provider: provider,
      availability: .unavailable,
      primaryValue: "Not available",
      summary: message,
      details: [],
      windows: [],
      observedAt: nil,
      error: message
    )
  }
}

struct UsageDetail: Identifiable, Sendable {
  var id: String { label }
  let label: String
  let value: String
}

enum UsageFormatting {
  static func count(_ value: Double) -> String {
    value.formatted(.number.notation(.compactName).precision(.fractionLength(0...1)))
  }

  static func percent(_ value: Double) -> String {
    value.formatted(.number.precision(.fractionLength(0))) + "%"
  }

  static func reset(_ date: Date, now: Date = Date()) -> String {
    if date <= now { return "reset pending" }
    let relative = RelativeDateTimeFormatter()
    relative.unitsStyle = .short
    return "resets \(relative.localizedString(for: date, relativeTo: now))"
  }
}
