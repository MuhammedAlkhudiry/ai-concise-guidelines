// swift-tools-version: 6.0

import PackageDescription

let package = Package(
  name: "AdsMenu",
  platforms: [.macOS(.v14)],
  products: [.executable(name: "AdsMenu", targets: ["AdsMenu"])],
  targets: [
    .executableTarget(name: "AdsMenu"),
    .testTarget(name: "AdsMenuTests", dependencies: ["AdsMenu"]),
  ]
)
