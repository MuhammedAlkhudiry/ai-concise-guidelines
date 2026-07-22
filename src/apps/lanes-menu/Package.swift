// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "LanesMenu",
    platforms: [.macOS(.v14)],
    products: [
        .executable(name: "LanesMenu", targets: ["LanesMenu"]),
    ],
    targets: [
        .executableTarget(name: "LanesMenu"),
        .testTarget(name: "LanesMenuTests", dependencies: ["LanesMenu"]),
    ]
)

