import Darwin
import Foundation

actor LaneDevCommandManager {
  private let fileManager: FileManager
  private let stateDirectory: URL
  private let bunExecutable: URL?

  init(
    homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser,
    fileManager: FileManager = .default,
    stateDirectory: URL? = nil,
    bunExecutable: URL? = nil
  ) {
    self.fileManager = fileManager
    self.stateDirectory =
      stateDirectory
      ?? homeDirectory.appending(
        path: "Library/Application Support/Lanes/dev-commands", directoryHint: .isDirectory)
    self.bunExecutable =
      bunExecutable ?? Self.findBun(homeDirectory: homeDirectory, fileManager: fileManager)
  }

  func loadCommands(for lanes: [LaneItem]) -> [String: [LaneDevCommand]] {
    Dictionary(
      uniqueKeysWithValues: lanes.map { lane in
        (lane.serviceKey, discoverCommands(for: lane))
      }
    )
  }

  func start(_ command: LaneDevCommand) async throws {
    guard command.supportsDev, let directory = command.directory else {
      throw LaneDevCommandError.message("\(command.kind.title) has no bun dev script.")
    }
    guard let bunExecutable else {
      throw LaneDevCommandError.message("Bun is not installed in a supported host location.")
    }
    if !runningDevProcesses(in: directory).isEmpty || hasRunningRecord(for: command) { return }

    try fileManager.createDirectory(at: stateDirectory, withIntermediateDirectories: true)
    let logURL = logURL(for: command)
    if !fileManager.fileExists(atPath: logURL.path) {
      fileManager.createFile(atPath: logURL.path, contents: nil)
    }
    let log = try FileHandle(forWritingTo: logURL)
    try log.seekToEnd()

    let process = Process()
    process.executableURL = bunExecutable
    process.arguments = ["dev"]
    process.currentDirectoryURL = directory
    process.environment = commandEnvironment()
    process.standardOutput = log
    process.standardError = log

    do {
      try process.run()
    } catch {
      try? log.close()
      throw error
    }
    try writeRecord(
      DevProcessRecord(pid: process.processIdentifier, directory: directory.path),
      for: command
    )
    try? log.close()

    try? await Task.sleep(for: .milliseconds(500))
    guard process.isRunning else {
      removeRecord(for: command)
      throw LaneDevCommandError.message(
        "\(command.kind.title) bun dev exited immediately. See \(logURL.path)."
      )
    }
  }

  func stop(_ command: LaneDevCommand) async throws {
    guard let directory = command.directory else { return }
    let processes = runningDevProcesses(in: directory)
    let processIDs = Set(processes.map(\.pid))
    var roots = processes.filter { !processIDs.contains($0.parentPID) }
    if let record = readRecord(for: command), hasRunningRecord(for: command),
      !processIDs.contains(record.pid)
    {
      roots.append(DevProcess(pid: record.pid, parentPID: 0))
    }

    for process in roots {
      terminateProcessTree(rootPID: process.pid, signal: SIGTERM)
    }
    try? await Task.sleep(for: .milliseconds(600))
    for process in roots where kill(process.pid, 0) == 0 {
      terminateProcessTree(rootPID: process.pid, signal: SIGKILL)
    }
    removeRecord(for: command)
  }

  private func discoverCommands(for lane: LaneItem) -> [LaneDevCommand] {
    let laneURL = URL(fileURLWithPath: lane.path, isDirectory: true)
    let manifests = packageDirectories(in: laneURL).compactMap(readPackage)

    return LaneDevCommandKind.allCases.map { kind in
      guard let package = manifests.first(where: { $0.kind == kind }) else {
        return LaneDevCommand(
          id: "\(lane.serviceKey)/\(kind.rawValue)",
          laneKey: lane.serviceKey,
          kind: kind,
          directory: nil,
          supportsDev: false,
          state: .unavailable
        )
      }

      let command = LaneDevCommand(
        id: "\(lane.serviceKey)/\(kind.rawValue)",
        laneKey: lane.serviceKey,
        kind: kind,
        directory: package.directory,
        supportsDev: package.hasDevScript,
        state: package.hasDevScript ? .stopped : .unavailable
      )
      guard package.hasDevScript else { return command }
      if !runningDevProcesses(in: package.directory).isEmpty || hasRunningRecord(for: command) {
        return command.withState(.running)
      }
      removeRecord(for: command)
      return command
    }
  }

  private func packageDirectories(in laneURL: URL) -> [URL] {
    let rootManifest = laneURL.appending(path: "package.json")
    var manifests = fileManager.fileExists(atPath: rootManifest.path) ? [rootManifest] : []
    let children =
      (try? fileManager.contentsOfDirectory(
        at: laneURL,
        includingPropertiesForKeys: [.isDirectoryKey],
        options: [.skipsHiddenFiles]
      )) ?? []
    manifests += children.compactMap { child in
      guard (try? child.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) == true else {
        return nil
      }
      let manifest = child.appending(path: "package.json")
      return fileManager.fileExists(atPath: manifest.path) ? manifest : nil
    }
    return manifests.sorted { $0.path < $1.path }
  }

  private func readPackage(at manifestURL: URL) -> DiscoveredPackage? {
    guard
      let data = try? Data(contentsOf: manifestURL),
      let manifest = try? JSONDecoder().decode(PackageManifest.self, from: data),
      let kind = manifest.kind
    else { return nil }
    return DiscoveredPackage(
      directory: manifestURL.deletingLastPathComponent(),
      kind: kind,
      hasDevScript: manifest.scripts?["dev"] != nil
    )
  }

  private func commandEnvironment() -> [String: String] {
    var environment = ProcessInfo.processInfo.environment
    let home = FileManager.default.homeDirectoryForCurrentUser.path
    environment["PATH"] = [
      "\(home)/.bun/bin", "\(home)/.local/bin", "/opt/homebrew/bin", "/usr/local/bin",
      "/usr/bin", "/bin", "/usr/sbin", "/sbin",
    ].joined(separator: ":")
    return environment
  }

  private func writeRecord(_ record: DevProcessRecord, for command: LaneDevCommand) throws {
    try JSONEncoder().encode(record).write(to: recordURL(for: command), options: .atomic)
  }

  private func readRecord(for command: LaneDevCommand) -> DevProcessRecord? {
    guard let data = try? Data(contentsOf: recordURL(for: command)) else { return nil }
    return try? JSONDecoder().decode(DevProcessRecord.self, from: data)
  }

  private func hasRunningRecord(for command: LaneDevCommand) -> Bool {
    guard
      let record = readRecord(for: command),
      kill(record.pid, 0) == 0,
      let currentDirectory = processCurrentDirectory(pid: record.pid),
      canonicalPath(currentDirectory) == canonicalPath(record.directory)
    else { return false }
    return true
  }

  private func canonicalPath(_ path: String) -> String {
    URL(fileURLWithPath: path).resolvingSymlinksInPath().standardizedFileURL.path
  }

  private func removeRecord(for command: LaneDevCommand) {
    try? fileManager.removeItem(at: recordURL(for: command))
  }

  private func recordURL(for command: LaneDevCommand) -> URL {
    stateDirectory.appending(path: "\(safeName(command.id)).json")
  }

  private func logURL(for command: LaneDevCommand) -> URL {
    stateDirectory.appending(path: "\(safeName(command.id)).log")
  }

  private func safeName(_ value: String) -> String {
    value.replacingOccurrences(of: "/", with: "-")
  }

  private func runningDevProcesses(in directory: URL) -> [DevProcess] {
    processOutput(executable: "/bin/ps", arguments: ["-axo", "pid=,ppid=,command="])
      .split(separator: "\n")
      .compactMap { line -> DevProcess? in
        let fields = line.split(maxSplits: 2, whereSeparator: \Character.isWhitespace)
        guard
          fields.count == 3,
          let pid = Int32(fields[0]),
          let parentPID = Int32(fields[1])
        else { return nil }
        let command = String(fields[2]).lowercased()
        guard command.contains("bun dev") || command.contains("bun run dev") else { return nil }
        guard processCurrentDirectory(pid: pid) == directory.standardizedFileURL.path else {
          return nil
        }
        return DevProcess(pid: pid, parentPID: parentPID)
      }
  }

  private func processCurrentDirectory(pid: Int32) -> String? {
    processOutput(
      executable: "/usr/sbin/lsof",
      arguments: ["-a", "-p", String(pid), "-d", "cwd", "-Fn"]
    )
    .split(separator: "\n")
    .first { $0.hasPrefix("n") }
    .map { String($0.dropFirst()) }
  }

  private func terminateProcessTree(rootPID: Int32, signal: Int32) {
    for child in childPIDs(of: rootPID) {
      terminateProcessTree(rootPID: child, signal: signal)
    }
    Darwin.kill(rootPID, signal)
  }

  private func childPIDs(of pid: Int32) -> [Int32] {
    processOutput(executable: "/bin/ps", arguments: ["-P", String(pid), "-o", "pid="])
      .split(whereSeparator: \Character.isWhitespace)
      .compactMap { Int32($0) }
  }

  private func processOutput(executable: String, arguments: [String]) -> String {
    let process = Process()
    let output = Pipe()
    process.executableURL = URL(fileURLWithPath: executable)
    process.arguments = arguments
    process.standardOutput = output
    process.standardError = FileHandle.nullDevice
    guard (try? process.run()) != nil else { return "" }
    let data = output.fileHandleForReading.readDataToEndOfFile()
    process.waitUntilExit()
    return String(decoding: data, as: UTF8.self)
  }

  private static func findBun(homeDirectory: URL, fileManager: FileManager) -> URL? {
    let candidates = [
      homeDirectory.appending(path: ".bun/bin/bun"),
      URL(fileURLWithPath: "/opt/homebrew/bin/bun"),
      URL(fileURLWithPath: "/usr/local/bin/bun"),
    ]
    return candidates.first { fileManager.isExecutableFile(atPath: $0.path) }
  }
}

private struct PackageManifest: Decodable {
  let scripts: [String: String]?
  let dependencies: [String: String]?
  let devDependencies: [String: String]?

  var kind: LaneDevCommandKind? {
    let dev = scripts?["dev"]?.lowercased() ?? ""
    let start = scripts?["start"]?.lowercased() ?? ""
    let usesExpo = dependencies?["expo"] != nil || devDependencies?["expo"] != nil
    let usesVite = dependencies?["vite"] != nil || devDependencies?["vite"] != nil
    if usesExpo || dev.contains("expo") || start.contains("expo") || dev.contains("metro") {
      return .metro
    }
    if usesVite || dev.contains("vite") { return .frontend }
    return nil
  }
}

private struct DiscoveredPackage {
  let directory: URL
  let kind: LaneDevCommandKind
  let hasDevScript: Bool
}

private struct DevProcessRecord: Codable {
  let pid: Int32
  let directory: String
}

private struct DevProcess {
  let pid: Int32
  let parentPID: Int32
}

private enum LaneDevCommandError: LocalizedError {
  case message(String)

  var errorDescription: String? {
    switch self {
    case .message(let message): message
    }
  }
}
