import Foundation
import Testing

@testable import AdsMenu

@Test func decodesPerPlatformStatsWithoutCrossPlatformTotals() throws {
  let data = Data(
    #"""
    {
      "contractVersion": 1,
      "generatedAt": "2026-07-30T12:00:00Z",
      "cached": false,
      "period": "7d",
      "platforms": [{
        "platform": "google",
        "platformName": "Google Ads",
        "state": "ready",
        "configured": true,
        "account": {"id":"123","name":"Account","currency":"SAR","timezone":"Asia/Riyadh"},
        "message": null,
        "checkedAt": "2026-07-30T12:00:00Z",
        "period": "7d",
        "range": {"from":"2026-07-23","to":"2026-07-29"},
        "attribution": "Account configured",
        "freshness": {"fetchedAt":"2026-07-30T12:00:00Z","providerUpdatedAt":null,"note":null},
        "metrics": {
          "impressions": 1200,
          "clicks": 30,
          "spend": 44.5,
          "nativeConversions": [{"name":"all_conversions","value":7}]
        },
        "daily": [{
          "date":"2026-07-29",
          "impressions":1200,
          "clicks":30,
          "spend":44.5,
          "nativeConversions":[{"name":"all_conversions","value":7}]
        }]
      }]
    }
    """#.utf8
  )

  let document = try JSONDecoder().decode(AdsStatsDocument.self, from: data)
  #expect(document.contractVersion == 1)
  #expect(document.platforms.count == 1)
  #expect(document.platforms[0].account?.currency == "SAR")
  #expect(document.platforms[0].metrics?.nativeConversions[0].name == "all_conversions")
  #expect(document.platforms[0].daily[0].spend == 44.5)
}

@Test func decodesPendingProviderAsAnExplicitAccessState() throws {
  let data = Data(
    #"""
    {
      "contractVersion": 1,
      "generatedAt": "2026-07-30T12:00:00Z",
      "cached": false,
      "platforms": [{
        "platform": "tiktok",
        "platformName": "TikTok Ads",
        "state": "pending",
        "configured": true,
        "account": null,
        "message": "TikTok Marketing API application approval is pending.",
        "checkedAt": "2026-07-30T12:00:00Z"
      }]
    }
    """#.utf8
  )

  let document = try JSONDecoder().decode(AdsStatusDocument.self, from: data)
  #expect(document.platforms[0].state == .pending)
}

@Test func decodesBrowserOnlyProviderAsAnExplicitAccessState() throws {
  let data = Data(
    #"{"contractVersion":1,"generatedAt":"2026-08-03T12:00:00Z","cached":false,"platforms":[{"platform":"apple","platformName":"Apple Ads","state":"browser","configured":false,"account":{"id":"22534290","name":"Muhammed Alkhudiry","currency":"USD","timezone":"Asia/Riyadh"},"message":"App Store advertising is managed in Apple Ads; API access is intentionally not configured.","checkedAt":"2026-08-03T12:00:00Z"}]}"#
      .utf8
  )

  let document = try JSONDecoder().decode(AdsStatusDocument.self, from: data)
  #expect(document.platforms[0].state == .browser)
  #expect(document.platforms[0].account?.id == "22534290")
}

@Test func decodesConfiguredProjectsAndClassificationQueue() throws {
  let data = Data(
    #"{"contractVersion":1,"projects":[{"id":"awraq","name":"Awraq","classification":"project","platforms":["google","snapchat"]},{"id":"needs-classification","name":"Needs classification","classification":"unassigned","platforms":["meta"]}]}"#
      .utf8
  )

  let document = try JSONDecoder().decode(AdsProjectsDocument.self, from: data)
  #expect(document.projects.map(\.id) == ["awraq", "needs-classification"])
  #expect(document.projects[1].classification == "unassigned")
}
