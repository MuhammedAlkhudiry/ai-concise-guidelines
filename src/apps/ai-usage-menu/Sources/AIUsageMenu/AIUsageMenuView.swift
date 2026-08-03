import AppKit
import Combine
import SwiftUI

struct AIUsageMenuView: View {
  @ObservedObject var store: AIUsageStore
  private let refreshTimer = Timer.publish(every: 300, on: .main, in: .common).autoconnect()

  var body: some View {
    VStack(spacing: 0) {
      header
      Divider()
      content
      Divider()
      footer
    }
    .frame(width: 390)
    .onAppear { store.refresh() }
    .onReceive(refreshTimer) { _ in store.refresh() }
  }

  private var header: some View {
    HStack(spacing: 9) {
      Image(systemName: "gauge.with.dots.needle.67percent")
        .foregroundStyle(.tint)
      VStack(alignment: .leading, spacing: 1) {
        Text("AI Usage")
          .font(.headline)
        Text("Provider allowance windows")
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      Spacer()
      if store.isRefreshing {
        ProgressView()
          .controlSize(.small)
      }
      Button {
        store.refresh()
      } label: {
        Image(systemName: "arrow.clockwise")
      }
      .buttonStyle(.plain)
      .disabled(store.isRefreshing)
      .help("Refresh usage")
      .accessibilityLabel("Refresh usage")
      Button {
        NSApplication.shared.terminate(nil)
      } label: {
        Image(systemName: "power")
      }
      .buttonStyle(.plain)
      .help("Quit AI Usage")
      .accessibilityLabel("Quit AI Usage")
    }
    .padding(.horizontal, 13)
    .padding(.vertical, 10)
  }

  @ViewBuilder
  private var content: some View {
    if store.providers.isEmpty && store.isRefreshing {
      VStack(spacing: 10) {
        ProgressView()
        Text("Reading provider usage…")
          .font(.caption)
          .foregroundStyle(.secondary)
      }
      .frame(maxWidth: .infinity)
      .frame(height: 230)
    } else {
      VStack(spacing: 9) {
        ForEach(store.providers) { usage in
          providerCard(usage)
        }
      }
      .padding(10)
    }
  }

  private func providerCard(_ usage: ProviderUsage) -> some View {
    VStack(alignment: .leading, spacing: 9) {
      HStack(alignment: .top, spacing: 9) {
        Image(systemName: usage.provider.icon)
          .font(.body.weight(.semibold))
          .foregroundStyle(usage.provider.tint)
          .frame(width: 20, height: 20)
          .accessibilityHidden(true)
        VStack(alignment: .leading, spacing: 2) {
          HStack(spacing: 6) {
            Text(usage.provider.name)
              .font(.subheadline.weight(.semibold))
            Text(usage.availability.label)
              .font(.caption2.weight(.medium))
              .foregroundStyle(usage.availability.color)
              .padding(.horizontal, 6)
              .padding(.vertical, 2)
              .background(usage.availability.color.opacity(0.11), in: Capsule())
          }
          Text(usage.summary)
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
        Spacer(minLength: 8)
        Text(usage.primaryValue)
          .font(.subheadline.weight(.semibold))
          .monospacedDigit()
          .multilineTextAlignment(.trailing)
      }

      ForEach(usage.windows) { window in
        VStack(spacing: 4) {
          HStack {
            Text(window.title)
            Spacer()
            Text(UsageFormatting.percent(window.remainingPercent))
              .monospacedDigit()
            if let reset = window.resetsAt {
              Text("· \(UsageFormatting.reset(reset))")
                .foregroundStyle(.secondary)
            }
          }
          .font(.caption2)
          ProgressView(value: window.remainingPercent, total: 100)
            .tint(progressColor(window.remainingPercent))
            .accessibilityLabel("\(window.title) allowance remaining")
            .accessibilityValue(UsageFormatting.percent(window.remainingPercent))
        }
      }

      if !usage.details.isEmpty && usage.windows.isEmpty {
        HStack(spacing: 0) {
          ForEach(Array(usage.details.enumerated()), id: \.element.id) { index, detail in
            if index > 0 { Divider().frame(height: 25) }
            VStack(alignment: index == 0 ? .leading : .center, spacing: 1) {
              Text(detail.value)
                .font(.caption.weight(.semibold))
                .monospacedDigit()
              Text(detail.label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity)
          }
        }
      }

    }
    .padding(11)
    .background(.quaternary.opacity(0.45), in: RoundedRectangle(cornerRadius: 9))
    .accessibilityElement(children: .contain)
  }

  private var footer: some View {
    HStack {
      Image(systemName: "info.circle")
        .accessibilityHidden(true)
      Text("Percentages appear only from provider allowance data.")
      Spacer()
      if let refreshed = store.lastRefreshedAt {
        Text(refreshed, style: .relative)
          .monospacedDigit()
      }
    }
    .font(.caption2)
    .foregroundStyle(.secondary)
    .padding(.horizontal, 13)
    .padding(.vertical, 8)
  }

  private func progressColor(_ remaining: Double) -> Color {
    if remaining <= 15 { return .red }
    if remaining <= 35 { return .orange }
    return .green
  }
}
