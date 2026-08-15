// swift-tools-version: 6.2

import PackageDescription

let package = Package(
  name: "PlansMenu",
  platforms: [.macOS(.v14)],
  products: [
    .executable(name: "PlansMenu", targets: ["PlansMenu"]),
  ],
  targets: [
    .executableTarget(name: "PlansMenu"),
    .testTarget(name: "PlansMenuTests", dependencies: ["PlansMenu"]),
  ]
)
