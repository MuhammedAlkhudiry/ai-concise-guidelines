import Foundation
import SwiftUI

struct PlansDocument: Codable, Sendable {
  let contractVersion: Int
  let plansRoot: String
  let projects: [PlanProject]
}

struct PlanProject: Codable, Identifiable, Sendable {
  let id: String
  let plans: [PlanItem]

  var displayName: String {
    id
      .split(separator: "-")
      .map { $0.prefix(1).uppercased() + $0.dropFirst() }
      .joined(separator: " ")
  }
}

struct PlanItem: Codable, Identifiable, Hashable, Sendable {
  let name: String
  let path: String
  let project: String
  let relativePath: String
  let updated: String
  let title: String
  let description: String
  let status: PlanStatus

  var id: String { path }
}

enum PlanStatus: String, Codable, CaseIterable, Identifiable, Hashable, Sendable {
  case pending
  case progress
  case done

  var id: String { rawValue }
  var title: String { rawValue.capitalized }

  var systemImage: String {
    switch self {
    case .pending: "circle.fill"
    case .progress: "arrow.trianglehead.2.clockwise.rotate.90.circle.fill"
    case .done: "checkmark.circle.fill"
    }
  }

  var color: Color {
    switch self {
    case .pending: .orange
    case .progress: .blue
    case .done: .green
    }
  }
}

enum PlanMenuError: LocalizedError {
  case message(String)

  var errorDescription: String? {
    switch self {
    case .message(let message): message
    }
  }
}
