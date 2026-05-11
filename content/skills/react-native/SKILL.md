---
name: react-native
description: React Native and Expo guidance for mobile performance, UI patterns, navigation, animations, and native integration.
---

# React Native

Use this routing layer for React Native or Expo work. Read the full guide only when detailed rules matter.

## Priority Areas

1. Rendering crashes
2. List performance
3. Animation and scroll
4. Navigation and native UI
5. State and subscriptions
6. Monorepo/native dependency layout

## Use

- Read [references/full-guide.md](references/full-guide.md) when you need full rules and examples.
- Prefer native or Expo-first patterns when the project already uses them.

## Core Expectations

- Optimize long lists first.
- Keep animations on supported properties.
- Prefer native-feeling navigation and UI primitives.
- Avoid broad subscriptions and wasteful rerenders.
- Keep native dependencies in the app package in monorepos.
