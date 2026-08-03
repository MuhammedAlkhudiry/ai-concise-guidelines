import SwiftUI

@main
struct AIUsageMenuApp: App {
  @StateObject private var store = AIUsageStore()

  var body: some Scene {
    MenuBarExtra {
      AIUsageMenuView(store: store)
    } label: {
      Label(store.menuBarTitle, systemImage: "gauge.with.dots.needle.67percent")
    }
    .menuBarExtraStyle(.window)
  }
}
