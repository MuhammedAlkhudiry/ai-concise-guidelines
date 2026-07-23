import SwiftUI

struct LanesMenuView: View {
  @ObservedObject var store: LaneStore
  @State private var selectedLaneID: String?

  private var allLanes: [LaneItem] {
    store.projects.flatMap(\.lanes)
  }

  private var selectedLane: LaneItem? {
    allLanes.first { $0.id == selectedLaneID } ?? allLanes.first
  }

  var body: some View {
    VStack(spacing: 0) {
      header
      Divider()
      content
    }
    .frame(width: 620, height: 470)
    .onAppear {
      store.refresh()
      if selectedLaneID == nil {
        selectedLaneID = allLanes.first?.id
      }
    }
  }

  private var header: some View {
    HStack(spacing: 8) {
      Image(systemName: "square.stack.3d.up.fill")
        .foregroundStyle(.tint)
      VStack(alignment: .leading, spacing: 0) {
        Text("Lanes")
          .font(.headline)
        Text("\(allLanes.count) lanes")
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
      VStack(spacing: 0) {
        if let errorMessage = store.errorMessage {
          LaneErrorBanner(message: errorMessage) {
            store.errorMessage = nil
          }
          .padding(.horizontal, 10)
          .padding(.vertical, 6)
        }

        if store.projects.isEmpty {
          ContentUnavailableView(
            "No Lanes",
            systemImage: "square.stack.3d.up.slash",
            description: Text("No configured lanes were returned.")
          )
          .frame(minHeight: 150)
        } else {
          HStack(spacing: 0) {
            laneList
            Divider()
            if let lane = selectedLane {
              detailPane(lane)
            }
          }
        }
      }
    }
  }

  private var laneList: some View {
    ScrollView {
      LazyVStack(spacing: 0) {
        ForEach(store.projects) { project in
          HStack {
            Text(project.name.uppercased())
              .font(.caption2.weight(.bold))
              .tracking(0.6)
              .foregroundStyle(.secondary)
            Spacer()
          }
          .padding(.horizontal, 10)
          .padding(.top, 8)
          .padding(.bottom, 4)

          ForEach(project.lanes) { lane in
            Button {
              selectedLaneID = lane.id
            } label: {
              HStack(spacing: 6) {
                Circle()
                  .fill(laneHealthColor(lane.health))
                  .frame(width: 6, height: 6)
                Text(lane.displayName)
                  .font(.caption.weight(selectedLaneID == lane.id ? .semibold : .regular))
                  .monospaced()
                Spacer()
              }
              .padding(.horizontal, 10)
              .padding(.vertical, 5)
              .background(
                selectedLaneID == lane.id ? Color.accentColor.opacity(0.15) : .clear,
                in: RoundedRectangle(cornerRadius: 4)
              )
              .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(
              "\(lane.projectName) \(lane.displayName), \(lane.health)"
            )
            .help(
              "\(lane.projectName) \(lane.displayName) environment: \(lane.health.capitalized)"
            )
          }
        }
      }
      .padding(.vertical, 4)
    }
    .frame(width: 150)
  }

  private func detailPane(_ lane: LaneItem) -> some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 12) {
        HStack(spacing: 8) {
          Circle()
            .fill(laneHealthColor(lane.health))
            .frame(width: 10, height: 10)
          VStack(alignment: .leading, spacing: 2) {
            Text("\(lane.projectName) · \(lane.displayName)")
              .font(.headline)
            Text(lane.path)
              .font(.caption2.monospaced())
              .foregroundStyle(.secondary)
              .lineLimit(1)
              .truncationMode(.middle)
          }
          Spacer()
          LaneHealthBadge(health: lane.health)
        }

        if let detail = lane.detail {
          Text(detail)
            .font(.caption)
            .foregroundStyle(.secondary)
        }

        HStack(spacing: 6) {
          ForEach(LaneAction.allCases, id: \.self) { action in
            Button {
              store.perform(action, on: lane)
              NSApplication.shared.keyWindow?.orderOut(nil)
            } label: {
              if store.isPerforming(action, on: lane) {
                ProgressView()
                  .controlSize(.small)
                  .frame(width: 16, height: 14)
              } else {
                HStack(spacing: 4) {
                  Image(systemName: action.systemImage)
                    .font(.system(size: 11, weight: .semibold))
                  Text(action.title)
                    .font(.caption.weight(.medium))
                }
              }
            }
            .buttonStyle(.plain)
            .disabled(store.activeAction != nil)
            .help("Open in \(action.title)")
            .accessibilityLabel(
              "Open \(lane.projectName) \(lane.displayName) in \(action.title)"
            )
            .frame(maxWidth: .infinity)
            .padding(.vertical, 7)
            .background(.quaternary.opacity(0.4), in: RoundedRectangle(cornerRadius: 6))
          }
        }

        Text("SERVICES")
          .font(.caption2.weight(.bold))
          .foregroundStyle(.tertiary)
          .padding(.top, 4)

        VStack(spacing: 4) {
          ForEach(store.services(for: lane)) { service in
            LaneServiceRow(
              service: service,
              isBusy: store.activeService != nil,
              onToggle: { store.toggle(service, on: lane) },
              loadLogs: { await store.latestLogs(for: service, on: lane) }
            )
          }
        }
      }
      .padding(12)
    }
    .frame(maxWidth: .infinity)
  }
}
