# React Native Guide

Use these rules when React Native or Expo details matter beyond the routing skill.

## Rendering

- Do not render strings directly inside `View`; wrap text in `Text`.
- Avoid `{value && <Component />}` when `value` can be `0` or `""`; use a ternary, explicit boolean, or early return.
- Keep render pure: no mutation, async work, subscriptions, navigation, storage, or analytics from render.
- Use stable list keys from real ids, not array indexes.

## Lists

- Use a virtualized list for non-trivial lists: `FlatList`, `FlashList`, or `LegendList` based on the project.
- Keep `renderItem` cheap. Move heavy layout, formatting, and data joins out of list rows.
- Do not create inline objects, arrays, or callbacks inside list rows when they break memoization.
- Pass primitives to memoized rows when practical.
- Use item types for heterogeneous lists when the list library supports them.
- Use compressed/resized images in rows.

## Animation And Scroll

- Animate `transform` and `opacity`; avoid animating layout properties when smoothness matters.
- Keep scroll position in shared values or refs, not React state.
- Prefer `useDerivedValue` over `useAnimatedReaction` when deriving animated values.
- Use gesture-native APIs for animated press, pan, and drag states.

## Navigation

- Prefer native navigators and project-standard navigation patterns.
- Keep route params serializable and small.
- Do not use navigation as a global state store.
- Put screen-level data loading, permissions, and error handling at the screen boundary.

## State

- Keep state minimal and derive values instead of duplicating them.
- State should represent ground truth, not cached copies of props, query data, or computed labels.
- Use updater functions when new state depends on previous state.
- Avoid broad store subscriptions; subscribe to the narrow value each component needs.
- Use server-state/query tools for API data instead of mirroring API results into local state.

## React Compiler And Reanimated

- Destructure functions and values early enough for the compiler to see stable access patterns.
- Use current Reanimated shared-value access style expected by the installed version.
- Do not mix old and new Reanimated idioms in the same file without a compatibility reason.

## UI

- Measure layout with native layout callbacks or project-standard hooks, not repeated polling.
- Prefer platform-native controls for menus, modals, pickers, and share sheets when they fit the workflow.
- Use `Pressable` over legacy touchable components unless the project standard says otherwise.
- Use `contentInset` and safe-area-aware behavior for scroll spacing where supported.
- Use optimized image components such as `expo-image` when the project already uses them.
- Prefer native modals over JS-only bottom sheets when platform behavior, accessibility, or performance matters.

## Design System

- Reuse the app's design system primitives before adding one-off UI.
- Prefer simple compound components over polymorphic children when it makes call sites clearer.
- Keep style objects stable when they are passed into memoized or frequently-rendered children.

## Monorepos And Native Dependencies

- Install native dependencies in the app package that owns the native project.
- Keep one version of native dependencies across the monorepo unless the workspace has an explicit compatibility split.
- Check Expo config, native project files, and package manager workspace rules before moving dependencies.

## Imports And Utilities

- Import shared UI from the design system or local app convention, not directly from scattered leaf modules.
- Hoist expensive formatters such as `Intl.NumberFormat` and `Intl.DateTimeFormat`.
- Keep platform checks localized and obvious.

## Fonts

- Prefer native/build-time font loading when the project supports it.
- Avoid runtime font loading in hot UI paths.
