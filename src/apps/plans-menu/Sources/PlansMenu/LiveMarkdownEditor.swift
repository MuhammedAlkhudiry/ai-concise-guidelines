import AppKit
import SwiftUI

struct LiveMarkdownEditor: NSViewRepresentable {
  @Binding var text: String

  func makeCoordinator() -> Coordinator {
    Coordinator(parent: self)
  }

  func makeNSView(context: Context) -> NSScrollView {
    let scrollView = NSScrollView()
    scrollView.hasVerticalScroller = true
    scrollView.autohidesScrollers = true
    scrollView.drawsBackground = false
    scrollView.borderType = .noBorder

    let textView = NSTextView()
    textView.delegate = context.coordinator
    textView.string = text
    textView.isRichText = false
    textView.importsGraphics = false
    textView.allowsUndo = true
    textView.drawsBackground = false
    textView.isAutomaticQuoteSubstitutionEnabled = false
    textView.isAutomaticDashSubstitutionEnabled = false
    textView.isAutomaticTextReplacementEnabled = false
    textView.isContinuousSpellCheckingEnabled = false
    textView.usesFindBar = true
    textView.textContainerInset = NSSize(width: 28, height: 22)
    textView.minSize = NSSize(width: 0, height: 0)
    textView.maxSize = NSSize(
      width: CGFloat.greatestFiniteMagnitude,
      height: CGFloat.greatestFiniteMagnitude
    )
    textView.isVerticallyResizable = true
    textView.isHorizontallyResizable = false
    textView.autoresizingMask = [.width]
    textView.textContainer?.containerSize = NSSize(
      width: scrollView.contentSize.width,
      height: CGFloat.greatestFiniteMagnitude
    )
    textView.textContainer?.widthTracksTextView = true
    textView.setAccessibilityLabel("Live Markdown editor")
    scrollView.documentView = textView
    context.coordinator.applyFormatting(to: textView)
    return scrollView
  }

  func updateNSView(_ scrollView: NSScrollView, context: Context) {
    context.coordinator.parent = self
    guard let textView = scrollView.documentView as? NSTextView else { return }

    if textView.string != text {
      let selection = textView.selectedRange()
      textView.string = text
      textView.setSelectedRange(
        NSRange(location: min(selection.location, (text as NSString).length), length: 0)
      )
    }
    context.coordinator.applyFormatting(to: textView)
  }

  @MainActor
  final class Coordinator: NSObject, NSTextViewDelegate {
    var parent: LiveMarkdownEditor
    private var isApplyingFormatting = false

    init(parent: LiveMarkdownEditor) {
      self.parent = parent
    }

    func textDidChange(_ notification: Notification) {
      guard !isApplyingFormatting, let textView = notification.object as? NSTextView else { return }
      parent.text = textView.string
      applyFormatting(to: textView)
    }

    func textDidBeginEditing(_ notification: Notification) {
      guard let textView = notification.object as? NSTextView else { return }
      applyFormatting(to: textView)
    }

    func textDidEndEditing(_ notification: Notification) {
      guard let textView = notification.object as? NSTextView else { return }
      applyFormatting(to: textView)
    }

    func textViewDidChangeSelection(_ notification: Notification) {
      guard let textView = notification.object as? NSTextView else { return }
      applyFormatting(to: textView)
    }

    func applyFormatting(to textView: NSTextView) {
      guard !isApplyingFormatting, let storage = textView.textStorage else { return }
      isApplyingFormatting = true
      defer { isApplyingFormatting = false }

      let source = textView.string
      let sourceLength = (source as NSString).length
      let wholeRange = NSRange(location: 0, length: sourceLength)
      let bodyFont = NSFont.systemFont(ofSize: 15)
      let baseParagraph = NSMutableParagraphStyle()
      baseParagraph.lineSpacing = 3
      baseParagraph.paragraphSpacing = 5
      let baseAttributes: [NSAttributedString.Key: Any] = [
        .font: bodyFont,
        .foregroundColor: NSColor.textColor,
        .paragraphStyle: baseParagraph,
      ]

      storage.beginEditing()
      storage.setAttributes(baseAttributes, range: wholeRange)

      let activeLine = activeLineRange(in: textView, source: source)
      for token in LiveMarkdownTokenizer.tokens(in: source) {
        guard token.range.location != NSNotFound, NSMaxRange(token.range) <= sourceLength else {
          continue
        }
        apply(token, to: storage, activeLine: activeLine, bodyFont: bodyFont)
      }

      storage.endEditing()
      textView.typingAttributes = baseAttributes
      textView.insertionPointColor = .controlAccentColor
    }

    private func activeLineRange(in textView: NSTextView, source: String) -> NSRange? {
      guard textView.window?.firstResponder === textView, !source.isEmpty else { return nil }
      let sourceText = source as NSString
      let location = min(textView.selectedRange().location, max(0, sourceText.length - 1))
      return sourceText.lineRange(for: NSRange(location: location, length: 0))
    }

    private func apply(
      _ token: LiveMarkdownToken,
      to storage: NSTextStorage,
      activeLine: NSRange?,
      bodyFont: NSFont
    ) {
      switch token.kind {
      case .metadata:
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 1
        paragraph.paragraphSpacing = 1
        storage.addAttributes(
          [
            .font: NSFont.monospacedSystemFont(ofSize: 10.5, weight: .regular),
            .foregroundColor: NSColor.secondaryLabelColor,
            .backgroundColor: NSColor.quaternaryLabelColor.withAlphaComponent(0.08),
            .paragraphStyle: paragraph,
          ],
          range: token.range
        )
      case .heading(let level):
        let size: CGFloat = switch level {
        case 1: 25
        case 2: 20
        case 3: 17
        default: 15
        }
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 2
        paragraph.paragraphSpacingBefore = level == 1 ? 10 : 8
        paragraph.paragraphSpacing = level == 1 ? 10 : 7
        storage.addAttributes(
          [
            .font: NSFont.systemFont(ofSize: size, weight: level <= 2 ? .bold : .semibold),
            .foregroundColor: NSColor.labelColor,
            .paragraphStyle: paragraph,
          ],
          range: token.range
        )
      case .strong:
        let current = storage.attribute(.font, at: token.range.location, effectiveRange: nil)
          as? NSFont ?? bodyFont
        storage.addAttribute(
          .font,
          value: NSFontManager.shared.convert(current, toHaveTrait: .boldFontMask),
          range: token.range
        )
      case .emphasis:
        let current = storage.attribute(.font, at: token.range.location, effectiveRange: nil)
          as? NSFont ?? bodyFont
        storage.addAttribute(
          .font,
          value: NSFontManager.shared.convert(current, toHaveTrait: .italicFontMask),
          range: token.range
        )
      case .strikethrough:
        storage.addAttributes(
          [
            .strikethroughStyle: NSUnderlineStyle.single.rawValue,
            .foregroundColor: NSColor.secondaryLabelColor,
          ],
          range: token.range
        )
      case .inlineCode:
        storage.addAttributes(
          [
            .font: NSFont.monospacedSystemFont(ofSize: 13, weight: .regular),
            .backgroundColor: NSColor.quaternaryLabelColor.withAlphaComponent(0.16),
          ],
          range: token.range
        )
      case .codeBlock:
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 2
        paragraph.paragraphSpacing = 2
        paragraph.headIndent = 10
        paragraph.firstLineHeadIndent = 10
        paragraph.tailIndent = -10
        storage.addAttributes(
          [
            .font: NSFont.monospacedSystemFont(ofSize: 13, weight: .regular),
            .backgroundColor: NSColor.quaternaryLabelColor.withAlphaComponent(0.12),
            .paragraphStyle: paragraph,
          ],
          range: token.range
        )
      case .blockquote:
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 3
        paragraph.paragraphSpacing = 6
        paragraph.headIndent = 18
        paragraph.firstLineHeadIndent = 0
        storage.addAttributes(
          [
            .foregroundColor: NSColor.secondaryLabelColor,
            .paragraphStyle: paragraph,
          ],
          range: token.range
        )
      case .listItem:
        let paragraph = NSMutableParagraphStyle()
        paragraph.lineSpacing = 3
        paragraph.paragraphSpacing = 4
        paragraph.headIndent = 22
        paragraph.firstLineHeadIndent = 0
        storage.addAttribute(.paragraphStyle, value: paragraph, range: token.range)
      case .task(let completed):
        storage.addAttributes(
          [
            .font: NSFont.monospacedSystemFont(ofSize: 13, weight: .semibold),
            .foregroundColor: completed ? NSColor.systemGreen : NSColor.secondaryLabelColor,
          ],
          range: token.range
        )
      case .table:
        storage.addAttributes(
          [
            .font: NSFont.monospacedSystemFont(ofSize: 12, weight: .regular),
            .foregroundColor: NSColor.secondaryLabelColor,
          ],
          range: token.range
        )
      case .divider:
        storage.addAttribute(.foregroundColor, value: NSColor.separatorColor, range: token.range)
      case .link:
        storage.addAttributes(
          [
            .foregroundColor: NSColor.linkColor,
            .underlineStyle: NSUnderlineStyle.single.rawValue,
          ],
          range: token.range
        )
      case .syntax(let hiddenWhenInactive):
        let isActive = activeLine.map { NSIntersectionRange($0, token.range).length > 0 } ?? false
        if hiddenWhenInactive && !isActive {
          storage.addAttributes(
            [
              .font: NSFont.systemFont(ofSize: 0.1),
              .foregroundColor: NSColor.clear,
            ],
            range: token.range
          )
        } else {
          storage.addAttributes(
            [
              .font: NSFont.monospacedSystemFont(ofSize: 11.5, weight: .medium),
              .foregroundColor: NSColor.tertiaryLabelColor,
            ],
            range: token.range
          )
        }
      }
    }
  }
}

enum LiveMarkdownTokenKind: Equatable {
  case metadata
  case heading(Int)
  case strong
  case emphasis
  case strikethrough
  case inlineCode
  case codeBlock
  case blockquote
  case listItem
  case task(Bool)
  case table
  case divider
  case link
  case syntax(hiddenWhenInactive: Bool)
}

struct LiveMarkdownToken: Equatable {
  let kind: LiveMarkdownTokenKind
  let range: NSRange
}

enum LiveMarkdownTokenizer {
  static func tokens(in source: String) -> [LiveMarkdownToken] {
    let text = source as NSString
    let wholeRange = NSRange(location: 0, length: text.length)
    var tokens: [LiveMarkdownToken] = []
    var excludedRanges: [NSRange] = []
    var taskLineRanges: [NSRange] = []

    func isExcluded(_ range: NSRange) -> Bool {
      excludedRanges.contains { NSIntersectionRange($0, range).length > 0 }
    }

    func matches(_ pattern: String) -> [NSTextCheckingResult] {
      guard let expression = try? NSRegularExpression(pattern: pattern) else { return [] }
      return expression.matches(in: source, range: wholeRange)
    }

    if let frontmatter = matches(#"\A---[ \t]*\n[\s\S]*?\n---[ \t]*(?:\n|\z)"#).first {
      tokens.append(LiveMarkdownToken(kind: .metadata, range: frontmatter.range))
      excludedRanges.append(frontmatter.range)
    }

    for match in matches(#"(?m)^```[^\n]*\n[\s\S]*?^```[ \t]*$"#) {
      tokens.append(LiveMarkdownToken(kind: .codeBlock, range: match.range))
      excludedRanges.append(match.range)
      let block = text.substring(with: match.range) as NSString
      let opening = block.lineRange(for: NSRange(location: 0, length: 0))
      let closingLocation = max(0, block.length - 3)
      let closing = block.lineRange(for: NSRange(location: closingLocation, length: 0))
      tokens.append(
        LiveMarkdownToken(
          kind: .syntax(hiddenWhenInactive: true),
          range: NSRange(location: match.range.location, length: min(opening.length, 3))
        )
      )
      tokens.append(
        LiveMarkdownToken(
          kind: .syntax(hiddenWhenInactive: true),
          range: NSRange(location: match.range.location + closing.location, length: min(closing.length, 3))
        )
      )
    }

    for match in matches(#"(?m)^(#{1,6})([ \t]+)(.+)$"#) where !isExcluded(match.range) {
      let marker = NSUnionRange(match.range(at: 1), match.range(at: 2))
      tokens.append(
        LiveMarkdownToken(kind: .heading(match.range(at: 1).length), range: match.range(at: 3))
      )
      tokens.append(
        LiveMarkdownToken(kind: .syntax(hiddenWhenInactive: true), range: marker)
      )
    }

    for match in matches(#"(?m)^([ \t]*>[ \t]?)(.*)$"#) where !isExcluded(match.range) {
      tokens.append(LiveMarkdownToken(kind: .blockquote, range: match.range))
      tokens.append(
        LiveMarkdownToken(kind: .syntax(hiddenWhenInactive: false), range: match.range(at: 1))
      )
    }

    for match in matches(#"(?m)^([ \t]*[-*+][ \t]+)(\[([ xX])\])([ \t]+)(.*)$"#)
    where !isExcluded(match.range) {
      taskLineRanges.append(match.range)
      tokens.append(LiveMarkdownToken(kind: .listItem, range: match.range))
      let completed = text.substring(with: match.range(at: 3)).lowercased() == "x"
      tokens.append(LiveMarkdownToken(kind: .task(completed), range: match.range(at: 2)))
      tokens.append(
        LiveMarkdownToken(kind: .syntax(hiddenWhenInactive: false), range: match.range(at: 1))
      )
      tokens.append(
        LiveMarkdownToken(kind: .syntax(hiddenWhenInactive: false), range: match.range(at: 4))
      )
    }

    for match in matches(#"(?m)^([ \t]*)([-*+]|[0-9]+\.)([ \t]+)(.*)$"#)
    where !isExcluded(match.range)
      && !taskLineRanges.contains(where: { NSIntersectionRange($0, match.range).length > 0 }) {
      tokens.append(LiveMarkdownToken(kind: .listItem, range: match.range))
      tokens.append(
        LiveMarkdownToken(kind: .syntax(hiddenWhenInactive: false), range: match.range(at: 2))
      )
    }

    for match in matches(#"(?m)^[ \t]*\|.*\|[ \t]*$"#) where !isExcluded(match.range) {
      tokens.append(LiveMarkdownToken(kind: .table, range: match.range))
    }

    for match in matches(#"(?m)^[ \t]*(?:---+|\*\*\*+)[ \t]*$"#)
    where !isExcluded(match.range) {
      tokens.append(LiveMarkdownToken(kind: .divider, range: match.range))
    }

    addInlineTokens(
      pattern: #"\*\*([^*\n]+)\*\*|__([^_\n]+)__"#,
      kind: .strong,
      markerWidth: 2,
      source: source,
      wholeRange: wholeRange,
      excludedRanges: excludedRanges,
      tokens: &tokens
    )
    addInlineTokens(
      pattern: #"(?<!\*)\*([^*\n]+)\*(?!\*)|(?<!_)_([^_\n]+)_(?!_)"#,
      kind: .emphasis,
      markerWidth: 1,
      source: source,
      wholeRange: wholeRange,
      excludedRanges: excludedRanges,
      tokens: &tokens
    )
    addInlineTokens(
      pattern: #"~~([^~\n]+)~~"#,
      kind: .strikethrough,
      markerWidth: 2,
      source: source,
      wholeRange: wholeRange,
      excludedRanges: excludedRanges,
      tokens: &tokens
    )
    addInlineTokens(
      pattern: #"`([^`\n]+)`"#,
      kind: .inlineCode,
      markerWidth: 1,
      source: source,
      wholeRange: wholeRange,
      excludedRanges: excludedRanges,
      tokens: &tokens,
      styleFullRange: true
    )

    for match in matches(#"\[([^\]\n]+)\]\(([^)\n]+)\)"#) where !isExcluded(match.range) {
      let label = match.range(at: 1)
      tokens.append(LiveMarkdownToken(kind: .link, range: label))
      tokens.append(
        LiveMarkdownToken(
          kind: .syntax(hiddenWhenInactive: true),
          range: NSRange(location: match.range.location, length: 1)
        )
      )
      tokens.append(
        LiveMarkdownToken(
          kind: .syntax(hiddenWhenInactive: true),
          range: NSRange(location: NSMaxRange(label), length: NSMaxRange(match.range) - NSMaxRange(label))
        )
      )
    }

    return tokens
  }

  private static func addInlineTokens(
    pattern: String,
    kind: LiveMarkdownTokenKind,
    markerWidth: Int,
    source: String,
    wholeRange: NSRange,
    excludedRanges: [NSRange],
    tokens: inout [LiveMarkdownToken],
    styleFullRange: Bool = false
  ) {
    guard let expression = try? NSRegularExpression(pattern: pattern) else { return }
    for match in expression.matches(in: source, range: wholeRange) {
      guard !excludedRanges.contains(where: { NSIntersectionRange($0, match.range).length > 0 })
      else { continue }
      var content = match.range(at: 1)
      if content.location == NSNotFound, match.numberOfRanges > 2 {
        content = match.range(at: 2)
      }
      tokens.append(LiveMarkdownToken(kind: kind, range: styleFullRange ? match.range : content))
      tokens.append(
        LiveMarkdownToken(
          kind: .syntax(hiddenWhenInactive: true),
          range: NSRange(location: match.range.location, length: markerWidth)
        )
      )
      tokens.append(
        LiveMarkdownToken(
          kind: .syntax(hiddenWhenInactive: true),
          range: NSRange(location: NSMaxRange(match.range) - markerWidth, length: markerWidth)
        )
      )
    }
  }
}
