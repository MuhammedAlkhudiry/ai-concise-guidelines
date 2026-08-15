import AppKit
import SwiftUI

struct LanesMenuView: View {
  @ObservedObject var store: LaneStore
  @State private var selectedEnvironmentID: String?
  @State private var destroyConfirmation: LaneItem?
  @State private var serviceLog: ServiceLog?
  @State private var loadingLogID: String?

  private var allEnvironments: [LaneItem] { store.projects.flatMap(\.lanes) }

  private var selectedEnvironment: LaneItem? {
    allEnvironments.first { $0.id == selectedEnvironmentID } ?? allEnvironments.first
  }

  var body: some View {
    VStack(spacing: 0) {
      header
      Divider()
      content
    }
    .frame(width: 780, height: 510)
    .onAppear { store.refresh() }
    .onChange(of: allEnvironments.map(\.id)) { _, ids in
      if selectedEnvironmentID == nil || !ids.contains(selectedEnvironmentID!) {
        selectedEnvironmentID = ids.first
      }
    }
    .confirmationDialog(
      destroyConfirmation.map { "Destroy resources for \($0.displayName)?" } ?? "Destroy resources?",
      isPresented: Binding(
        get: { destroyConfirmation != nil },
        set: { if !$0 { destroyConfirmation = nil } }
      ),
      titleVisibility: .visible
    ) {
      Button("Destroy Runtime Resources", role: .destructive) {
        if let environment = destroyConfirmation { store.destroy(environment) }
        destroyConfirmation = nil
      }
      Button("Cancel", role: .cancel) { destroyConfirmation = nil }
    } message: {
      Text(
        "Databases, object storage, Herd site, managed environment files, services, and simulator resources will be removed. The worktree and its files remain untouched for the coding harness."
      )
    }
    .sheet(item: $serviceLog) { log in
      ServiceLogView(log: log)
    }
  }

  private var header: some View {
    HStack(spacing: 9) {
      Image(systemName: "square.stack.3d.up.fill")
        .font(.system(size: 16, weight: .semibold))
        .foregroundStyle(.tint)
      VStack(alignment: .leading, spacing: 1) {
        Text("Runtime Environments")
          .font(.headline)
        Text(headerSummary)
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
      Spacer()
      if store.isRefreshing {
        ProgressView()
          .controlSize(.small)
          .accessibilityLabel("Refreshing runtime environments")
      }
      Button {
        store.refresh()
      } label: {
        Label("Refresh", systemImage: "arrow.clockwise")
      }
      .buttonStyle(.borderless)
      .disabled(store.isRefreshing)
      .help("Refresh runtime and service status")

      Button {
        NSApplication.shared.terminate(nil)
      } label: {
        Image(systemName: "power")
      }
      .buttonStyle(.plain)
      .help("Quit Runtime Environments")
      .accessibilityLabel("Quit Runtime Environments")
    }
    .padding(.horizontal, 14)
    .padding(.vertical, 10)
  }

  private var headerSummary: String {
    let count = allEnvironments.count
    let label = "\(count) environment\(count == 1 ? "" : "s")"
    return store.totalResidentBytes.map { "\(label) · \(formattedMemory($0)) RAM" } ?? label
  }

  @ViewBuilder
  private var content: some View {
    if store.projects.isEmpty && store.isRefreshing {
      VStack(spacing: 10) {
        ProgressView()
        Text("Loading runtime environments…")
          .foregroundStyle(.secondary)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    } else {
      VStack(spacing: 0) {
        if let error = store.errorMessage {
          ErrorBanner(message: error) { store.errorMessage = nil }
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
        }
        if store.projects.isEmpty {
          ContentUnavailableView(
            "No Runtime Environments",
            systemImage: "square.stack.3d.up.slash",
            description: Text("Register a project, then provision its runtime resources with the lanes command.")
          )
          .frame(maxWidth: .infinity, maxHeight: .infinity)
        } else {
          HStack(spacing: 0) {
            sidebar
            Divider()
            if let environment = selectedEnvironment {
              detail(environment)
            }
          }
        }
      }
    }
  }

  private var sidebar: some View {
    ScrollView {
      LazyVStack(alignment: .leading, spacing: 12) {
        ForEach(store.projects) { project in
          projectSection(project)
        }
      }
      .padding(8)
    }
    .frame(width: 250)
    .background(Color(nsColor: .controlBackgroundColor).opacity(0.35))
  }

  private func projectSection(_ project: LaneProject) -> some View {
    VStack(alignment: .leading, spacing: 5) {
      HStack(spacing: 6) {
        Image(systemName: "folder.fill")
          .font(.caption2)
          .foregroundStyle(.tint)
        Text(project.name.uppercased())
          .font(.caption2.weight(.bold))
          .tracking(0.8)
        Text("\(project.lanes.count)")
          .font(.caption2.monospacedDigit())
          .foregroundStyle(.secondary)
        Spacer()
        let running = store.hasRunningServices(in: project)
        Button {
          store.setProjectServices(running: !running, in: project)
        } label: {
          Image(systemName: running ? "stop.fill" : "play.fill")
        }
        .buttonStyle(.plain)
        .disabled(store.activeService != nil || !project.lanes.contains(where: store.canControlServices))
        .help("\(running ? "Stop" : "Start") all \(project.name) services")
        .accessibilityLabel("\(running ? "Stop" : "Start") all \(project.name) services")
      }
      .padding(.horizontal, 7)

      ForEach(project.lanes) { environment in
        environmentRow(environment)
      }
    }
  }

  private func environmentRow(_ environment: LaneItem) -> some View {
    let selected = selectedEnvironmentID == environment.id
    let serviceSummary = store.serviceSummary(for: environment)
    return Button {
      selectedEnvironmentID = environment.id
    } label: {
      HStack(spacing: 8) {
        Circle()
          .fill(healthColor(environment.health))
          .frame(width: 8, height: 8)
        VStack(alignment: .leading, spacing: 2) {
          Text(environment.displayName)
            .font(.caption.weight(selected ? .semibold : .regular))
            .lineLimit(1)
          HStack(spacing: 5) {
            Text(environment.kind.title)
            Text("·")
            Text(store.compactServiceActivity(for: environment))
          }
          .font(.caption2)
          .foregroundStyle(.secondary)
        }
        Spacer()
        if store.isDestroying(environment) {
          ProgressView().controlSize(.mini)
        } else {
          Image(systemName: "chevron.right")
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.tertiary)
        }
      }
      .padding(.horizontal, 9)
      .padding(.vertical, 7)
      .contentShape(Rectangle())
      .background(
        selected ? Color.accentColor.opacity(0.14) : Color.clear,
        in: RoundedRectangle(cornerRadius: 7)
      )
    }
    .buttonStyle(.plain)
    .accessibilityLabel(
      "\(environment.projectName) \(environment.displayName), \(environment.kind.title), runtime \(environment.health.title), services \(serviceSummary.title)"
    )
  }

  private func detail(_ environment: LaneItem) -> some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 15) {
        environmentHeader(environment)
        quickActions(environment)
        runtimeCard(environment)
        servicesCard(environment)
        lifecycleCard(environment)
      }
      .padding(16)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .allowsHitTesting(!store.isDestroying(environment))
  }

  private func environmentHeader(_ environment: LaneItem) -> some View {
    HStack(alignment: .top, spacing: 10) {
      VStack(alignment: .leading, spacing: 5) {
        Text(environment.projectName)
          .font(.caption.weight(.medium))
          .foregroundStyle(.secondary)
        Text(environment.displayName)
          .font(.title2.weight(.semibold))
        Text(environment.path)
          .font(.caption2.monospaced())
          .foregroundStyle(.secondary)
          .lineLimit(1)
          .truncationMode(.middle)
          .help(environment.path)
      }
      Spacer()
      VStack(alignment: .trailing, spacing: 6) {
        StatusBadge(
          title: environment.health.title,
          systemImage: healthIcon(environment.health),
          color: healthColor(environment.health)
        )
        StatusBadge(
          title: environment.kind.title,
          systemImage: environment.isCanonical ? "building.2" : "hammer",
          color: .secondary
        )
      }
    }
  }

  private func quickActions(_ environment: LaneItem) -> some View {
    HStack(spacing: 7) {
      ForEach(LaneAction.allCases, id: \.self) { action in
        Button {
          store.perform(action, on: environment)
        } label: {
          if store.isPerforming(action, on: environment) {
            ProgressView().controlSize(.small)
          } else {
            Label(action.title, systemImage: action.systemImage)
          }
        }
        .buttonStyle(.bordered)
        .controlSize(.small)
        .frame(maxWidth: .infinity)
        .disabled(store.activeAction != nil)
        .help("Open \(environment.displayName) in \(action.title)")
      }
    }
  }

  private func runtimeCard(_ environment: LaneItem) -> some View {
    GroupBox {
      VStack(alignment: .leading, spacing: 9) {
        HStack(alignment: .top, spacing: 8) {
          Image(systemName: healthIcon(environment.health))
            .foregroundStyle(healthColor(environment.health))
          VStack(alignment: .leading, spacing: 2) {
            Text(runtimeHeadline(environment))
              .font(.caption.weight(.semibold))
            Text(runtimeExplanation(environment))
              .font(.caption2)
              .foregroundStyle(.secondary)
          }
          Spacer()
        }
        Button {
          store.repair(environment)
        } label: {
          if store.isRepairing(environment) {
            HStack(spacing: 5) {
              ProgressView().controlSize(.mini)
              Text("Repairing…")
            }
          } else {
            Label("Repair Runtime", systemImage: "wrench.and.screwdriver")
          }
        }
        .buttonStyle(.borderedProminent)
        .controlSize(.small)
        .disabled(store.activeAction != nil || store.activeService != nil)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    } label: {
      Label("Runtime", systemImage: "shippingbox")
        .font(.caption.weight(.semibold))
    }
  }

  private func servicesCard(_ environment: LaneItem) -> some View {
    let services = store.services(for: environment)
    let running = store.hasRunningServices(on: environment)
    return GroupBox {
      VStack(spacing: 0) {
        HStack {
          Text(store.serviceActivity(for: environment))
            .font(.caption2.weight(.semibold))
            .foregroundStyle(.secondary)
          if let memory = store.residentBytes(for: environment) {
            Text("· \(formattedMemory(memory)) RAM")
              .font(.caption2.monospacedDigit())
              .foregroundStyle(.secondary)
          }
          Spacer()
          Button {
            store.setLaneServices(running: !running, on: environment)
          } label: {
            Label(running ? "Stop All" : "Start All", systemImage: running ? "stop.fill" : "play.fill")
          }
          .buttonStyle(.borderless)
          .font(.caption2.weight(.semibold))
          .disabled(store.activeService != nil || !store.canControlServices(on: environment))
        }
        .padding(.bottom, 5)

        ForEach(Array(services.enumerated()), id: \.element.id) { index, service in
          if index > 0 { Divider() }
          serviceRow(service, environment: environment)
        }
      }
    } label: {
      Label("Services", systemImage: "waveform.path.ecg")
        .font(.caption.weight(.semibold))
    }
  }

  private func serviceRow(_ service: LaneService, environment: LaneItem) -> some View {
    HStack(spacing: 9) {
      Circle()
        .fill(serviceColor(service.state))
        .frame(width: 7, height: 7)
      VStack(alignment: .leading, spacing: 2) {
        HStack(spacing: 5) {
          Text(service.name)
            .font(.caption.weight(.medium))
          Text(service.state.title)
            .font(.caption2)
            .foregroundStyle(.secondary)
        }
        Text(service.detail ?? service.command ?? (service.managed ? "Managed by lanes" : "External"))
          .font(.caption2)
          .foregroundStyle(.tertiary)
          .lineLimit(1)
      }
      Spacer()
      if loadingLogID == "\(environment.id)/\(service.id)" {
        ProgressView().controlSize(.mini)
      } else {
        Button {
          loadLogs(service, environment: environment)
        } label: {
          Image(systemName: "doc.text.magnifyingglass")
        }
        .buttonStyle(.plain)
        .help("View \(service.name) details or logs")
        .accessibilityLabel("View \(service.name) details or logs")
      }
      if service.manageable {
        if service.state == .running {
          Button {
            store.restart(service, on: environment)
          } label: {
            Image(systemName: "arrow.clockwise")
          }
          .buttonStyle(.plain)
          .help("Restart \(service.name)")
          .accessibilityLabel("Restart \(service.name)")
        }
        Button {
          store.toggle(service, on: environment)
        } label: {
          Image(systemName: service.state == .running ? "stop.fill" : "play.fill")
        }
        .buttonStyle(.plain)
        .disabled(store.activeService != nil || service.state == .unavailable)
        .help("\(service.state == .running ? "Stop" : "Start") \(service.name)")
        .accessibilityLabel("\(service.state == .running ? "Stop" : "Start") \(service.name)")
      }
    }
    .padding(.vertical, 7)
  }

  private func lifecycleCard(_ environment: LaneItem) -> some View {
    GroupBox {
      if environment.isCanonical {
        Label(
          "Main is stable project infrastructure. Its runtime resources cannot be destroyed here.",
          systemImage: "lock.shield"
        )
        .font(.caption2)
        .foregroundStyle(.secondary)
        .frame(maxWidth: .infinity, alignment: .leading)
      } else {
        HStack(alignment: .center, spacing: 10) {
          VStack(alignment: .leading, spacing: 2) {
            Text("Task resource cleanup")
              .font(.caption.weight(.semibold))
            Text("Destroy runtime resources before the coding harness deletes this worktree.")
              .font(.caption2)
              .foregroundStyle(.secondary)
          }
          Spacer()
          Button("Destroy Resources…", role: .destructive) {
            destroyConfirmation = environment
          }
          .buttonStyle(.bordered)
          .controlSize(.small)
          .disabled(store.activeAction != nil || store.activeService != nil)
        }
      }
    } label: {
      Label("Lifecycle", systemImage: "arrow.triangle.2.circlepath")
        .font(.caption.weight(.semibold))
    }
  }

  private func loadLogs(_ service: LaneService, environment: LaneItem) {
    let id = "\(environment.id)/\(service.id)"
    loadingLogID = id
    Task {
      let text = await store.latestLogs(for: service, on: environment)
      loadingLogID = nil
      serviceLog = ServiceLog(id: id, title: "\(environment.displayName) · \(service.name)", text: text)
    }
  }

  private func runtimeHeadline(_ environment: LaneItem) -> String {
    switch environment.health {
    case .ready: "Runtime contract is current"
    case .drifted: "Runtime repair is needed"
    case .broken: "Runtime setup is broken"
    }
  }

  private func runtimeExplanation(_ environment: LaneItem) -> String {
    environment.healthReason
      ?? (environment.health == .ready
        ? "Managed files and isolated resources match the current project contract."
        : "Repair the environment to restore its managed resources.")
  }
}

private struct StatusBadge: View {
  let title: String
  let systemImage: String
  let color: Color

  var body: some View {
    Label(title, systemImage: systemImage)
      .font(.caption2.weight(.semibold))
      .foregroundStyle(color)
      .padding(.horizontal, 7)
      .padding(.vertical, 4)
      .background(color.opacity(0.1), in: Capsule())
  }
}

private struct ErrorBanner: View {
  let message: String
  let dismiss: () -> Void

  var body: some View {
    HStack(alignment: .top, spacing: 8) {
      Image(systemName: "exclamationmark.triangle.fill")
        .foregroundStyle(.red)
      Text(message)
        .font(.caption2)
        .lineLimit(3)
      Spacer()
      Button(action: dismiss) { Image(systemName: "xmark") }
        .buttonStyle(.plain)
        .accessibilityLabel("Dismiss error")
    }
    .padding(9)
    .background(Color.red.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
  }
}

private struct ServiceLog: Identifiable {
  let id: String
  let title: String
  let text: String
}

private struct ServiceLogView: View {
  let log: ServiceLog
  @Environment(\.dismiss) private var dismiss

  var body: some View {
    VStack(alignment: .leading, spacing: 10) {
      HStack {
        Text(log.title).font(.headline)
        Spacer()
        Button("Done") { dismiss() }
          .keyboardShortcut(.defaultAction)
      }
      ScrollView([.horizontal, .vertical]) {
        Text(log.text.isEmpty ? "No output captured yet." : log.text)
          .font(.system(.caption, design: .monospaced))
          .textSelection(.enabled)
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(10)
      }
      .background(.black.opacity(0.06), in: RoundedRectangle(cornerRadius: 8))
    }
    .padding(16)
    .frame(width: 620, height: 380)
  }
}

private func healthColor(_ health: LaneHealth) -> Color {
  switch health {
  case .ready: .green
  case .drifted: .orange
  case .broken: .red
  }
}

private func healthIcon(_ health: LaneHealth) -> String {
  switch health {
  case .ready: "checkmark.circle.fill"
  case .drifted: "exclamationmark.arrow.triangle.2.circlepath"
  case .broken: "xmark.octagon.fill"
  }
}

private func serviceColor(_ state: LaneServiceState) -> Color {
  switch state {
  case .running: .green
  case .starting, .stopping, .checking: .orange
  case .stopped: .secondary
  case .failed, .crashLooping, .unreachable: .red
  case .degraded: .yellow
  case .unavailable: .gray
  }
}

private func formattedMemory(_ bytes: Int64) -> String {
  ByteCountFormatter.string(fromByteCount: bytes, countStyle: .memory)
}
