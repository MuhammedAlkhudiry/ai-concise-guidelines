import AppKit
import SwiftUI

func laneServiceSummaryColor(_ summary: LaneServiceSummary) -> Color {
  switch summary {
  case .running: .green
  case .changing, .partial: .yellow
  case .failed: .red
  case .stopped: .secondary
  case .checking: .blue
  case .unavailable: .gray
  }
}

func laneServiceColor(_ state: LaneServiceState) -> Color {
  switch state {
  case .running: .green
  case .starting, .stopping: .yellow
  case .failed: .red
  case .stopped: .secondary
  case .checking: .blue
  case .unavailable: .gray.opacity(0.45)
  }
}

func laneCiColor(_ state: LaneCiState) -> Color {
  switch state {
  case .passing: .green
  case .running: .yellow
  case .failed: .red
  case .checking: .blue
  case .merged: .purple
  case .closed: .secondary
  case .none, .noPR: .secondary
  case .unavailable: .gray
  }
}

struct LaneBaseSyncLabel: View {
  let state: LaneBaseSyncState
  let isSyncing: Bool
  let isEnabled: Bool
  let sync: () -> Void

  private var color: Color {
    switch state {
    case .latest: .green
    case .behind: .orange
    case .unavailable: .secondary
    }
  }

  private var systemImage: String {
    switch state {
    case .latest: "checkmark.circle.fill"
    case .behind: "arrow.down.circle.fill"
    case .unavailable: "questionmark.circle.fill"
    }
  }

  @ViewBuilder
  var body: some View {
    if case .behind = state {
      Button(action: sync) {
        label
      }
      .buttonStyle(.plain)
      .disabled(isSyncing || !isEnabled)
      .help(isSyncing ? "Fetching the latest base branch" : "Fetch and update this lane")
      .accessibilityLabel(isSyncing ? "Fetching the latest base branch" : "Fetch latest")
    } else {
      label
    }
  }

  private var label: some View {
    Group {
      if isSyncing {
        HStack(spacing: 3) {
          ProgressView()
            .controlSize(.mini)
          Text("Fetching…")
        }
      } else {
        Label(state.title, systemImage: systemImage)
      }
    }
    .font(.caption2.weight(.semibold))
    .foregroundStyle(color)
    .fixedSize()
    .help("Base branch status: \(state.title.lowercased())")
  }
}

struct LaneCiLabel: View {
  let status: LaneCiStatus

  private var systemImage: String {
    switch status.state {
    case .passing: "checkmark.circle.fill"
    case .running: "clock.fill"
    case .failed: "xmark.circle.fill"
    case .checking: "ellipsis.circle.fill"
    case .none: "minus.circle.fill"
    case .merged: "arrow.triangle.merge"
    case .closed: "xmark.circle.fill"
    case .noPR: "arrow.triangle.pull"
    case .unavailable: "questionmark.circle.fill"
    }
  }

  var body: some View {
    Label(status.state.title, systemImage: systemImage)
      .foregroundStyle(laneCiColor(status.state))
      .help(status.checks > 0 ? "\(status.checks) pull-request checks" : status.state.title)
      .accessibilityLabel(
        status.checks > 0 ? "\(status.state.title), \(status.checks) checks" : status.state.title
      )
  }
}

struct LaneServiceSummaryBadge: View {
  let summary: LaneServiceSummary

  private var systemImage: String {
    switch summary {
    case .running: "checkmark.circle.fill"
    case .changing: "arrow.triangle.2.circlepath"
    case .partial: "circle.lefthalf.filled"
    case .stopped: "stop.circle.fill"
    case .failed: "exclamationmark.triangle.fill"
    case .checking: "ellipsis.circle.fill"
    case .unavailable: "questionmark.circle.fill"
    }
  }

  var body: some View {
    Label(summary.title, systemImage: systemImage)
      .font(.caption2.weight(.semibold))
      .foregroundStyle(laneServiceSummaryColor(summary))
      .padding(.horizontal, 6)
      .padding(.vertical, 2)
      .background(laneServiceSummaryColor(summary).opacity(0.12), in: Capsule())
  }
}

struct LaneBranchBadge: View {
  let branch: String
  let status: LaneCiStatus
  let isOpening: Bool
  let open: () -> Void
  let openGitHubBranch: () -> Void

  var body: some View {
    Group {
      if status.url != nil {
        Button(action: open) {
          label
        }
        .buttonStyle(.plain)
        .disabled(isOpening)
        .help("Open pull request\(status.number.map { " #\($0)" } ?? "") on GitHub")
        .accessibilityLabel(
          "Open pull request\(status.number.map { " \($0)" } ?? "") for branch \(branch) on GitHub"
        )
      } else {
        label
          .help("Branch \(branch)")
          .accessibilityLabel("Branch \(branch)")
      }
    }
    .contextMenu {
      if status.url != nil {
        Button(action: open) {
          Label("Open PR", systemImage: "arrow.up.right.square")
        }
      }
      Button(action: openGitHubBranch) {
        Label("Open Branch on GitHub", systemImage: "arrow.triangle.branch")
      }
      Divider()
      if let url = status.url {
        Button {
          copy(url.absoluteString)
        } label: {
          Label("Copy PR URL", systemImage: "link")
        }
      }
      Button {
        copy(branch)
      } label: {
        Label("Copy Branch Name", systemImage: "doc.on.doc")
      }
    }
  }

  private var label: some View {
    HStack(spacing: 3) {
      if isOpening {
        ProgressView()
          .controlSize(.mini)
      } else {
        Image(systemName: "arrow.triangle.branch")
      }
      Text(branch)
        .lineLimit(1)
        .truncationMode(.middle)
      if let number = status.number {
        Text("· #\(number)")
        if status.state == .merged || status.state == .closed {
          Text("· \(status.state.title)")
            .foregroundStyle(status.state == .merged ? Color.purple : Color.secondary)
        }
      }
    }
    .font(.caption2.weight(.semibold))
    .foregroundStyle(.secondary)
    .padding(.horizontal, 6)
    .padding(.vertical, 2)
    .background(Color.secondary.opacity(0.12), in: Capsule())
    .frame(maxWidth: 300, alignment: .leading)
  }

  private func copy(_ value: String) {
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(value, forType: .string)
  }
}

struct LaneServiceRow: View {
  let service: LaneService
  let isBusy: Bool
  let onToggle: () -> Void
  let onRestart: () -> Void
  let loadLogs: () async -> String

  @State private var isShowingLogs = false
  @State private var logs = "Loading logs…"
  @State private var hoverTask: Task<Void, Never>?
  @State private var closeTask: Task<Void, Never>?

  var body: some View {
    HStack(spacing: 6) {
      Circle()
        .fill(laneServiceColor(service.state))
        .frame(width: 6, height: 6)
      VStack(alignment: .leading, spacing: 1) {
        Text(service.name)
          .font(.caption.weight(.medium))
        Text(service.state.title)
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      Spacer()
      if service.manageable {
        HStack(spacing: 8) {
          if service.state == .running {
            Button(action: onRestart) {
              Image(systemName: "arrow.clockwise")
                .font(.system(size: 11, weight: .bold))
                .frame(width: 14, height: 14)
            }
            .buttonStyle(.plain)
            .disabled(isBusy)
            .help("Restart \(service.command ?? service.name)")
            .accessibilityLabel("Restart \(service.command ?? service.name)")
          }

          Button(action: onToggle) {
            if service.state == .starting || service.state == .stopping {
              ProgressView()
                .controlSize(.mini)
                .frame(width: 14, height: 14)
            } else {
              Image(systemName: service.state == .running ? "stop.fill" : "play.fill")
                .font(.system(size: 10, weight: .bold))
                .frame(width: 14, height: 14)
            }
          }
          .buttonStyle(.plain)
          .disabled(service.state == .unavailable || isBusy)
          .help("\(service.state == .running ? "Stop" : "Start") \(service.command ?? service.name)")
          .accessibilityLabel(
            "\(service.state == .running ? "Stop" : "Start") \(service.command ?? service.name)"
          )
        }
      }
    }
    .padding(.horizontal, 8)
    .padding(.vertical, 5)
    .background(.quaternary.opacity(0.2), in: RoundedRectangle(cornerRadius: 5))
    .onHover(perform: handleHover)
    .popover(isPresented: $isShowingLogs, arrowEdge: .bottom) {
      ServiceLogsPopover(
        service: service,
        statusColor: laneServiceColor(service.state),
        logs: logs
      )
      .onHover { hovering in
        if hovering {
          closeTask?.cancel()
        } else {
          scheduleClose()
        }
      }
    }
  }

  private func handleHover(_ isHovering: Bool) {
    if isHovering {
      closeTask?.cancel()
      hoverTask?.cancel()
      hoverTask = Task {
        try? await Task.sleep(for: .milliseconds(250))
        guard !Task.isCancelled else { return }
        logs = await loadLogs()
        isShowingLogs = true
      }
    } else {
      hoverTask?.cancel()
      scheduleClose()
    }
  }

  private func scheduleClose() {
    closeTask?.cancel()
    closeTask = Task {
      try? await Task.sleep(for: .milliseconds(400))
      guard !Task.isCancelled else { return }
      isShowingLogs = false
    }
  }
}

struct ServiceLogsPopover: View {
  let service: LaneService
  let statusColor: Color
  let logs: String

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 6) {
        Circle()
          .fill(statusColor)
          .frame(width: 6, height: 6)
        Text(service.name)
          .font(.caption.weight(.semibold))
        Text(service.command ?? "Health check")
          .font(.caption2.monospaced())
          .foregroundStyle(.secondary)
        Spacer()
        Text(service.state.title)
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      Divider()
      ScrollView([.horizontal, .vertical]) {
        Text(logs)
          .font(.caption2.monospaced())
          .textSelection(.enabled)
          .padding(8)
          .frame(maxWidth: .infinity, alignment: .topLeading)
      }
      .background(.black.opacity(0.08), in: RoundedRectangle(cornerRadius: 5))
    }
    .padding(10)
    .frame(width: 620, height: 420)
  }
}

struct LaneErrorBanner: View {
  let message: String
  let onDismiss: () -> Void

  var body: some View {
    HStack(alignment: .top, spacing: 7) {
      Image(systemName: "exclamationmark.triangle.fill")
        .foregroundStyle(.orange)
      Text(message)
        .font(.caption2)
        .lineLimit(3)
        .textSelection(.enabled)
        .frame(maxWidth: .infinity, alignment: .leading)
      Button {
        onDismiss()
      } label: {
        Image(systemName: "xmark")
      }
      .buttonStyle(.plain)
      .accessibilityLabel("Dismiss error")
    }
    .padding(8)
    .background(.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
  }
}
