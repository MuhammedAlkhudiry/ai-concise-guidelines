import SwiftUI

func laneHealthColor(_ health: String) -> Color {
  switch health {
  case "ready": .green
  case "drifted": .yellow
  default: .red
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

struct LaneHealthBadge: View {
  let health: String
  var body: some View {
    Text(health.capitalized)
      .font(.caption2.weight(.semibold))
      .foregroundStyle(laneHealthColor(health))
      .padding(.horizontal, 6)
      .padding(.vertical, 2)
      .background(laneHealthColor(health).opacity(0.12), in: Capsule())
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
