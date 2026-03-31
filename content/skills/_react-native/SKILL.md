---
name: _react-native
description: React Native and Expo guidance for mobile performance, UI patterns, navigation, animations, and native integration.
---

# React Native

Use this skill for React Native or Expo work. Keep `SKILL.md` as the routing layer and use the full guide for rule details.

## Priority Areas

1. List performance
2. Animation
3. Navigation
4. UI patterns
5. State management
6. Rendering
7. Monorepo and native dependency layout
8. Configuration

## Use

- Read [references/full-guide.md](references/full-guide.md) when you need full rules and examples.
- Start with the highest-impact category for the task.
- Prefer native or Expo-first patterns when the project already uses them.

## Core Expectations

- Optimize long lists first.
- Keep animations on supported properties.
- Prefer native-feeling navigation and UI primitives.
- Avoid broad subscriptions and wasteful rerenders.
- Keep native dependencies in the app package in monorepos.
