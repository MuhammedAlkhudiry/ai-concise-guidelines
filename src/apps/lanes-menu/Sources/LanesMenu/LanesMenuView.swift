import SwiftUI

struct LanesMenuView: View {
  @ObservedObject var store: LaneStore
  @State private var selectedLaneID: String?
  @State private var releaseConfirmationLaneID: String?
  @State private var destroyConfirmationLaneID: String?
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
        Text(
          store.totalResidentBytes.map {
            "\(allLanes.count) lanes · \(formattedMemory($0)) RAM"
          } ?? "\(allLanes.count) lanes"
        )
        .font(.caption2)
        .foregroundStyle(.secondary)
      }
      Spacer()
      if !store.cleanupJobs.isEmpty {
        let failedCleanup = store.cleanupJobs.contains { $0.lastError != nil }
        Label(
          failedCleanup
            ? "\(store.cleanupJobs.count) cleanup failed" : "\(store.cleanupJobs.count) cleaning",
          systemImage: failedCleanup ? "exclamationmark.triangle.fill" : "trash.slash.fill"
        )
        .font(.caption2.weight(.semibold))
        .foregroundStyle(failedCleanup ? Color.red : Color.orange)
        .help(cleanupHelp)
        .accessibilityLabel(cleanupHelp)
      }
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

  private var cleanupHelp: String {
    store.cleanupJobs.map { job in
      job.lastError.map { "\(job.title): \($0)" } ?? "\(job.title): \(job.phase)"
    }.joined(separator: "\n")
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
        ForEach(Array(store.projects.enumerated()), id: \.element.id) { index, project in
          if index > 0 {
            Divider()
              .padding(.horizontal, 10)
              .padding(.vertical, 7)
          }

          let isProjectRunning = store.hasRunningServices(in: project)
          HStack(spacing: 6) {
            Image(systemName: "folder.fill")
              .font(.system(size: 10, weight: .bold))
              .foregroundStyle(.tint)
            Text(project.name.uppercased())
              .font(.caption.weight(.heavy))
              .tracking(0.8)
              .foregroundStyle(.primary)
            Text("\(project.lanes.count)")
              .font(.caption2.monospacedDigit().weight(.semibold))
              .foregroundStyle(.secondary)
            Spacer()
            Button {
              store.setProjectServices(running: !isProjectRunning, in: project)
            } label: {
              if store.activeService == "\(project.id)/all/all" {
                HStack(spacing: 4) {
                  ProgressView()
                    .controlSize(.mini)
                  Text(isProjectRunning ? "Stopping…" : "Starting…")
                }
              } else {
                Label(
                  isProjectRunning ? "Stop All" : "Start All",
                  systemImage: isProjectRunning ? "stop.fill" : "play.fill"
                )
              }
            }
            .font(.caption2.weight(.semibold))
            .buttonStyle(.borderless)
            .fixedSize()
            .disabled(
              store.activeAction != nil || store.activeService != nil
                || project.lanes.contains(where: store.isDestroying)
                || !project.lanes.contains(where: store.canControlServices)
            )
            .help(
              "\(isProjectRunning ? "Stop" : "Start") all commands in \(project.name)"
            )
            .accessibilityLabel(
              "\(isProjectRunning ? "Stop" : "Start") all \(project.name) lanes"
            )
          }
          .padding(.horizontal, 8)
          .padding(.vertical, 6)
          .background(.quaternary.opacity(0.32), in: RoundedRectangle(cornerRadius: 6))
          .padding(.horizontal, 6)
          .padding(.bottom, 4)

          ForEach(project.lanes) { lane in
            let isLaneRunning = store.hasRunningServices(on: lane)
            let serviceSummary = store.serviceSummary(for: lane)
            let gitDiff = lane.gitDiff ?? .clean
            HStack(alignment: .center, spacing: 8) {
              Button {
                selectLane(lane)
              } label: {
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
                    Image(systemName: "arrow.triangle.branch")
                      .font(.system(size: 8, weight: .semibold))
                    Text(lane.branchName)
                      .lineLimit(1)
                      .truncationMode(.middle)
                  }
                  .foregroundStyle(
                    lane.branchName == lane.baseBranch
                      ? Color.secondary : Color.blue.opacity(0.72)
                  )
                  .frame(maxWidth: .infinity, alignment: .leading)
                  .font(.caption2.monospacedDigit())
                  .padding(.leading, 9)
                }
              }
              .buttonStyle(.plain)
              .frame(maxWidth: .infinity, alignment: .leading)
              .accessibilityLabel(
                "\(lane.projectName) \(lane.displayName), branch \(lane.branchName), \(gitDiff.additions) additions, \(gitDiff.deletions) deletions, \(gitDiff.untrackedFiles) untracked files, services \(serviceSummary.title)"
              )
              .help(
                "\(lane.projectName) \(lane.displayName) · \(lane.branchName) · +\(gitDiff.additions) −\(gitDiff.deletions)"
              )

              VStack(alignment: .trailing, spacing: 2) {
                if lane.availability == "available" {
                  LaneBaseSyncLabel(
                    state: lane.baseSyncState,
                    isSyncing: store.isSyncing(lane),
                    isEnabled: store.activeAction == nil && store.activeService == nil
                      && !store.isDestroying(lane),
                    sync: { store.sync(lane) }
                  )
                }
                HStack(spacing: 3) {
                  Text("+\(gitDiff.additions)")
                    .foregroundStyle(.green)
                  Text("−\(gitDiff.deletions)")
                    .foregroundStyle(.red)
                }
                .font(.caption2.monospacedDigit())
                .fixedSize()
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
                  || store.isDestroying(lane)
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
            .contentShape(Rectangle())
            .onTapGesture {
              selectLane(lane)
            }
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
            }
          }
          Spacer()
          LaneServiceSummaryBadge(summary: serviceSummary)
          laneActionsMenu(lane, status: ciStatus)
        }

        if serviceSummary == .checking || ciStatus.state == .checking {
          laneStatusLoadingPanel(
            checkingServices: serviceSummary == .checking,
            checkingPullRequest: ciStatus.state == .checking
          )
        }

        if pullRequestConfirmationLaneID == lane.id {
          pullRequestPreflight(lane, gitDiff: gitDiff)
        } else if let stage = store.pullRequestCreationStage(for: lane) {
          pullRequestProgress(stage)
        }

        HStack(spacing: 10) {
          if gitDiff.additions > 0 || gitDiff.deletions > 0 || gitDiff.untrackedFiles > 0 {
            Label {
              HStack(spacing: 4) {
                Text("\(gitDiff.additions) additions")
                  .foregroundStyle(.green)
                Text("·")
                  .foregroundStyle(.tertiary)
                Text("\(gitDiff.deletions) deletions")
                  .foregroundStyle(.red)
                if gitDiff.untrackedFiles > 0 {
                  Text("· \(gitDiff.untrackedFiles) untracked")
                    .foregroundStyle(.orange)
                }
              }
            } icon: {
              Image(systemName: "plus.forwardslash.minus")
                .foregroundStyle(.secondary)
            }
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

        if releaseConfirmationLaneID == lane.id {
          VStack(alignment: .leading, spacing: 8) {
            Text("Make Lane Available?")
              .font(.caption.weight(.semibold))
            Text(
              "This stops services, switches to the latest \(lane.baseBranch), resets task data, and verifies the lane. Committed branches remain available."
            )
            .font(.caption2)
            .foregroundStyle(.secondary)

            HStack(spacing: 8) {
              Button("Cancel") {
                releaseConfirmationLaneID = nil
              }
              .buttonStyle(.bordered)

              Button("Make Available") {
                releaseConfirmationLaneID = nil
                store.release(lane)
              }
              .buttonStyle(.borderedProminent)
            }
          }
          .padding(10)
          .background(.orange.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
        }

        if destroyConfirmationLaneID == lane.id {
          VStack(alignment: .leading, spacing: 8) {
            Text("Remove Lane Permanently?")
              .font(.caption.weight(.semibold))
            Text(
              "This stops services, deletes the clone at \(lane.path), and unregisters the lane. This cannot be undone."
            )
            .font(.caption2)
            .foregroundStyle(.secondary)

            HStack(spacing: 8) {
              Button("Cancel") {
                destroyConfirmationLaneID = nil
              }
              .buttonStyle(.bordered)

              Button("Remove Lane", role: .destructive) {
                destroyConfirmationLaneID = nil
                store.destroy(lane)
              }
              .buttonStyle(.borderedProminent)
            }
          }
          .padding(10)
          .background(.red.opacity(0.08), in: RoundedRectangle(cornerRadius: 8))
        }

        HStack {
          Text("SERVICES")
            .font(.caption2.weight(.bold))
            .foregroundStyle(.tertiary)
          Spacer()
          if let residentBytes = store.residentBytes(for: lane) {
            Label("Total \(formattedMemory(residentBytes))", systemImage: "memorychip")
              .font(.caption2.monospacedDigit().weight(.medium))
              .foregroundStyle(.secondary)
              .help("Total resident memory used by this lane's services")
              .accessibilityLabel(
                "Services use \(formattedMemory(residentBytes)) of memory in total"
              )
          }
        }
        .padding(.top, 4)

        if serviceSummary != .checking {
          VStack(spacing: 4) {
            ForEach(store.services(for: lane)) { service in
              LaneServiceRow(
                service: service,
                isBusy: store.activeService != nil,
                onToggle: { store.toggle(service, on: lane) },
                onRestart: { store.restart(service, on: lane) },
                loadLogs: { await store.latestLogs(for: service, on: lane) }
              )
              .id("\(lane.serviceKey)/\(service.id)")
            }
          }
        }
      }
      .padding(12)
    }
    .frame(maxWidth: .infinity)
    .allowsHitTesting(!store.isDestroying(lane))
  }

  private func selectLane(_ lane: LaneItem) {
    selectedLaneID = lane.id
    releaseConfirmationLaneID = nil
    destroyConfirmationLaneID = nil
    pullRequestConfirmationLaneID = nil
  }

  private func laneStatusLoadingPanel(
    checkingServices: Bool,
    checkingPullRequest: Bool
  ) -> some View {
    HStack(spacing: 9) {
      ProgressView()
        .controlSize(.small)
      VStack(alignment: .leading, spacing: 1) {
        Text("Checking lane status…")
          .font(.caption.weight(.semibold))
        Text(
          checkingServices && checkingPullRequest
            ? "Loading services and pull-request checks."
            : checkingServices
              ? "Loading service health and resource usage."
              : "Loading pull-request checks."
        )
        .font(.caption2)
        .foregroundStyle(.secondary)
      }
      Spacer()
      Button {
        store.refresh()
      } label: {
        Label("Retry", systemImage: "arrow.clockwise")
      }
      .buttonStyle(.bordered)
      .controlSize(.small)
      .disabled(store.isRefreshing)
    }
    .padding(9)
    .background(Color.blue.opacity(0.08), in: RoundedRectangle(cornerRadius: 7))
    .accessibilityElement(children: .contain)
  }

  private func laneActionsMenu(_ lane: LaneItem, status: LaneCiStatus) -> some View {
    Menu {
      if status.url != nil {
        Button {
          store.openBranch(for: lane)
        } label: {
          Label("Open Pull Request", systemImage: "arrow.up.right.square")
        }
      }

      Button {
        store.openGitHubBranch(for: lane)
      } label: {
        Label("Open Branch on GitHub", systemImage: "arrow.triangle.branch")
      }

      Button {
        copyToPasteboard(lane.branchName)
      } label: {
        Label("Copy Branch Name", systemImage: "doc.on.doc")
      }

      if lane.needsBaseUpdate {
        Divider()
        Button {
          store.sync(lane)
        } label: {
          Label("Fetch Latest", systemImage: "arrow.down.circle")
        }
        .disabled(store.activeAction != nil || store.activeService != nil || store.isSyncing(lane))
      }

      if lane.availability != "available" {
        Divider()
        Button {
          releaseConfirmationLaneID = lane.id
        } label: {
          Label("Make Lane Available…", systemImage: "arrow.counterclockwise")
        }
        .disabled(
          lane.hasWorkingTreeChanges || store.activeAction != nil
            || store.activeService != nil || store.isSyncing(lane)
        )
      }

      Divider()
      Button(role: .destructive) {
        destroyConfirmationLaneID = lane.id
      } label: {
        Label("Remove Lane…", systemImage: "trash")
      }
      .disabled(
        !lane.isRemovable || store.activeAction != nil || store.activeService != nil
          || store.isSyncing(lane)
      )
    } label: {
      if store.isReleasing(lane) {
        HStack(spacing: 4) {
          ProgressView()
            .controlSize(.mini)
          Text("Making Available…")
        }
      } else if store.isDestroying(lane) {
        HStack(spacing: 4) {
          ProgressView()
            .controlSize(.mini)
          Text("Removing…")
        }
      } else {
        Label("Lane Actions", systemImage: "ellipsis.circle")
      }
    }
    .buttonStyle(.bordered)
    .controlSize(.mini)
    .help("More actions for \(lane.projectName) \(lane.displayName)")
    .accessibilityLabel("Actions for \(lane.projectName) \(lane.displayName)")
  }

  private func copyToPasteboard(_ value: String) {
    NSPasteboard.general.clearContents()
    NSPasteboard.general.setString(value, forType: .string)
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
