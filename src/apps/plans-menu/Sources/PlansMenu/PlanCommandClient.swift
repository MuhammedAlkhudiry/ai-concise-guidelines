import Foundation

struct PlanCommandClient: Sendable {
  private let executable: URL

  init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
    executable = homeDirectory.appending(path: "bin/lanes")
  }

  func loadPlans() async throws -> PlansDocument {
    let executable = executable
    return try await Task.detached(priority: .utility) {
      try requireExecutable(executable)
      let data = try run(executable, arguments: ["plans", "list", "--all", "--json"])
      return try JSONDecoder().decode(PlansDocument.self, from: data)
    }.value
  }

  func loadContents(for plan: PlanItem) async throws -> String {
    let executable = executable
    return try await Task.detached(priority: .utility) {
      try requireExecutable(executable)
      let data = try run(
        executable,
        arguments: ["plans", "show", plan.relativePath, "--project", plan.project]
      )
      guard let contents = String(data: data, encoding: .utf8) else {
        throw PlanMenuError.message("The plan is not valid UTF-8 text.")
      }
      return contents
    }.value
  }

  func save(_ contents: String, for plan: PlanItem) async throws {
    let executable = executable
    try await Task.detached(priority: .userInitiated) {
      try requireExecutable(executable)
      _ = try run(
        executable,
        arguments: ["plans", "save", plan.relativePath, "--project", plan.project],
        input: Data(contents.utf8)
      )
    }.value
  }

  func archive(_ plan: PlanItem) async throws {
    let executable = executable
    try await Task.detached(priority: .userInitiated) {
      try requireExecutable(executable)
      _ = try run(
        executable,
        arguments: ["plans", "archive", plan.relativePath, "--project", plan.project]
      )
    }.value
  }

  func setStatus(_ status: PlanStatus, for plan: PlanItem) async throws {
    let executable = executable
    try await Task.detached(priority: .userInitiated) {
      try requireExecutable(executable)
      _ = try run(
        executable,
        arguments: [
          "plans", "status", plan.relativePath, "--project", plan.project, "--status",
          status.rawValue,
        ]
      )
    }.value
  }

  func archiveDone() async throws {
    let executable = executable
    try await Task.detached(priority: .userInitiated) {
      try requireExecutable(executable)
      _ = try run(executable, arguments: ["plans", "archive-done", "--all"])
    }.value
  }
}

private func requireExecutable(_ executable: URL) throws {
  guard FileManager.default.isExecutableFile(atPath: executable.path) else {
    throw PlanMenuError.message("The lanes command is missing. Run mise run install.")
  }
}

private func run(_ executable: URL, arguments: [String], input: Data? = nil) throws -> Data {
  let process = Process()
  let output = Pipe()
  let errors = Pipe()
  let standardInput = input.map { _ in Pipe() }
  process.executableURL = executable
  process.arguments = arguments
  process.standardOutput = output
  process.standardError = errors
  process.standardInput = standardInput
  try process.run()
  if let input, let standardInput {
    standardInput.fileHandleForWriting.write(input)
    try? standardInput.fileHandleForWriting.close()
  }
  process.waitUntilExit()
  let data = output.fileHandleForReading.readDataToEndOfFile()
  if process.terminationStatus != 0 {
    let errorData = errors.fileHandleForReading.readDataToEndOfFile()
    let message = String(data: errorData, encoding: .utf8)?
      .trimmingCharacters(in: .whitespacesAndNewlines)
    throw PlanMenuError.message(
      message?.isEmpty == false
        ? message! : "lanes exited with status \(process.terminationStatus)."
    )
  }
  return data
}
