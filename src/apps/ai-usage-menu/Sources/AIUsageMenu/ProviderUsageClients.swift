import CommonCrypto
import CryptoKit
import Foundation
import Security
import SQLite3

struct ClaudeUsageClient: Sendable {
  private static let clientID = "9d1c250a-e61b-44d9-88ed-5944d1962f5e"
  private static let refreshURL = URL(string: "https://platform.claude.com/v1/oauth/token")!
  private let now: @Sendable () -> Date

  init(now: @escaping @Sendable () -> Date = Date.init) {
    self.now = now
  }

  func load() async -> ProviderUsage {
    do {
      let token = try await accessToken()
      var request = URLRequest(url: URL(string: "https://api.anthropic.com/api/oauth/usage")!)
      request.timeoutInterval = 10
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
      request.setValue("oauth-2025-04-20", forHTTPHeaderField: "anthropic-beta")
      request.setValue("application/json", forHTTPHeaderField: "Accept")
      let (data, response) = try await URLSession.shared.data(for: request)
      guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
        return .unavailable(.claude, "Open Claude Code to refresh its sign-in.")
      }
      let windows = try Self.parseUsage(data)
      guard !windows.isEmpty else {
        return .unavailable(.claude, "Claude did not return allowance windows.")
      }
      return allowanceUsage(provider: .claude, windows: windows, observedAt: now())
    } catch {
      return .unavailable(.claude, "Could not read Claude allowance.")
    }
  }

  private func accessToken() async throws -> String {
    let store = ClaudeCredentialStore()
    let storedCredential = try store.read()
    let credentialData = storedCredential.data
    let credential = try JSONDecoder().decode(ClaudeCredentialEnvelope.self, from: credentialData)
      .claudeAiOauth
    guard !credential.accessToken.isEmpty else { throw UsageClientError.credentials }
    guard credential.expiresAt <= now().timeIntervalSince1970 * 1_000 + 60_000 else {
      return credential.accessToken
    }
    guard let refreshToken = credential.refreshToken, !refreshToken.isEmpty else {
      throw UsageClientError.credentials
    }

    var request = URLRequest(url: Self.refreshURL)
    request.httpMethod = "POST"
    request.timeoutInterval = 30
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try JSONEncoder().encode(
      ClaudeRefreshRequest(
        grantType: "refresh_token",
        refreshToken: refreshToken,
        clientID: Self.clientID,
        scope: credential.scopes.joined(separator: " ")
      )
    )
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
      throw UsageClientError.credentials
    }
    let refreshed = try JSONDecoder().decode(ClaudeRefreshResponse.self, from: data)
    guard !refreshed.accessToken.isEmpty, refreshed.expiresIn > 0 else {
      throw UsageClientError.response
    }

    guard var object = try JSONSerialization.jsonObject(with: credentialData) as? [String: Any],
      var oauth = object["claudeAiOauth"] as? [String: Any]
    else { throw UsageClientError.credentials }
    oauth["accessToken"] = refreshed.accessToken
    oauth["refreshToken"] = refreshed.refreshToken ?? refreshToken
    oauth["expiresAt"] = now().timeIntervalSince1970 * 1_000 + refreshed.expiresIn * 1_000
    if let refreshTokenExpiresIn = refreshed.refreshTokenExpiresIn {
      oauth["refreshTokenExpiresAt"] =
        now().timeIntervalSince1970 * 1_000 + refreshTokenExpiresIn * 1_000
    }
    if let scopes = refreshed.scope?.split(separator: " ").map(String.init), !scopes.isEmpty {
      oauth["scopes"] = scopes
    }
    object["claudeAiOauth"] = oauth
    try store.update(
      try JSONSerialization.data(withJSONObject: object),
      account: storedCredential.account
    )
    return refreshed.accessToken
  }

  static func parseUsage(_ data: Data) throws -> [UsageWindow] {
    guard let object = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
      throw UsageClientError.response
    }
    return [
      parseWindow(object["five_hour"], id: "five-hour", title: "5-hour"),
      parseWindow(object["seven_day"], id: "weekly", title: "Weekly"),
    ].compactMap { $0 }
  }

  private static func parseWindow(_ value: Any?, id: String, title: String) -> UsageWindow? {
    guard let object = value as? [String: Any],
      let usedPercent = numeric(object["utilization"])
    else { return nil }
    return UsageWindow(
      id: id,
      title: title,
      usedPercent: usedPercent,
      resetsAt: date(object["resets_at"])
    )
  }
}

private struct ClaudeCredentialStore: Sendable {
  private let service = "Claude Code-credentials"

  func read() throws -> (data: Data, account: String) {
    var query = baseQuery
    query[kSecReturnAttributes as String] = true
    query[kSecReturnData as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne
    var result: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
      let item = result as? [String: Any],
      let data = item[kSecValueData as String] as? Data,
      let account = item[kSecAttrAccount as String] as? String
    else { throw UsageClientError.credentials }
    return (data, account)
  }

  func update(_ data: Data, account: String) throws {
    var query = baseQuery
    query[kSecAttrAccount as String] = account
    let status = SecItemUpdate(
      query as CFDictionary,
      [kSecValueData as String: data] as CFDictionary
    )
    guard status == errSecSuccess else { throw UsageClientError.credentials }
  }

  private var baseQuery: [String: Any] {
    [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
    ]
  }

}

private struct ClaudeCredentialEnvelope: Decodable {
  let claudeAiOauth: ClaudeStoredOAuth
}

private struct ClaudeStoredOAuth: Decodable {
  let accessToken: String
  let refreshToken: String?
  let expiresAt: Double
  let scopes: [String]
}

private struct ClaudeRefreshRequest: Encodable {
  let grantType: String
  let refreshToken: String
  let clientID: String
  let scope: String

  enum CodingKeys: String, CodingKey {
    case grantType = "grant_type"
    case refreshToken = "refresh_token"
    case clientID = "client_id"
    case scope
  }
}

private struct ClaudeRefreshResponse: Decodable {
  let accessToken: String
  let refreshToken: String?
  let expiresIn: Double
  let refreshTokenExpiresIn: Double?
  let scope: String?

  enum CodingKeys: String, CodingKey {
    case accessToken = "access_token"
    case refreshToken = "refresh_token"
    case expiresIn = "expires_in"
    case refreshTokenExpiresIn = "refresh_token_expires_in"
    case scope
  }
}

struct OpenCodeUsageClient: Sendable {
  private let now: @Sendable () -> Date

  init(now: @escaping @Sendable () -> Date = Date.init) {
    self.now = now
  }

  func load() async -> ProviderUsage {
    do {
      let cookieHeader = try ChromeCookieStore().openCodeCookieHeader()
      let workspaceID = try await workspaceID(cookieHeader: cookieHeader)
      let url = URL(string: "https://opencode.ai/workspace/\(workspaceID)/go")!
      var request = URLRequest(url: url)
      request.timeoutInterval = 15
      request.setValue("text/html,application/xhtml+xml", forHTTPHeaderField: "Accept")
      request.setValue(cookieHeader, forHTTPHeaderField: "Cookie")
      let (data, response) = try await URLSession.shared.data(for: request)
      guard let http = response as? HTTPURLResponse,
        http.statusCode == 200,
        http.url?.host == "opencode.ai",
        http.url?.path.contains("/workspace/") == true
      else {
        return .unavailable(.opencodeGo, "Sign in to OpenCode in Chrome.")
      }
      let windows = try Self.parseUsageHTML(String(decoding: data, as: UTF8.self), now: now())
      guard windows.count == 3 else {
        return .unavailable(.opencodeGo, "OpenCode allowance data was incomplete.")
      }
      return allowanceUsage(provider: .opencodeGo, windows: windows, observedAt: now())
    } catch {
      return .unavailable(.opencodeGo, "Sign in to OpenCode in Chrome.")
    }
  }

  private func workspaceID(cookieHeader: String) async throws -> String {
    var request = URLRequest(url: URL(string: "https://opencode.ai/auth")!)
    request.timeoutInterval = 15
    request.setValue(cookieHeader, forHTTPHeaderField: "Cookie")
    let (_, response) = try await URLSession.shared.data(for: request)
    guard let url = (response as? HTTPURLResponse)?.url,
      url.host == "opencode.ai"
    else { throw UsageClientError.credentials }
    let components = url.pathComponents
    guard let index = components.firstIndex(of: "workspace"),
      components.indices.contains(index + 1)
    else { throw UsageClientError.credentials }
    let workspaceID = components[index + 1]
    guard workspaceID.range(of: #"^(wrk|wk)_[A-Za-z0-9]+$"#, options: .regularExpression) != nil
    else { throw UsageClientError.credentials }
    return workspaceID
  }

  nonisolated static func parseUsageHTML(_ html: String, now: Date) throws -> [UsageWindow] {
    let definitions = [
      (field: "rollingUsage", id: "rolling", title: "Rolling"),
      (field: "weeklyUsage", id: "weekly", title: "Weekly"),
      (field: "monthlyUsage", id: "monthly", title: "Monthly"),
    ]
    return definitions.compactMap { definition in
      let escaped = NSRegularExpression.escapedPattern(for: definition.field)
      let pattern = #"\#(escaped):(?:\$R\[\d+\]=)?\{[^{}]*resetInSec:(\d+),usagePercent:(\d+(?:\.\d+)?)\}"#
      guard let regex = try? NSRegularExpression(pattern: pattern),
        let match = regex.firstMatch(in: html, range: NSRange(html.startIndex..., in: html)),
        let resetRange = Range(match.range(at: 1), in: html),
        let percentRange = Range(match.range(at: 2), in: html),
        let resetSeconds = Double(html[resetRange]),
        let usedPercent = Double(html[percentRange])
      else { return nil }
      return UsageWindow(
        id: definition.id,
        title: definition.title,
        usedPercent: usedPercent,
        resetsAt: now.addingTimeInterval(resetSeconds)
      )
    }
  }
}

private struct ChromeCookieStore: Sendable {
  private let homeDirectory: URL

  init(homeDirectory: URL = FileManager.default.homeDirectoryForCurrentUser) {
    self.homeDirectory = homeDirectory
  }

  func openCodeCookieHeader() throws -> String {
    let candidates = try cookieDatabases().compactMap(cookieCandidate(in:))
    guard let cookie = candidates.max(by: { $0.lastAccess < $1.lastAccess }) else {
      throw UsageClientError.credentials
    }
    let value = try cookie.value.isEmpty
      ? decrypt(cookie.encryptedValue, host: cookie.host)
      : cookie.value
    guard !value.isEmpty else { throw UsageClientError.credentials }
    return "\(cookie.name)=\(value)"
  }

  private func cookieDatabases() throws -> [URL] {
    let root = homeDirectory.appending(path: "Library/Application Support/Google/Chrome")
    let profiles = try FileManager.default.contentsOfDirectory(
      at: root,
      includingPropertiesForKeys: [.isDirectoryKey],
      options: [.skipsHiddenFiles]
    ).filter { url in
      let name = url.lastPathComponent
      return name == "Default" || name.hasPrefix("Profile ")
    }
    return profiles.flatMap { profile in
      [profile.appending(path: "Cookies"), profile.appending(path: "Network/Cookies")]
    }.filter { FileManager.default.fileExists(atPath: $0.path) }
  }

  private func cookieCandidate(in databaseURL: URL) throws -> ChromeCookie? {
    var database: OpaquePointer?
    guard sqlite3_open_v2(
      databaseURL.path,
      &database,
      SQLITE_OPEN_READONLY | SQLITE_OPEN_FULLMUTEX,
      nil
    ) == SQLITE_OK else { return nil }
    defer { sqlite3_close(database) }

    let sql = """
      SELECT host_key, name, value, encrypted_value, last_access_utc
      FROM cookies
      WHERE host_key IN ('opencode.ai', '.opencode.ai')
        AND name IN ('auth', '__Host-auth')
      ORDER BY last_access_utc DESC
      LIMIT 1
      """
    var statement: OpaquePointer?
    guard sqlite3_prepare_v2(database, sql, -1, &statement, nil) == SQLITE_OK else { return nil }
    defer { sqlite3_finalize(statement) }
    guard sqlite3_step(statement) == SQLITE_ROW,
      let hostPointer = sqlite3_column_text(statement, 0),
      let namePointer = sqlite3_column_text(statement, 1)
    else { return nil }
    let encryptedCount = Int(sqlite3_column_bytes(statement, 3))
    let encrypted = sqlite3_column_blob(statement, 3).map {
      Data(bytes: $0, count: encryptedCount)
    } ?? Data()
    return ChromeCookie(
      host: String(cString: hostPointer),
      name: String(cString: namePointer),
      value: sqlite3_column_text(statement, 2).map(String.init(cString:)) ?? "",
      encryptedValue: encrypted,
      lastAccess: sqlite3_column_int64(statement, 4)
    )
  }

  private func decrypt(_ encrypted: Data, host: String) throws -> String {
    guard encrypted.count > 3,
      encrypted.prefix(3) == Data("v10".utf8) || encrypted.prefix(3) == Data("v11".utf8)
    else { throw UsageClientError.credentials }
    let password = try chromeSafeStoragePassword()
    let key = try deriveChromeKey(password: password)
    let ciphertext = encrypted.dropFirst(3)
    let iv = [UInt8](repeating: 0x20, count: kCCBlockSizeAES128)
    var plaintext = [UInt8](repeating: 0, count: ciphertext.count + kCCBlockSizeAES128)
    let plaintextCapacity = plaintext.count
    var plaintextCount = 0
    let status = key.withUnsafeBytes { keyBytes in
      iv.withUnsafeBytes { ivBytes in
        ciphertext.withUnsafeBytes { cipherBytes in
          plaintext.withUnsafeMutableBytes { outputBytes in
            CCCrypt(
              CCOperation(kCCDecrypt),
              CCAlgorithm(kCCAlgorithmAES),
              CCOptions(kCCOptionPKCS7Padding),
              keyBytes.baseAddress,
              key.count,
              ivBytes.baseAddress,
              cipherBytes.baseAddress,
              ciphertext.count,
              outputBytes.baseAddress,
              plaintextCapacity,
              &plaintextCount
            )
          }
        }
      }
    }
    guard status == kCCSuccess else { throw UsageClientError.credentials }
    var data = Data(plaintext.prefix(plaintextCount))
    let hostDigest = Data(SHA256.hash(data: Data(host.utf8)))
    if data.count > hostDigest.count, data.prefix(hostDigest.count) == hostDigest {
      data.removeFirst(hostDigest.count)
    }
    guard let value = String(data: data, encoding: .utf8) else {
      throw UsageClientError.credentials
    }
    return value
  }

  private func chromeSafeStoragePassword() throws -> String {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: "Chrome Safe Storage",
      kSecAttrAccount as String: "Chrome",
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    var result: CFTypeRef?
    guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
      let data = result as? Data,
      let password = String(data: data, encoding: .utf8)
    else { throw UsageClientError.credentials }
    return password
  }

  private func deriveChromeKey(password: String) throws -> [UInt8] {
    let salt = [UInt8]("saltysalt".utf8)
    var key = [UInt8](repeating: 0, count: kCCKeySizeAES128)
    let keyLength = key.count
    let status = password.withCString { passwordPointer in
      salt.withUnsafeBytes { saltBytes in
        key.withUnsafeMutableBytes { keyBytes in
          CCKeyDerivationPBKDF(
            CCPBKDFAlgorithm(kCCPBKDF2),
            passwordPointer,
            password.lengthOfBytes(using: .utf8),
            saltBytes.bindMemory(to: UInt8.self).baseAddress,
            salt.count,
            CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA1),
            1_003,
            keyBytes.bindMemory(to: UInt8.self).baseAddress,
            keyLength
          )
        }
      }
    }
    guard status == kCCSuccess else { throw UsageClientError.credentials }
    return key
  }
}

private struct ChromeCookie {
  let host: String
  let name: String
  let value: String
  let encryptedValue: Data
  let lastAccess: Int64
}

private func allowanceUsage(
  provider: UsageProvider,
  windows: [UsageWindow],
  observedAt: Date
) -> ProviderUsage {
  let lowest = windows.map(\.remainingPercent).min() ?? 0
  let reset = windows.compactMap(\.resetsAt).min()
  return ProviderUsage(
    provider: provider,
    availability: .allowance,
    primaryValue: "\(UsageFormatting.percent(lowest)) remaining",
    summary: reset.map { UsageFormatting.reset($0) } ?? "Current subscription windows",
    details: [],
    windows: windows,
    observedAt: observedAt,
    error: nil
  )
}

private func numeric(_ value: Any?) -> Double? {
  if let value = value as? NSNumber { return value.doubleValue }
  if let value = value as? String { return Double(value) }
  return nil
}

private func date(_ value: Any?) -> Date? {
  guard let value = value as? String else { return nil }
  let fractional = ISO8601DateFormatter()
  fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return fractional.date(from: value) ?? ISO8601DateFormatter().date(from: value)
}

private enum UsageClientError: Error {
  case credentials
  case response
}
