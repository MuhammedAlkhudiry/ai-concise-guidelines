import Foundation
import Testing

@testable import AIUsageMenu

@Test func parsesOpenCodeAllowanceWindows() throws {
  let html = #"rollingUsage:$R[36]={status:"ok",resetInSec:18000,usagePercent:12},weeklyUsage:$R[37]={status:"ok",resetInSec:542648,usagePercent:34},monthlyUsage:$R[38]={status:"rate-limited",resetInSec:596738,usagePercent:100}"#
  let now = Date(timeIntervalSince1970: 1_000)

  let result = try OpenCodeUsageClient.parseUsageHTML(html, now: now)

  #expect(result.map(\.title) == ["Rolling", "Weekly", "Monthly"])
  #expect(result.map(\.usedPercent) == [12, 34, 100])
  #expect(result[0].resetsAt == now.addingTimeInterval(18_000))
}

@Test func parsesClaudeAllowanceWindows() throws {
  let data = Data(
    #"{"five_hour":{"utilization":21,"resets_at":"2026-08-03T22:30:00.123456+00:00"},"seven_day":{"utilization":47,"resets_at":"2026-08-08T20:00:00+00:00"}}"#.utf8
  )

  let result = try ClaudeUsageClient.parseUsage(data)

  #expect(result.map(\.title) == ["5-hour", "Weekly"])
  #expect(result.map(\.usedPercent) == [21, 47])
  #expect(result.allSatisfy { $0.resetsAt != nil })
}

@Test func namesProviderWindows() {
  #expect(AIUsageCollector.windowTitle(minutes: 300) == "5-hour")
  #expect(AIUsageCollector.windowTitle(minutes: 10_080) == "Weekly")
}
