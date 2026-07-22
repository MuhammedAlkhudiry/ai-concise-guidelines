import SwiftUI

struct LanesMenuView: View {
  @ObservedObject var store: LaneStore

  var body: some View {
    VStack(spacing: 0) {
      header
      Divider()
      content
    }
    .frame(width: 390, height: 700)
    .onAppear { store.refresh() }
  }

  private var header: some View {
    HStack(spacing: 8) {
      Image(systemName: "square.stack.3d.up.fill")
        .foregroundStyle(.tint)
      VStack(alignment: .leading, spacing: 0) {
        Text("Lanes")
          .font(.headline)
        Text("\(store.projects.flatMap(\.lanes).count) lanes")
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      Spacer()
      if store.isRefreshing {
        ProgressView()
          .controlSize(.small)
          .accessibilityLabel("Refreshing lanes")
      }
      Button {
        store.refresh()
      } label: {
        Image(systemName: "arrow.clockwise")
      }
      .buttonStyle(.plain)
      .disabled(store.isRefreshing)
      .help("Refresh lane status")
      .accessibilityLabel("Refresh lane status")

      Button {
        NSApplication.shared.terminate(nil)
      } label: {
        Image(systemName: "power")
      }
      .buttonStyle(.plain)
      .help("Quit Lanes")
      .accessibilityLabel("Quit Lanes")
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 9)
  }

  @ViewBuilder
  private var content: some View {
    if store.projects.isEmpty && store.isRefreshing {
      VStack(spacing: 10) {
        ProgressView()
        Text("Loading lanes…")
          .foregroundStyle(.secondary)
      }
      .frame(maxWidth: .infinity, minHeight: 150)
    } else {
      ScrollView {
        LazyVStack(spacing: 12) {
          if let errorMessage = store.errorMessage {
            errorBanner(errorMessage)
          }
          if store.projects.isEmpty {
            ContentUnavailableView(
              "No Lanes",
              systemImage: "square.stack.3d.up.slash",
              description: Text("No configured lanes were returned.")
            )
            .frame(minHeight: 150)
          } else {
            ForEach(store.projects) { project in
              projectSection(project)
            }
          }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
      }
    }
  }

  private func projectSection(_ project: LaneProject) -> some View {
    VStack(alignment: .leading, spacing: 5) {
      HStack {
        Text(project.name.uppercased())
          .font(.caption2.weight(.bold))
          .tracking(0.8)
          .foregroundStyle(.secondary)
        Spacer()
        Text("\(project.lanes.count)")
          .font(.caption2.monospacedDigit())
          .foregroundStyle(.tertiary)
      }
      .padding(.horizontal, 4)

      VStack(spacing: 0) {
        ForEach(Array(project.lanes.enumerated()), id: \.element.id) { index, lane in
          if index > 0 { Divider() }
          laneRow(lane)
        }
      }
      .background(Color(nsColor: .controlBackgroundColor))
      .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
      .overlay {
        RoundedRectangle(cornerRadius: 9, style: .continuous)
          .stroke(.separator.opacity(0.45), lineWidth: 1)
      }
    }
  }

  private func laneRow(_ lane: LaneItem) -> some View {
    HStack(spacing: 9) {
      RoundedRectangle(cornerRadius: 2)
        .fill(statusColor(for: lane.health))
        .frame(width: 3)
        .accessibilityHidden(true)

      VStack(alignment: .leading, spacing: 6) {
        HStack {
          Text(lane.displayName)
            .font(.callout.monospaced().weight(.semibold))
          Spacer()
          ControlGroup {
            actionButton(.editor, lane: lane)
            actionButton(.simulator, lane: lane)
            actionButton(.browser, lane: lane)
          }
          .controlSize(.small)
          .fixedSize()
        }
        HStack(spacing: 8) {
          ForEach(store.services(for: lane)) { service in
            serviceBadge(service)
          }
        }
        HStack(spacing: 6) {
          Text("DEV")
            .font(.caption2.weight(.bold))
            .foregroundStyle(.tertiary)
          ForEach(store.commands(for: lane)) { command in
            devCommandControl(command)
          }
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .accessibilityElement(children: .combine)
      .accessibilityLabel(
        "\(lane.projectName) \(lane.displayName), \(lane.health), \(lane.availability)"
      )
      .help(lane.detail ?? "\(lane.health.capitalized), \(lane.availability)")
    }
    .padding(.horizontal, 8)
    .padding(.vertical, 8)
  }

  private func serviceBadge(_ service: LaneService) -> some View {
    HStack(spacing: 4) {
      Circle()
        .fill(serviceColor(for: service.state))
        .frame(width: 5, height: 5)
      Text(service.name)
        .font(.caption2)
        .foregroundStyle(.secondary)
    }
    .help("\(service.name): \(service.state.title)")
    .accessibilityLabel("\(service.name), \(service.state.title)")
  }

  private func actionButton(_ action: LaneAction, lane: LaneItem) -> some View {
    Button {
      store.perform(action, on: lane)
      NSApplication.shared.keyWindow?.orderOut(nil)
    } label: {
      if store.isPerforming(action, on: lane) {
        ProgressView()
          .controlSize(.small)
          .frame(width: 24, height: 20)
      } else {
        Image(systemName: action.systemImage)
          .font(.system(size: 13, weight: .semibold))
          .frame(width: 24, height: 20)
      }
    }
    .disabled(store.activeAction != nil)
    .help("Open \(lane.projectName) \(lane.displayName) in \(action.title)")
    .accessibilityLabel("Open \(lane.projectName) \(lane.displayName) in \(action.title)")
  }

  private func devCommandControl(_ command: LaneDevCommand) -> some View {
    HStack(spacing: 4) {
      Circle()
        .fill(devCommandColor(for: command.state))
        .frame(width: 5, height: 5)
      Text(command.kind.title)
        .font(.caption2)
      Button {
        store.toggle(command)
      } label: {
        if command.state == .starting || command.state == .stopping {
          ProgressView()
            .controlSize(.mini)
            .frame(width: 11, height: 11)
        } else {
          Image(systemName: command.state == .running ? "stop.fill" : "play.fill")
            .font(.system(size: 8, weight: .bold))
        }
      }
      .buttonStyle(.plain)
      .disabled(!command.supportsDev || store.activeDevCommand != nil)
      .accessibilityLabel(
        "\(command.state == .running ? "Stop" : "Start") \(command.kind.title) bun dev"
      )
    }
    .padding(.leading, 6)
    .padding(.trailing, 5)
    .padding(.vertical, 3)
    .background(.quaternary.opacity(0.45), in: Capsule())
    .help("\(command.kind.title): \(command.state.title) · bun dev")
  }

  private func errorBanner(_ message: String) -> some View {
    HStack(alignment: .top, spacing: 7) {
      Image(systemName: "exclamationmark.triangle.fill")
        .foregroundStyle(.orange)
      Text(message)
        .font(.caption2)
        .lineLimit(3)
        .textSelection(.enabled)
        .frame(maxWidth: .infinity, alignment: .leading)
      Button {
        store.errorMessage = nil
      } label: {
        Image(systemName: "xmark")
      }
      .buttonStyle(.plain)
      .accessibilityLabel("Dismiss error")
    }
    .padding(8)
    .background(.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 8))
  }

  private func statusColor(for health: String) -> Color {
    switch health {
    case "ready": .green
    case "drifted": .yellow
    default: .red
    }
  }

  private func serviceColor(for state: LaneServiceState) -> Color {
    switch state {
    case .running: .green
    case .starting: .yellow
    case .failed: .red
    case .stopped: .secondary
    case .checking: .blue
    case .unavailable: .gray.opacity(0.45)
    }
  }

  private func devCommandColor(for state: LaneDevCommandState) -> Color {
    switch state {
    case .running: .green
    case .starting, .stopping: .yellow
    case .stopped: .secondary
    case .unavailable: .gray.opacity(0.45)
    }
  }
}
