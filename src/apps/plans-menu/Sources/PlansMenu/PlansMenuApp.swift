import SwiftUI

@main
struct PlansMenuApp: App {
  @StateObject private var store = PlanStore()

  var body: some Scene {
    MenuBarExtra("Plans", systemImage: "list.bullet.clipboard") {
      PlansMenuView(store: store)
    }
    .menuBarExtraStyle(.window)
  }
}
