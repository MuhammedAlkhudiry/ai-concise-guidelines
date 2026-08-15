import AppKit
import Foundation

@MainActor
final class PlanStore: ObservableObject {
  @Published private(set) var projects: [PlanProject] = []
  @Published private(set) var plansRoot = "~/plans"
  @Published private(set) var isRefreshing = false
  @Published private(set) var loadingPlanID: String?
  @Published private(set) var savingPlanID: String?
  @Published private(set) var queuedAutosavePlanIDs: Set<String> = []
  @Published private(set) var updatingStatusPlanID: String?
  @Published private(set) var archivingPlanID: String?
  @Published private(set) var isArchivingDone = false
  @Published private(set) var savedContents: [String: String] = [:]
  @Published private(set) var drafts: [String: String] = [:]
  @Published var selectedPlanID: String?
  @Published var errorMessage: String?

  private let client: PlanCommandClient
  private var autosaveTasks: [String: Task<Void, Never>] = [:]
  private let autosaveDelay: Duration = .milliseconds(800)

  init(client: PlanCommandClient = PlanCommandClient()) {
    self.client = client
  }

  var plans: [PlanItem] {
    projects.flatMap(\.plans)
  }

  var selectedPlan: PlanItem? {
    plans.first { $0.id == selectedPlanID }
  }

  var hasUnsavedChanges: Bool {
    plans.contains(where: isDirty)
  }

  var pendingCount: Int {
    plans.count { $0.status == .pending }
  }

  var progressCount: Int {
    plans.count { $0.status == .progress }
  }

  var doneCount: Int {
    plans.count { $0.status == .done }
  }

  func refresh() {
    guard !isRefreshing else { return }
    isRefreshing = true
    Task {
      defer { isRefreshing = false }
      do {
        let document = try await client.loadPlans()
        projects = document.projects.filter { !$0.plans.isEmpty }
        plansRoot = document.plansRoot
        let availableIDs = Set(plans.map(\.id))
        for id in Array(autosaveTasks.keys) where !availableIDs.contains(id) {
          cancelAutosave(for: id)
        }
        savedContents = savedContents.filter { availableIDs.contains($0.key) }
        drafts = drafts.filter { availableIDs.contains($0.key) }

        if selectedPlanID == nil || !availableIDs.contains(selectedPlanID!) {
          selectedPlanID = plans.first?.id
        }
        errorMessage = nil
        if let selectedPlan, !isDirty(selectedPlan) {
          await loadContents(for: selectedPlan, force: true)
        }
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func select(_ plan: PlanItem) {
    selectedPlanID = plan.id
    if savedContents[plan.id] == nil {
      Task { await loadContents(for: plan) }
    }
  }

  func draft(for plan: PlanItem) -> String {
    drafts[plan.id] ?? savedContents[plan.id] ?? ""
  }

  func updateDraft(_ contents: String, for plan: PlanItem) {
    drafts[plan.id] = contents
    if isDirty(plan) {
      scheduleAutosave(for: plan)
    } else {
      cancelAutosave(for: plan.id)
    }
  }

  func isDirty(_ plan: PlanItem) -> Bool {
    guard let draft = drafts[plan.id], let saved = savedContents[plan.id] else { return false }
    return draft != saved
  }

  func discardChanges(for plan: PlanItem) {
    guard let saved = savedContents[plan.id] else { return }
    cancelAutosave(for: plan.id)
    drafts[plan.id] = saved
  }

  func save(_ plan: PlanItem) {
    cancelAutosave(for: plan.id)
    Task { await persistDraft(for: plan) }
  }

  func archive(_ plan: PlanItem) {
    guard archivingPlanID == nil else { return }
    cancelAutosave(for: plan.id)
    archivingPlanID = plan.id
    Task {
      defer { archivingPlanID = nil }
      do {
        if isDirty(plan), let contents = drafts[plan.id] {
          try await client.save(contents, for: plan)
        }
        try await client.archive(plan)
        savedContents[plan.id] = nil
        drafts[plan.id] = nil
        if selectedPlanID == plan.id { selectedPlanID = nil }
        errorMessage = nil
        refresh()
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func setStatus(_ status: PlanStatus, for plan: PlanItem) {
    guard updatingStatusPlanID == nil, plan.status != status else { return }
    cancelAutosave(for: plan.id)
    updatingStatusPlanID = plan.id
    Task {
      defer { updatingStatusPlanID = nil }
      do {
        if isDirty(plan), let draft = drafts[plan.id] {
          try await client.save(settingStatus(status, in: draft), for: plan)
        } else {
          try await client.setStatus(status, for: plan)
        }
        let saved = try await client.loadContents(for: plan)
        savedContents[plan.id] = saved
        drafts[plan.id] = saved
        errorMessage = nil
        refresh()
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func archiveDone() {
    guard !isArchivingDone, doneCount > 0 else { return }
    isArchivingDone = true
    Task {
      defer { isArchivingDone = false }
      do {
        for plan in plans where plan.status == .done && isDirty(plan) {
          cancelAutosave(for: plan.id)
          if let draft = drafts[plan.id] {
            try await client.save(draft, for: plan)
          }
        }
        try await client.archiveDone()
        errorMessage = nil
        refresh()
      } catch {
        errorMessage = error.localizedDescription
      }
    }
  }

  func openInEditor(_ plan: PlanItem) {
    NSWorkspace.shared.open(URL(fileURLWithPath: plan.path))
  }

  func revealInFinder(_ plan: PlanItem) {
    NSWorkspace.shared.activateFileViewerSelecting([URL(fileURLWithPath: plan.path)])
  }

  private func loadContents(for plan: PlanItem, force: Bool = false) async {
    guard force || savedContents[plan.id] == nil else { return }
    guard !isDirty(plan) else { return }
    loadingPlanID = plan.id
    defer {
      if loadingPlanID == plan.id { loadingPlanID = nil }
    }
    do {
      let contents = try await client.loadContents(for: plan)
      savedContents[plan.id] = contents
      drafts[plan.id] = contents
      errorMessage = nil
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func scheduleAutosave(for plan: PlanItem) {
    cancelAutosave(for: plan.id)
    queuedAutosavePlanIDs.insert(plan.id)
    autosaveTasks[plan.id] = Task { [weak self] in
      do {
        try await Task.sleep(for: self?.autosaveDelay ?? .milliseconds(800))
        try Task.checkCancellation()
      } catch {
        return
      }
      guard let self else { return }
      self.autosaveTasks[plan.id] = nil
      self.queuedAutosavePlanIDs.remove(plan.id)
      await self.persistDraft(for: plan)
    }
  }

  private func cancelAutosave(for id: String) {
    autosaveTasks[id]?.cancel()
    autosaveTasks[id] = nil
    queuedAutosavePlanIDs.remove(id)
  }

  private func persistDraft(for plan: PlanItem) async {
    guard let contents = drafts[plan.id], isDirty(plan) else { return }
    guard savingPlanID == nil else {
      scheduleAutosave(for: plan)
      return
    }

    savingPlanID = plan.id
    defer {
      if savingPlanID == plan.id { savingPlanID = nil }
    }
    do {
      try await client.save(contents, for: plan)
      let saved = try await client.loadContents(for: plan)
      savedContents[plan.id] = saved

      if drafts[plan.id] == contents {
        drafts[plan.id] = saved
        cancelAutosave(for: plan.id)
      } else {
        scheduleAutosave(for: plan)
      }

      errorMessage = nil
      refresh()
    } catch {
      errorMessage = error.localizedDescription
    }
  }

  private func settingStatus(_ status: PlanStatus, in contents: String) -> String {
    if contents.range(of: #"(?m)^status:\s*.*$"#, options: .regularExpression) != nil {
      return contents.replacingOccurrences(
        of: #"(?m)^status:\s*.*$"#,
        with: "status: \(status.rawValue)",
        options: .regularExpression
      )
    }
    guard let closing = contents.range(of: "\n---", range: contents.startIndex..<contents.endIndex)
    else { return contents }
    return contents.replacingCharacters(
      in: closing,
      with: "\nstatus: \(status.rawValue)\n---"
    )
  }
}
