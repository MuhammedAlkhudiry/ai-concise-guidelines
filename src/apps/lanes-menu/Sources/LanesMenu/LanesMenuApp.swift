import SwiftUI

@main
struct LanesMenuApp: App {
  @StateObject private var store = LaneStore()

  var body: some Scene {
    MenuBarExtra("Lanes", systemImage: "square.stack.3d.up.fill") {
      LanesMenuView(store: store)
    }
    .menuBarExtraStyle(.window)
  }
}
