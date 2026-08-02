import Foundation

struct AdsCommandClient: Sendable {
  private let executable: URL

  init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
    executable = homeDirectory.appending(path: "bin/ads")
  }

  func loadProjects() async throws -> AdsProjectsDocument {
    let executable = executable
    return try await Task.detached(priority: .utility) {
      guard FileManager.default.isExecutableFile(atPath: executable.path) else {
        throw AdsMenuError.message("The ads command is missing. Run mise run install.")
      }
      let data = try run(executable, arguments: ["projects", "--json"])
      return try JSONDecoder().decode(AdsProjectsDocument.self, from: data)
    }.value
  }

  func load(period: AdsPeriod, project: String?, refresh: Bool) async throws -> (
    AdsStatusDocument,
    AdsStatsDocument,
    AdsCampaignsDocument
  ) {
    let executable = executable
    return try await Task.detached(priority: .utility) {
      guard FileManager.default.isExecutableFile(atPath: executable.path) else {
        throw AdsMenuError.message("The ads command is missing. Run mise run install.")
      }
      let refreshArguments = refresh ? ["--refresh"] : []
      let projectArguments = project.map { ["--project", $0] } ?? []
      let statusData = try run(
        executable,
        arguments: ["status", "--json"] + projectArguments + refreshArguments
      )
      let statsData = try run(
        executable,
        arguments: ["stats", "--period", period.rawValue, "--json"] + projectArguments
          + refreshArguments
      )
      let campaignsData = try run(
        executable,
        arguments: ["campaigns", "--active", "--json"] + projectArguments + refreshArguments
      )
      let decoder = JSONDecoder()
      return try (
        decoder.decode(AdsStatusDocument.self, from: statusData),
        decoder.decode(AdsStatsDocument.self, from: statsData),
        decoder.decode(AdsCampaignsDocument.self, from: campaignsData)
      )
    }.value
  }

  func open(platform: String) async throws {
    let executable = executable
    try await Task.detached(priority: .userInitiated) {
      _ = try run(executable, arguments: ["open", platform])
    }.value
  }
}

private func run(_ executable: URL, arguments: [String]) throws -> Data {
  let process = Process()
  let output = Pipe()
  let errors = Pipe()
  process.executableURL = executable
  process.arguments = arguments
  process.standardOutput = output
  process.standardError = errors
  try process.run()
  process.waitUntilExit()
  let data = output.fileHandleForReading.readDataToEndOfFile()
  if process.terminationStatus != 0 {
    let errorData = errors.fileHandleForReading.readDataToEndOfFile()
    let message = String(data: errorData, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines)
    throw AdsMenuError.message(
      message?.isEmpty == false ? message! : "ads exited with status \(process.terminationStatus)."
    )
  }
  return data
}
