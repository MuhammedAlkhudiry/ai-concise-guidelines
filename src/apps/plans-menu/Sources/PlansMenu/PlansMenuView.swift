import AppKit
import SwiftUI

struct PlansMenuView: View {
  @ObservedObject var store: PlanStore
  @State private var searchQuery = ""
  @State private var selectedProjectID = "all"
  @State private var hoveredPlanID: String?

  private var visibleProjects: [PlanProject] {
    store.projects.compactMap { project in
      guard selectedProjectID == "all" || selectedProjectID == project.id else { return nil }
      let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
      let plans = query.isEmpty
        ? project.plans
        : project.plans.filter { plan in
          [plan.title, plan.description, plan.name, plan.project]
            .contains { $0.lowercased().contains(query) }
        }
      return plans.isEmpty ? nil : PlanProject(id: project.id, plans: plans)
    }
  }

  var body: some View {
    VStack(spacing: 0) {
      header
      Divider()
      if let error = store.errorMessage {
        errorBanner(error)
        Divider()
      }
      content
    }
    .frame(width: 1_200, height: 800)
    .onAppear { store.refresh() }
  }

  private var header: some View {
    HStack(spacing: 9) {
      Image(systemName: "list.bullet.clipboard")
        .font(.system(size: 15, weight: .semibold))
        .foregroundStyle(.tint)
      VStack(alignment: .leading, spacing: 0) {
        Text("Plans")
          .font(.headline)
        HStack(spacing: 4) {
          Text("\(store.pendingCount) pending")
            .foregroundStyle(.orange)
          Text("·")
            .foregroundStyle(.tertiary)
          Text("\(store.progressCount) progress")
            .foregroundStyle(.blue)
          Text("·")
            .foregroundStyle(.tertiary)
          Text("\(store.doneCount) done")
            .foregroundStyle(.green)
          Text("across \(store.projects.count) projects")
            .foregroundStyle(.secondary)
        }
        .font(.caption2)
      }
      Spacer()
      if store.hasUnsavedChanges {
        Label("Unsaved edits", systemImage: "circle.fill")
          .font(.caption)
          .foregroundStyle(.orange)
      }
      if store.isRefreshing {
        ProgressView()
          .controlSize(.small)
      }
      Button {
        store.archiveDone()
      } label: {
        if store.isArchivingDone {
          HStack(spacing: 5) {
            ProgressView()
              .controlSize(.mini)
            Text("Archiving…")
          }
        } else {
          Label("Archive Done (\(store.doneCount))", systemImage: "archivebox")
        }
      }
      .buttonStyle(.borderless)
      .disabled(store.doneCount == 0 || store.isArchivingDone)
      .help("Archive every done plan across all projects")
      Button {
        store.refresh()
      } label: {
        Label("Refresh", systemImage: "arrow.clockwise")
      }
      .buttonStyle(.borderless)
      .disabled(store.isRefreshing)
      .help("Refresh plans from disk")
      Button {
        NSApplication.shared.terminate(nil)
      } label: {
        Image(systemName: "power")
      }
      .buttonStyle(.plain)
      .help("Quit Plans")
      .accessibilityLabel("Quit Plans")
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 9)
  }

  @ViewBuilder
  private var content: some View {
    if store.projects.isEmpty && store.isRefreshing {
      VStack(spacing: 10) {
        ProgressView()
        Text("Loading plans…")
          .foregroundStyle(.secondary)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    } else if store.projects.isEmpty {
      ContentUnavailableView(
        "No active plans",
        systemImage: "list.bullet.clipboard",
        description: Text("Plans saved under ~/plans will appear here.")
      )
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    } else {
      HStack(spacing: 0) {
        sidebar
        Divider()
        detail
      }
    }
  }

  private var sidebar: some View {
    VStack(spacing: 0) {
      VStack(spacing: 8) {
        HStack(spacing: 6) {
          Image(systemName: "magnifyingglass")
            .foregroundStyle(.secondary)
          TextField("Search plans", text: $searchQuery)
            .textFieldStyle(.plain)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 6)
        .background(.quaternary.opacity(0.55), in: RoundedRectangle(cornerRadius: 7))

        Picker("Project", selection: $selectedProjectID) {
          Label("All projects", systemImage: "square.grid.2x2").tag("all")
          ForEach(store.projects) { project in
            Text(project.displayName).tag(project.id)
          }
        }
        .pickerStyle(.menu)
        .frame(maxWidth: .infinity, alignment: .leading)
      }
      .padding(10)

      Divider()

      if visibleProjects.isEmpty {
        ContentUnavailableView.search(text: searchQuery)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
      } else {
        ScrollView {
          LazyVStack(alignment: .leading, spacing: 12) {
            ForEach(visibleProjects) { project in
              VStack(alignment: .leading, spacing: 4) {
                HStack {
                  Text(project.displayName.uppercased())
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(.secondary)
                  Spacer()
                  Text("\(project.plans.count)")
                    .font(.caption2.monospacedDigit())
                    .foregroundStyle(.tertiary)
                }
                .padding(.horizontal, 6)

                ForEach(project.plans) { plan in
                  planRow(plan)
                }
              }
            }
          }
          .padding(7)
        }
      }

      Divider()
      Label(store.plansRoot, systemImage: "folder")
        .font(.caption2)
        .foregroundStyle(.secondary)
        .lineLimit(1)
        .truncationMode(.middle)
        .help(store.plansRoot)
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
    }
    .frame(width: 340)
  }

  private func planRow(_ plan: PlanItem) -> some View {
    HStack(alignment: .top, spacing: 2) {
      Button {
        store.select(plan)
      } label: {
        HStack(alignment: .top, spacing: 8) {
          Image(systemName: store.isDirty(plan) ? "circle.fill" : "doc.text")
            .font(.system(size: store.isDirty(plan) ? 7 : 12, weight: .semibold))
            .foregroundStyle(store.isDirty(plan) ? .orange : .secondary)
            .frame(width: 14, height: 18)
          VStack(alignment: .leading, spacing: 3) {
            Text(plan.title)
              .font(.caption.weight(.semibold))
              .lineLimit(2)
            if !plan.description.isEmpty {
              Text(plan.description)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            }
            HStack(spacing: 6) {
              Label(plan.status.title, systemImage: plan.status.systemImage)
                .foregroundStyle(plan.status.color)
              Text("Updated \(plan.updated)")
                .monospacedDigit()
                .foregroundStyle(.tertiary)
            }
            .font(.caption2)
          }
          Spacer(minLength: 0)
        }
        .contentShape(Rectangle())
      }
      .buttonStyle(.plain)
      .accessibilityLabel("\(plan.title), \(plan.status.title), updated \(plan.updated)")

      Button {
        store.archive(plan)
      } label: {
        if store.archivingPlanID == plan.id {
          ProgressView()
            .controlSize(.mini)
        } else {
          Image(systemName: "archivebox")
            .font(.system(size: 11, weight: .semibold))
        }
      }
      .buttonStyle(.plain)
      .foregroundStyle(.secondary)
      .frame(width: 24, height: 24)
      .opacity(
        hoveredPlanID == plan.id || store.selectedPlanID == plan.id
          || store.archivingPlanID == plan.id ? 1 : 0
      )
      .disabled(store.archivingPlanID != nil)
      .help("Archive \(plan.title)")
      .accessibilityLabel("Archive \(plan.title)")
    }
    .padding(.horizontal, 8)
    .padding(.vertical, 7)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(
      store.selectedPlanID == plan.id ? Color.accentColor.opacity(0.14) : .clear,
      in: RoundedRectangle(cornerRadius: 7)
    )
    .onHover { isHovering in
      hoveredPlanID = isHovering ? plan.id : (hoveredPlanID == plan.id ? nil : hoveredPlanID)
    }
    .animation(.easeOut(duration: 0.12), value: hoveredPlanID == plan.id)
  }

  @ViewBuilder
  private var detail: some View {
    if let plan = store.selectedPlan {
      VStack(spacing: 0) {
        planHeader(plan)
        Divider()
        detailToolbar(plan)
        Divider()
        planContent(plan)
      }
    } else {
      ContentUnavailableView(
        "Select a plan",
        systemImage: "doc.text.magnifyingglass",
        description: Text("Choose a plan to review or edit it.")
      )
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
  }

  private func planHeader(_ plan: PlanItem) -> some View {
    HStack(alignment: .top, spacing: 12) {
      VStack(alignment: .leading, spacing: 5) {
        Text(plan.title)
          .font(.title3.weight(.semibold))
          .textSelection(.enabled)
        if !plan.description.isEmpty {
          Text(plan.description)
            .font(.caption)
            .foregroundStyle(.secondary)
            .textSelection(.enabled)
        }
        HStack(spacing: 12) {
          Label(plan.status.title, systemImage: plan.status.systemImage)
            .foregroundStyle(plan.status.color)
          Label(plan.project, systemImage: "folder")
          Label("Updated \(plan.updated)", systemImage: "calendar")
          Label(plan.relativePath, systemImage: "doc")
        }
        .font(.caption2)
        .foregroundStyle(.secondary)
      }
      Spacer()
      Button {
        store.openInEditor(plan)
      } label: {
        Label("Open in Editor", systemImage: "arrow.up.forward.app")
      }
      .controlSize(.small)
      .help("Open with the default Markdown editor")
      Menu {
        Button {
          store.revealInFinder(plan)
        } label: {
          Label("Reveal in Finder", systemImage: "folder")
        }
        Divider()
        Button(role: .destructive) {
          store.archive(plan)
        } label: {
          Label("Archive Plan", systemImage: "archivebox")
        }
        .disabled(store.archivingPlanID != nil)
      } label: {
        Image(systemName: "ellipsis.circle")
      }
      .menuStyle(.borderlessButton)
      .fixedSize()
      .accessibilityLabel("Plan actions")
    }
    .padding(14)
  }

  private func detailToolbar(_ plan: PlanItem) -> some View {
    HStack(spacing: 10) {
      Menu {
        ForEach(PlanStatus.allCases) { status in
          Button {
            store.setStatus(status, for: plan)
          } label: {
            Label(status.title, systemImage: status.systemImage)
          }
          .disabled(plan.status == status)
        }
      } label: {
        if store.updatingStatusPlanID == plan.id {
          ProgressView()
            .controlSize(.mini)
        } else {
          Label(plan.status.title, systemImage: plan.status.systemImage)
            .foregroundStyle(plan.status.color)
        }
      }
      .menuStyle(.borderlessButton)
      .fixedSize()
      .disabled(store.updatingStatusPlanID != nil)
      .help("Change plan status")

      Divider()
        .frame(height: 14)

      Label("Live Markdown", systemImage: "text.cursor")
        .font(.caption)
        .foregroundStyle(.secondary)

      Spacer()

      if store.savingPlanID == plan.id {
        ProgressView()
          .controlSize(.small)
        Text("Saving…")
          .font(.caption)
          .foregroundStyle(.secondary)
      } else if store.isDirty(plan) {
        Label(
          store.queuedAutosavePlanIDs.contains(plan.id) ? "Autosaving…" : "Unsaved changes",
          systemImage: store.queuedAutosavePlanIDs.contains(plan.id) ? "clock" : "circle.fill"
        )
          .font(.caption)
          .foregroundStyle(.orange)
        Button("Discard") {
          store.discardChanges(for: plan)
        }
        .controlSize(.small)
        Button {
          store.save(plan)
        } label: {
          Label("Save Now", systemImage: "square.and.arrow.down")
        }
        .controlSize(.small)
        .buttonStyle(.borderedProminent)
        .keyboardShortcut("s", modifiers: .command)
      } else {
        Label("Saved", systemImage: "checkmark.circle.fill")
          .font(.caption)
          .foregroundStyle(.green)
      }
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
  }

  @ViewBuilder
  private func planContent(_ plan: PlanItem) -> some View {
    if store.loadingPlanID == plan.id && store.savedContents[plan.id] == nil {
      VStack(spacing: 10) {
        ProgressView()
        Text("Loading plan…")
          .foregroundStyle(.secondary)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    } else if store.savedContents[plan.id] == nil {
      ContentUnavailableView(
        "Plan unavailable",
        systemImage: "exclamationmark.triangle",
        description: Text("Refresh to try loading it again.")
      )
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    } else {
      LiveMarkdownEditor(
        text: Binding(
          get: { store.draft(for: plan) },
          set: { store.updateDraft($0, for: plan) }
        )
      )
      .background(Color(nsColor: .textBackgroundColor).opacity(0.2))
    }
  }

  private func errorBanner(_ error: String) -> some View {
    HStack(spacing: 8) {
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
      .accessibilityLabel("Dismiss error")
    }
    .padding(.horizontal, 12)
    .padding(.vertical, 8)
    .background(.orange.opacity(0.1))
  }
}
