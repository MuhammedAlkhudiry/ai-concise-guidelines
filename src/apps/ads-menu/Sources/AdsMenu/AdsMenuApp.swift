import SwiftUI

@main
struct AdsMenuApp: App {
  @StateObject private var store = AdsStore()

  var body: some Scene {
    MenuBarExtra("Ads", systemImage: "chart.bar.xaxis") {
      AdsMenuView(store: store)
    }
    .menuBarExtraStyle(.window)
  }
}
