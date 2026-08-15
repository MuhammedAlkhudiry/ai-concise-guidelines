import Foundation
import Testing

@testable import PlansMenu

@Test func decodesTheAllProjectsPlanContract() throws {
  let data = Data(
    #"{"contractVersion":2,"plansRoot":"/Users/example/plans","projects":[{"id":"example-project","plans":[{"name":"billing.md","path":"/Users/example/plans/example-project/billing.md","project":"example-project","relativePath":"billing.md","updated":"2026-08-12","title":"Billing Plan","description":"Review the billing workflow","status":"progress"}]}]}"#.utf8
  )

  let document = try JSONDecoder().decode(PlansDocument.self, from: data)

  #expect(document.contractVersion == 2)
  #expect(document.plansRoot == "/Users/example/plans")
  #expect(document.projects[0].displayName == "Example Project")
  #expect(document.projects[0].plans[0].title == "Billing Plan")
  #expect(document.projects[0].plans[0].status == .progress)
  #expect(document.projects[0].plans[0].id.hasSuffix("billing.md"))
}

@Test func tokenizesLiveMarkdownWithoutChangingItsSourceRanges() throws {
  let markdown = """
    ---
    project: example-project
    ---

    # Live **Plan**

    - [x] Preserve `raw Markdown`
    """
  let source = markdown as NSString
  let tokens = LiveMarkdownTokenizer.tokens(in: markdown)

  let heading = try #require(tokens.first { $0.kind == .heading(1) })
  let strong = try #require(tokens.first { $0.kind == .strong })
  let inlineCode = try #require(tokens.first { $0.kind == .inlineCode })
  let completedTask = try #require(tokens.first { $0.kind == .task(true) })

  #expect(source.substring(with: heading.range) == "Live **Plan**")
  #expect(source.substring(with: strong.range) == "Plan")
  #expect(source.substring(with: inlineCode.range) == "`raw Markdown`")
  #expect(source.substring(with: completedTask.range) == "[x]")
  #expect(tokens.contains { $0.kind == .metadata })
  #expect(tokens.contains { $0.kind == .syntax(hiddenWhenInactive: true) })
}

@Test func leavesMarkdownInsideCodeBlocksUnformatted() {
  let markdown = """
    ```md
    # Not a heading
    **Not bold**
    ```
    """
  let tokens = LiveMarkdownTokenizer.tokens(in: markdown)

  #expect(tokens.contains { $0.kind == .codeBlock })
  #expect(!tokens.contains { $0.kind == .heading(1) })
  #expect(!tokens.contains { $0.kind == .strong })
}
