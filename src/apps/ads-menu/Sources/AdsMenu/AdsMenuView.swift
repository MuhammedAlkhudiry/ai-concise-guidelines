import AppKit
import Charts
import SwiftUI

struct AdsMenuView: View {
  @ObservedObject var store: AdsStore
  @State private var selectedPlatform: String?

  private var selection: AdsPlatformSnapshot? {
    store.platforms.first { $0.id == selectedPlatform } ?? store.platforms.first
  }

  var body: some View {
    VStack(spacing: 0) {
      header
      Divider()
      content
    }
    .frame(width: 790, height: 560)
    .onAppear {
      store.refresh()
    }
    .onChange(of: store.platforms.map(\.id)) { _, ids in
      if selectedPlatform == nil || !ids.contains(selectedPlatform!) {
        selectedPlatform = ids.first
      }
    }
  }

  private var header: some View {
    HStack(spacing: 9) {
      Image(systemName: "chart.bar.xaxis")
        .foregroundStyle(.tint)
      VStack(alignment: .leading, spacing: 0) {
        Text("Ads")
          .font(.headline)
        Text("Read-only performance")
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      Spacer()
      Picker(
        "Project",
        selection: Binding(
          get: { store.selectedProjectID },
          set: { store.selectProject($0) }
        )
      ) {
        Label("All projects", systemImage: "square.grid.2x2").tag("all")
        ForEach(store.projects) { project in
          Label(
            project.name,
            systemImage: project.classification == "unassigned"
              ? "questionmark.folder" : "folder"
          )
          .tag(project.id)
        }
      }
      .pickerStyle(.menu)
      .frame(width: 155)
      Picker(
        "Period",
        selection: Binding(
          get: { store.period },
          set: { store.selectPeriod($0) }
        )
      ) {
        ForEach(AdsPeriod.allCases) { period in
          Text(period.title).tag(period)
        }
      }
      .labelsHidden()
      .pickerStyle(.segmented)
      .frame(width: 165)
      if store.isRefreshing {
        ProgressView()
          .controlSize(.small)
      }
      Button {
        store.refresh(bypassingCache: true)
      } label: {
        Image(systemName: "arrow.clockwise")
      }
      .buttonStyle(.plain)
      .disabled(store.isRefreshing)
      .help("Refresh provider data")
      Button {
        NSApplication.shared.terminate(nil)
      } label: {
        Image(systemName: "power")
      }
      .buttonStyle(.plain)
      .help("Quit Ads")
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 9)
  }

  @ViewBuilder
  private var content: some View {
    if store.platforms.isEmpty && store.isRefreshing {
      VStack(spacing: 10) {
        ProgressView()
        Text("Loading advertising accounts…")
          .foregroundStyle(.secondary)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    } else {
      VStack(spacing: 0) {
        if let error = store.errorMessage {
          HStack {
            Image(systemName: "exclamationmark.triangle.fill")
              .foregroundStyle(.orange)
            Text(error)
              .font(.caption)
              .lineLimit(2)
            Spacer()
            Button {
              store.errorMessage = nil
            } label: {
              Image(systemName: "xmark")
            }
            .buttonStyle(.plain)
          }
          .padding(8)
          .background(.orange.opacity(0.1))
        }
        HStack(spacing: 0) {
          platformList
          Divider()
          if let selection {
            detail(selection)
          } else {
            ContentUnavailableView("No providers", systemImage: "chart.bar.xaxis")
          }
        }
      }
    }
  }

  private var platformList: some View {
    ScrollView {
      LazyVStack(spacing: 3) {
        ForEach(store.platforms) { snapshot in
          Button {
            selectedPlatform = snapshot.id
          } label: {
            HStack(spacing: 8) {
              Circle()
                .fill(snapshot.access.state.color)
                .frame(width: 7, height: 7)
              VStack(alignment: .leading, spacing: 2) {
                Text(snapshot.access.platformName)
                  .font(.caption.weight(.semibold))
                Text(snapshot.access.account?.name ?? snapshot.access.state.title)
                  .font(.caption2)
                  .foregroundStyle(.secondary)
                  .lineLimit(1)
              }
              Spacer()
              if !snapshot.campaigns.isEmpty {
                Text("\(snapshot.campaigns.count)")
                  .font(.caption2.monospacedDigit())
                  .foregroundStyle(.secondary)
              }
            }
            .padding(.horizontal, 9)
            .padding(.vertical, 7)
            .background(
              selectedPlatform == snapshot.id ? Color.accentColor.opacity(0.15) : .clear,
              in: RoundedRectangle(cornerRadius: 5)
            )
            .contentShape(Rectangle())
          }
          .buttonStyle(.plain)
        }
      }
      .padding(7)
    }
    .frame(width: 220)
  }

  private func detail(_ snapshot: AdsPlatformSnapshot) -> some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 14) {
        HStack(alignment: .top) {
          VStack(alignment: .leading, spacing: 3) {
            Text(snapshot.access.platformName)
              .font(.title3.weight(.semibold))
            HStack(spacing: 5) {
              Circle()
                .fill(snapshot.access.state.color)
                .frame(width: 7, height: 7)
              Text(snapshot.access.state.title)
                .font(.caption)
                .foregroundStyle(.secondary)
            }
          }
          Spacer()
          Button("Open dashboard") {
            store.open(snapshot.id)
          }
          .controlSize(.small)
        }

        if let account = snapshot.access.account {
          VStack(alignment: .leading, spacing: 4) {
            Text(account.name ?? account.id)
              .font(.subheadline.weight(.medium))
            Text(
              [account.currency, account.timezone, account.id]
                .compactMap { $0 }
                .joined(separator: " · ")
            )
            .font(.caption2)
            .foregroundStyle(.secondary)
            .textSelection(.enabled)
          }
        }

        if let message = snapshot.access.message {
          Label(message, systemImage: "info.circle")
            .font(.caption)
            .foregroundStyle(snapshot.access.state == .error ? .red : .secondary)
        }

        if let stats = snapshot.stats, let metrics = stats.metrics {
          metricGrid(metrics, currency: stats.account?.currency)
          spendChart(stats)
          if let range = stats.range {
            Text(
              "\(range.from) – \(range.to) · \(stats.account?.timezone ?? "timezone unavailable")"
            )
            .font(.caption2)
            .foregroundStyle(.secondary)
          }
          if let attribution = stats.attribution {
            VStack(alignment: .leading, spacing: 3) {
              Text("Attribution")
                .font(.caption.weight(.semibold))
              Text(attribution)
                .font(.caption2)
                .foregroundStyle(.secondary)
            }
          }
          if !metrics.nativeConversions.isEmpty {
            VStack(alignment: .leading, spacing: 5) {
              Text("Native conversion results")
                .font(.caption.weight(.semibold))
              ForEach(metrics.nativeConversions) { metric in
                HStack {
                  Text(metric.name.replacingOccurrences(of: "_", with: " "))
                  Spacer()
                  Text(metric.value.formatted())
                    .monospacedDigit()
                }
                .font(.caption)
              }
            }
          }
        }

        Divider()
        VStack(alignment: .leading, spacing: 7) {
          Text("Active campaigns")
            .font(.subheadline.weight(.semibold))
          if snapshot.campaigns.isEmpty {
            Text(
              snapshot.access.state == .ready ? "No active campaigns." : "Campaigns unavailable."
            )
            .font(.caption)
            .foregroundStyle(.secondary)
          } else {
            ForEach(snapshot.campaigns) { campaign in
              HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                  Text(campaign.name)
                    .font(.caption.weight(.medium))
                  Text(
                    [campaign.objective, campaign.deliveryStatus ?? campaign.status]
                      .compactMap { $0 }
                      .joined(separator: " · ")
                  )
                  .font(.caption2)
                  .foregroundStyle(.secondary)
                }
                Spacer()
              }
            }
          }
        }
      }
      .padding(14)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
  }

  private func metricGrid(_ metrics: AdsMetrics, currency: String?) -> some View {
    HStack(spacing: 8) {
      metric("Spend", value: "\(metrics.spend.formatted()) \(currency ?? "")")
      metric("Impressions", value: metrics.impressions.formatted())
      metric("Clicks", value: metrics.clicks.formatted())
    }
  }

  @ViewBuilder
  private func spendChart(_ stats: AdsPlatformStats) -> some View {
    VStack(alignment: .leading, spacing: 6) {
      HStack {
        Label("Daily spend", systemImage: "chart.xyaxis.line")
          .font(.caption.weight(.semibold))
        Spacer()
        Text(stats.account?.currency ?? "Currency unavailable")
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      if stats.daily.contains(where: { $0.spend != 0 }) {
        Chart(stats.daily) { point in
          AreaMark(
            x: .value("Date", point.chartDate),
            y: .value("Spend", point.spend)
          )
          .foregroundStyle(
            .linearGradient(
              colors: [Color.accentColor.opacity(0.28), Color.accentColor.opacity(0.03)],
              startPoint: .top,
              endPoint: .bottom
            )
          )
          LineMark(
            x: .value("Date", point.chartDate),
            y: .value("Spend", point.spend)
          )
          .foregroundStyle(Color.accentColor)
          .interpolationMethod(.catmullRom)
          PointMark(
            x: .value("Date", point.chartDate),
            y: .value("Spend", point.spend)
          )
          .foregroundStyle(Color.accentColor)
          .symbolSize(15)
        }
        .chartYAxis {
          AxisMarks(position: .leading) {
            AxisGridLine()
            AxisValueLabel()
          }
        }
        .chartXAxis {
          AxisMarks(values: .automatic(desiredCount: store.period == .sevenDays ? 7 : 6)) { value in
            AxisGridLine()
            AxisValueLabel(format: .dateTime.month(.abbreviated).day())
          }
        }
        .frame(height: 145)
        .accessibilityLabel("Daily spend in \(stats.account?.currency ?? "the account currency")")
      } else {
        ContentUnavailableView(
          "No spend in this period",
          systemImage: "chart.xyaxis.line",
          description: Text("The provider returned zero spend for every day.")
        )
        .frame(height: 110)
      }
    }
  }

  private func metric(_ title: String, value: String) -> some View {
    VStack(alignment: .leading, spacing: 3) {
      Text(title)
        .font(.caption2)
        .foregroundStyle(.secondary)
      Text(value)
        .font(.subheadline.weight(.semibold))
        .monospacedDigit()
        .lineLimit(1)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(9)
    .background(.secondary.opacity(0.08), in: RoundedRectangle(cornerRadius: 7))
  }
}
