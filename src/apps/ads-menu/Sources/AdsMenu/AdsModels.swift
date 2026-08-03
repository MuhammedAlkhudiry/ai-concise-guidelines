import Foundation
import SwiftUI

enum AdsAccessState: String, Codable {
  case ready
  case pending
  case browser
  case unavailable
  case error

  var title: String {
    switch self {
    case .ready: "Ready"
    case .pending: "Pending"
    case .browser: "Browser only"
    case .unavailable: "Unavailable"
    case .error: "Error"
    }
  }

  var color: Color {
    switch self {
    case .ready: .green
    case .pending: .orange
    case .browser: .blue
    case .unavailable: .secondary
    case .error: .red
    }
  }
}

struct AdsAccount: Codable, Equatable {
  let id: String
  let name: String?
  let currency: String?
  let timezone: String?
}

struct AdsAccess: Codable, Identifiable {
  var id: String { platform }

  let platform: String
  let platformName: String
  let state: AdsAccessState
  let configured: Bool
  let account: AdsAccount?
  let message: String?
  let checkedAt: String
}

struct AdsNativeMetric: Codable, Identifiable {
  var id: String { name }

  let name: String
  let value: Double
}

struct AdsDailyStats: Codable, Identifiable {
  var id: String { date }

  let date: String
  let impressions: Double
  let clicks: Double
  let spend: Double
  let nativeConversions: [AdsNativeMetric]

  var chartDate: Date {
    Self.dateFormatter.date(from: date) ?? .distantPast
  }

  private static let dateFormatter: DateFormatter = {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone(secondsFromGMT: 0)
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter
  }()
}

struct AdsMetrics: Codable {
  let impressions: Double
  let clicks: Double
  let spend: Double
  let nativeConversions: [AdsNativeMetric]
}

struct AdsDateRange: Codable {
  let from: String
  let to: String
}

struct AdsFreshness: Codable {
  let fetchedAt: String
  let providerUpdatedAt: String?
  let note: String?
}

struct AdsPlatformStats: Codable {
  let platform: String
  let platformName: String
  let state: AdsAccessState
  let configured: Bool
  let account: AdsAccount?
  let message: String?
  let checkedAt: String
  let period: String
  let range: AdsDateRange?
  let attribution: String?
  let freshness: AdsFreshness
  let metrics: AdsMetrics?
  let daily: [AdsDailyStats]
}

struct AdsCampaign: Codable, Identifiable {
  let id: String
  let name: String
  let status: String
  let deliveryStatus: String?
  let objective: String?
  let startAt: String?
  let endAt: String?
}

struct AdsPlatformCampaigns: Codable {
  let platform: String
  let platformName: String
  let state: AdsAccessState
  let configured: Bool
  let account: AdsAccount?
  let message: String?
  let checkedAt: String
  let campaigns: [AdsCampaign]
}

struct AdsStatusDocument: Codable {
  let contractVersion: Int
  let generatedAt: String
  let cached: Bool
  let platforms: [AdsAccess]
}

struct AdsStatsDocument: Codable {
  let contractVersion: Int
  let generatedAt: String
  let cached: Bool
  let period: String
  let platforms: [AdsPlatformStats]
}

struct AdsCampaignsDocument: Codable {
  let contractVersion: Int
  let generatedAt: String
  let cached: Bool
  let activeOnly: Bool
  let platforms: [AdsPlatformCampaigns]
}

struct AdsProject: Codable, Identifiable {
  let id: String
  let name: String
  let classification: String
  let platforms: [String]
}

struct AdsProjectsDocument: Codable {
  let contractVersion: Int
  let projects: [AdsProject]
}

struct AdsPlatformSnapshot: Identifiable {
  var id: String { access.platform }

  let access: AdsAccess
  let stats: AdsPlatformStats?
  let campaigns: [AdsCampaign]
}

enum AdsPeriod: String, CaseIterable, Identifiable {
  case sevenDays = "7d"
  case thirtyDays = "30d"

  var id: String { rawValue }
  var title: String { self == .sevenDays ? "7 days" : "30 days" }
}

enum AdsMenuError: LocalizedError {
  case message(String)

  var errorDescription: String? {
    switch self {
    case .message(let message): message
    }
  }
}
