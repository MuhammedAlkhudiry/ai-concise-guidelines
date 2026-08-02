import SwiftUI

struct LanesMenuView: View {
  @ObservedObject var store: LaneStore
  @State private var selectedLaneID: String?
  @State private var releaseConfirmationLaneID: String?
  @State private var pullRequestConfirmationLaneID: String?

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
    .frame(width: 730, height: 470)
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
          let isProjectRunning = store.hasRunningServices(in: project)
          HStack(spacing: 6) {
            Text(project.name.uppercased())
              .font(.caption2.weight(.bold))
              .tracking(0.6)
              .foregroundStyle(.secondary)
            Spacer()
            Button {
              store.setProjectServices(running: !isProjectRunning, in: project)
            } label: {
              if store.activeService == "\(project.id)/all/all" {
                ProgressView()
                  .controlSize(.mini)
                  .frame(width: 12, height: 12)
              } else {
                Image(systemName: isProjectRunning ? "stop.fill" : "play.fill")
                  .font(.system(size: 9, weight: .bold))
                  .frame(width: 12, height: 12)
              }
            }
            .buttonStyle(.plain)
            .disabled(
              store.activeAction != nil || store.activeService != nil
                || !project.lanes.contains(where: store.canControlServices)
            )
            .help(
              "\(isProjectRunning ? "Stop" : "Start") all commands in \(project.name)"
            )
            .accessibilityLabel(
              "\(isProjectRunning ? "Stop" : "Start") all \(project.name) lanes"
            )
          }
          .padding(.horizontal, 10)
          .padding(.top, 8)
          .padding(.bottom, 4)

          ForEach(project.lanes) { lane in
            let isLaneRunning = store.hasRunningServices(on: lane)
            let serviceSummary = store.serviceSummary(for: lane)
            let gitDiff = lane.gitDiff ?? .clean
            HStack(alignment: .center, spacing: 8) {
              VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                  Circle()
                    .fill(laneServiceSummaryColor(serviceSummary))
                    .frame(width: 6, height: 6)
                  Text(lane.displayName)
                    .font(.caption.weight(selectedLaneID == lane.id ? .semibold : .regular))
                    .monospaced()
                  Spacer()
                }

                HStack(spacing: 3) {
                  HStack(spacing: 3) {
                    Image(systemName: "arrow.triangle.branch")
                      .font(.system(size: 8, weight: .semibold))
                    Text(lane.branchName)
                      .lineLimit(1)
                      .truncationMode(.middle)
                    if lane.availability == "available" {
                      LaneBaseSyncLabel(
                        state: lane.baseSyncState,
                        isSyncing: store.isSyncing(lane),
                        isEnabled: store.activeAction == nil && store.activeService == nil,
                        sync: { store.sync(lane) }
                      )
                    }
                  }
                  .foregroundStyle(
                    lane.branchName == lane.baseBranch
                      ? Color.secondary : Color.blue.opacity(0.72)
                  )
                  .frame(maxWidth: .infinity, alignment: .leading)

                  HStack(spacing: 3) {
                    Text("+\(gitDiff.additions)")
                      .foregroundStyle(.green)
                    Text("−\(gitDiff.deletions)")
                      .foregroundStyle(.red)
                  }
                  .fixedSize()
                  .layoutPriority(1)
                }
                .font(.caption2.monospacedDigit())
                .padding(.leading, 9)
              }
              .frame(maxWidth: .infinity, alignment: .leading)
              .contentShape(Rectangle())
              .onTapGesture {
                selectedLaneID = lane.id
              }
              .accessibilityLabel(
                "\(lane.projectName) \(lane.displayName), branch \(lane.branchName), \(gitDiff.additions) additions, \(gitDiff.deletions) deletions, \(gitDiff.untrackedFiles) untracked files, services \(serviceSummary.title)"
              )
              .help(
                "\(lane.projectName) \(lane.displayName) · \(lane.branchName) · +\(gitDiff.additions) −\(gitDiff.deletions)"
              )
              .accessibilityAddTraits(.isButton)
              .accessibilityAction {
                selectedLaneID = lane.id
              }

              Button {
                store.setLaneServices(running: !isLaneRunning, on: lane)
              } label: {
                if store.activeService == "\(lane.serviceKey)/all" {
                  ProgressView()
                    .controlSize(.mini)
                    .frame(width: 12, height: 12)
                } else {
                  Image(systemName: isLaneRunning ? "stop.fill" : "play.fill")
                    .font(.system(size: 9, weight: .bold))
                    .frame(width: 12, height: 12)
                }
              }
              .buttonStyle(.plain)
              .disabled(
                store.activeAction != nil || store.activeService != nil
                  || !store.canControlServices(on: lane)
              )
              .help(
                "\(isLaneRunning ? "Stop" : "Start") all commands in \(lane.projectName) \(lane.displayName)"
              )
              .accessibilityLabel(
                "\(isLaneRunning ? "Stop" : "Start") \(lane.projectName) \(lane.displayName)"
              )
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 3)
            .background(
              selectedLaneID == lane.id ? Color.accentColor.opacity(0.15) : .clear,
              in: RoundedRectangle(cornerRadius: 4)
            )
          }
        }
      }
      .padding(.vertical, 4)
    }
    .frame(width: 260)
  }

  private func detailPane(_ lane: LaneItem) -> some View {
    let serviceSummary = store.serviceSummary(for: lane)
    let ciStatus = store.ciStatus(for: lane)
    let gitDiff = lane.gitDiff ?? .clean
    return ScrollView {
      VStack(alignment: .leading, spacing: 12) {
        HStack(spacing: 8) {
          Circle()
            .fill(laneServiceSummaryColor(serviceSummary))
            .frame(width: 10, height: 10)
          VStack(alignment: .leading, spacing: 2) {
            Text("\(lane.projectName) · \(lane.displayName)")
              .font(.headline)
            HStack(spacing: 4) {
              LaneBranchBadge(
                branch: lane.branchName,
                status: ciStatus,
                isOpening: store.isOpeningBranch(for: lane),
                open: { store.openBranch(for: lane) },
                openGitHubBranch: { store.openGitHubBranch(for: lane) }
              )
              if ciStatus.state == .noPR && lane.branch != nil
                && lane.branchName != lane.baseBranch
              {
                Button {
                  pullRequestConfirmationLaneID = lane.id
                } label: {
                  if store.isCreatingPullRequest(for: lane) {
                    HStack(spacing: 4) {
                      ProgressView()
                        .controlSize(.mini)
                      Text(store.pullRequestCreationStage(for: lane)?.title ?? "Creating PR…")
                    }
                  } else {
                    Label("Create PR", systemImage: "arrow.triangle.pull")
                  }
                }
                .buttonStyle(.bordered)
                .controlSize(.mini)
                .disabled(store.activeAction != nil || !lane.hasProposableChanges)
                .help(
                  lane.hasProposableChanges
                    ? "Review, commit, push \(lane.branchName), and create a pull request"
                    : "No changes to propose against \(lane.baseBranch)"
                )
                .accessibilityLabel("Create pull request for branch \(lane.branchName)")
              }
              if ciStatus.state == .merged {
                Button {
                  releaseConfirmationLaneID = lane.id
                } label: {
                  Label("Make Available", systemImage: "arrow.counterclockwise")
                }
                .buttonStyle(.bordered)
                .controlSize(.mini)
                .tint(.orange)
                .disabled(store.activeAction != nil || store.activeService != nil)
                .help("Release this merged lane back to the available pool")
              }
              if lane.availability == "available" {
                LaneBaseSyncLabel(
                  state: lane.baseSyncState,
                  isSyncing: store.isSyncing(lane),
                  isEnabled: store.activeAction == nil && store.activeService == nil,
                  sync: { store.sync(lane) }
                )
              }
            }
          }
          Spacer()
          LaneServiceSummaryBadge(summary: serviceSummary)
        }

        if pullRequestConfirmationLaneID == lane.id {
          pullRequestPreflight(lane, gitDiff: gitDiff)
        } else if let stage = store.pullRequestCreationStage(for: lane) {
          pullRequestProgress(stage)
        }

        HStack(spacing: 8) {
          Text("+\(gitDiff.additions)")
            .foregroundStyle(.green)
          Text("−\(gitDiff.deletions)")
            .foregroundStyle(.red)
          if gitDiff.untrackedFiles > 0 {
            Text("\(gitDiff.untrackedFiles) untracked")
              .foregroundStyle(.orange)
          }
          if lane.branchName != lane.baseBranch {
            LaneCiLabel(status: ciStatus)
          }
        }
        .font(.caption.monospacedDigit().weight(.medium))
        .accessibilityElement(children: .contain)

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

        if lane.availability != "available" {
          if releaseConfirmationLaneID == lane.id {
            VStack(alignment: .leading, spacing: 8) {
              Text("Make Lane Available?")
                .font(.caption.weight(.semibold))
              Text(
                "This stops services, permanently discards Git changes, switches to the latest \(lane.baseBranch), resets task data, and verifies the lane."
              )
              .font(.caption2)
              .foregroundStyle(.secondary)

              HStack(spacing: 8) {
                Button("Cancel") {
                  releaseConfirmationLaneID = nil
                }
                .buttonStyle(.bordered)

                Button("Discard Work and Release", role: .destructive) {
                  releaseConfirmationLaneID = nil
                  store.release(lane)
                }
                .buttonStyle(.borderedProminent)
              }
            }
            .padding(10)
            .background(.orange.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
          } else if ciStatus.state != .merged {
            Button {
              releaseConfirmationLaneID = lane.id
            } label: {
              if store.isReleasing(lane) {
                HStack(spacing: 6) {
                  ProgressView()
                    .controlSize(.small)
                  Text("Making Available…")
                }
              } else {
                Label("Make Lane Available", systemImage: "arrow.counterclockwise")
              }
            }
            .buttonStyle(.bordered)
            .tint(.orange)
            .disabled(store.activeAction != nil || store.activeService != nil)
            .help("Discard lane work and return it to the latest \(lane.baseBranch)")
            .accessibilityLabel("Make \(lane.projectName) \(lane.displayName) available")
            .frame(maxWidth: .infinity, alignment: .trailing)
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
              onRestart: { store.restart(service, on: lane) },
              loadLogs: { await store.latestLogs(for: service, on: lane) }
            )
          }
        }
      }
      .padding(12)
    }
    .frame(maxWidth: .infinity)
  }

  private func pullRequestPreflight(_ lane: LaneItem, gitDiff: LaneGitDiff) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Label("Create Pull Request?", systemImage: "arrow.triangle.pull")
        .font(.caption.weight(.semibold))
      Text("\(lane.branchName) → \(lane.baseBranch)")
        .font(.caption2.monospaced())
        .foregroundStyle(.secondary)

      HStack(spacing: 10) {
        if let commits = lane.baseBranchAhead, commits > 0 {
          Label("\(commits) commit\(commits == 1 ? "" : "s")", systemImage: "circle.fill")
        }
        if gitDiff.additions > 0 {
          Text("+\(gitDiff.additions)")
            .foregroundStyle(.green)
        }
        if gitDiff.deletions > 0 {
          Text("−\(gitDiff.deletions)")
            .foregroundStyle(.red)
        }
        if gitDiff.untrackedFiles > 0 {
          Text("\(gitDiff.untrackedFiles) untracked")
            .foregroundStyle(.orange)
        }
      }
      .font(.caption2.monospacedDigit())

      VStack(alignment: .leading, spacing: 3) {
        Label("Generate commit and PR copy", systemImage: "sparkles")
        if lane.hasWorkingTreeChanges {
          Label("Commit all current changes", systemImage: "checkmark.circle")
        }
        Label("Push \(lane.branchName)", systemImage: "arrow.up.circle")
        Label("Create the GitHub pull request", systemImage: "arrow.up.right.square")
      }
      .font(.caption2)
      .foregroundStyle(.secondary)

      HStack(spacing: 8) {
        Button("Cancel") {
          pullRequestConfirmationLaneID = nil
        }
        .buttonStyle(.bordered)

        Button {
          pullRequestConfirmationLaneID = nil
          store.createPullRequest(for: lane)
        } label: {
          Label(
            lane.hasWorkingTreeChanges ? "Commit, Push & Create PR" : "Push & Create PR",
            systemImage: "arrow.triangle.pull"
          )
        }
        .buttonStyle(.borderedProminent)
      }
      .controlSize(.small)
    }
    .padding(10)
    .background(Color.accentColor.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
  }

  private func pullRequestProgress(_ stage: PullRequestCreationStage) -> some View {
    HStack(spacing: 8) {
      ProgressView()
        .controlSize(.small)
      VStack(alignment: .leading, spacing: 1) {
        Text(stage.title)
          .font(.caption.weight(.semibold))
        Text("Keep Lanes open while this finishes.")
          .font(.caption2)
          .foregroundStyle(.secondary)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(10)
    .background(Color.accentColor.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
    .accessibilityElement(children: .combine)
    .accessibilityLabel(stage.title)
  }
}
