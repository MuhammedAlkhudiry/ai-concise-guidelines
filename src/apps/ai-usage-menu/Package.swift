// swift-tools-version: 6.0

import PackageDescription

let package = Package(
  name: "AIUsageMenu",
  platforms: [.macOS(.v14)],
  products: [.executable(name: "AIUsageMenu", targets: ["AIUsageMenu"])],
  targets: [
    .executableTarget(name: "AIUsageMenu"),
    .testTarget(name: "AIUsageMenuTests", dependencies: ["AIUsageMenu"]),
  ]
)
