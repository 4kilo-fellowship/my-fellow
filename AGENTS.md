# AGENTS.md — Developer & AI Agent Guide for `my-fellow`

This document provides essential instructions, architecture guidelines, and operational procedures for AI coding agents and developers working on the `my-fellow` mobile application.

---

## 1. Project Overview

- **App Name:** My Fellow (AAU 4-Kilo ECSF Fellowship App)
- **Framework:** Expo SDK 58 (React Native 0.88.0, React 19.3.0)
- **Routing:** Expo Router (`app/` filesystem-based routing)
- **Styling:** NativeWind (Tailwind CSS v3) + React Native StyleSheet
- **Package Manager:** **Bun** (using `bun.lock`)
- **Native Generation:** Continuous Native Generation (CNG) via Expo Prebuild (no tracked `android`/`ios` folders)

---

## 2. Package Manager & Dependency Standards

- Always use **Bun** for managing dependencies:
  ```bash
  bun install
  bun add <package>
  bun add -d <package>
  ```
- For Expo-managed modules and SDK dependencies, run:
  ```bash
  bunx expo install <package>
  ```
- Keep lockfiles consistent: maintain `bun.lock` and **never** commit `package-lock.json` or `yarn.lock`.
- Do not mix package managers.

---

## 3. Expo SDK 58 & React Native 0.88 Guidelines

### React Native Strict TypeScript API
React Native 0.88 enforces strict typed exports:
1. **Ref instance types:** Use component-specific instance types exported by `react-native`:
   - `TextInputInstance` (or `React.ComponentRef<typeof TextInput>`) instead of `TextInput`
   - `ScrollViewInstance` (or `React.ComponentRef<typeof ScrollView>`) instead of `ScrollView`
   - `ViewInstance` (or `React.ComponentRef<typeof View>`) instead of `View`
2. **List Tokens:** Use `ListViewToken` (aliased as `ViewToken`) exported from `react-native`.
3. **No deep imports:** Never import from `react-native/Libraries/*`. Use top-level exports from `'react-native'`.
4. **Event handlers with React Hook Form:** React Native `onPress` passes `GestureResponderEvent`. Wrap form submissions as `onPress={() => handleSubmit(onSubmit)()}` to avoid event property type mismatches.

### Expo Router
1. Place initial route definitions inside `unstable_settings` export in `_layout.tsx`:
   ```tsx
   export const unstable_settings = {
     initialRouteName: "sign-up-step-1",
   };
   ```
   Do not pass `initialRouteName` directly as a prop to `<Stack>`.

---

## 4. Verification Workflow

Before completing any task, ensure all validation checks pass:

1. **Expo Doctor:**
   ```bash
   bunx expo-doctor
   ```
   Must report `20/20 checks passed. No issues detected!`.

2. **TypeScript Compilation:**
   ```bash
   bunx tsc --noEmit
   ```
   Must exit with code 0.

3. **Linter:**
   ```bash
   bun run lint
   ```
   Must pass with 0 errors.

4. **Metro Export Bundler Check:**
   ```bash
   bunx expo export --platform android --no-bytecode
   rm -rf dist
   ```
   Confirms bundling completes without asset or module resolution failures.

---

## 5. Directory Structure

```
my-fellow/
├── app/                  # Expo Router filesystem navigation
│   ├── (auth)/           # Authentication flows (sign-in, sign-up, otp, legal)
│   ├── (tabs)/           # Main bottom tabs (home, devotions, gifts, profile)
│   ├── _layout.tsx       # Root layout & providers
│   └── ...               # Additional screen routes
├── assets/               # Images, fonts, splash screens, icons
├── components/           # Reusable UI components
├── constants/            # Constants (theme colors, static data, API endpoints)
├── context/              # React Context providers (e.g. ThemeContext)
├── hooks/                # Custom React hooks
├── services/             # API services and HTTP calls (Axios)
├── stores/               # Zustand state stores
├── types/                # TypeScript interfaces and type definitions
├── utils/                # Helper utilities and formatters
└── bun.lock              # Bun lockfile
```
