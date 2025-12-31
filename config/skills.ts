/**
 * Skill configurations for OpenCode
 * Defines which instructions are skills and their trigger descriptions
 */

export interface SkillConfig {
  /** Instruction file name (without .md) */
  instruction: string;
  /** Skill trigger description (when to use this skill) */
  description: string;
}

export const SKILLS: Record<string, SkillConfig> = {
  planning: {
    instruction: "plan",
    description:
      "Create structured implementation plans with scope, phases, and risks. Use when user wants to plan a feature, architect a solution, design an approach, or says 'let's plan', 'create a plan', 'how should we build this', or needs to break down work into steps.",
  },
  execution: {
    instruction: "execution",
    description:
      "Implement approved plans into production-ready code. Use when user wants to build, implement, code, or execute an approved plan. Activates when user says 'let's build', 'implement this', 'start coding', or 'execute the plan'.",
  },
  "frontend-design": {
    instruction: "frontend-design",
    description:
      "UI/UX focused editing for visual changes only. Use for styling, layout, animations, typography, and design system work. No logic changes. Supports ULTRATHINK trigger for deep design analysis.",
  },
  workshop: {
    instruction: "workshop",
    description:
      "Explore and stress-test ideas before building. Use when user wants to brainstorm, think through an approach, explore options, discuss trade-offs, or says 'let's workshop this', 'think through', 'explore idea', or 'brainstorm'.",
  },
  debugging: {
    instruction: "debugging",
    description:
      "Systematically investigate and fix bugs with evidence-based diagnosis. Use when user mentions a bug, error, something not working, unexpected behavior, or says 'debug this', 'why is this broken', 'fix this bug', or describes symptoms of a problem.",
  },
  "code-review": {
    instruction: "code-review",
    description:
      "Review code changes for bugs, security, and design issues. Use when user wants to review code, check a PR, review changes, or says 'review this', 'check my code', 'PR review', or 'code review'.",
  },
  refactoring: {
    instruction: "refactoring",
    description:
      "Restructure code without changing behavior. Use when user wants to refactor, clean up code, restructure, or says 'refactor this', 'clean this up', 'this code is messy', or identifies code smells to fix.",
  },
  "product-strategy": {
    instruction: "product-strategy",
    description:
      "Find 10x product opportunities and high-leverage improvements. Use when user wants strategic product thinking, mentions '10x', wants to find high-impact features, or says 'what would make this 10x better', 'product strategy', or 'what should we build next'.",
  },
  "feature-research": {
    instruction: "feature-research",
    description:
      "Deep research on features before building with co-founder mindset. Use when user wants to research a feature idea, explore if something is worth building, or says 'research this feature', 'is this worth building', 'explore this idea', or wants product + market + tech analysis.",
  },
  "api-handoff": {
    instruction: "api-handoff",
    description:
      "Create API handoff documentation for frontend developers. Use when backend work is complete and needs to be documented for frontend integration, or user says 'create handoff', 'document API', 'frontend handoff', or 'API documentation'.",
  },
  "backend-requirements": {
    instruction: "backend-requirements",
    description:
      "Document frontend data needs for backend developers. Use when frontend needs to communicate API requirements to backend, or user says 'backend requirements', 'what data do I need', 'API requirements', or is describing data needs for a UI.",
  },
  "user-story-review": {
    instruction: "user-story-review",
    description:
      "Review user stories from a developer perspective. Use when user wants to review user stories, check story quality, or says 'review this story', 'is this story clear', 'story feedback', or has user stories that need developer review before implementation.",
  },
  translation: {
    instruction: "translation",
    description:
      "Review translations for quality, naturalness, and cultural fit. Use when user wants to review translations, check i18n files, or says 'review translations', 'check localization', or mentions translation quality issues.",
  },
} as const;
