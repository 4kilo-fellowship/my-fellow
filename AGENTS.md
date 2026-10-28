# 4 Kilo Fellowship Ecosystem — Agent & Developer Guide

This repository container hosts the complete digital ecosystem for the **4 Kilo Christian Students Fellowship (AAU ECSF)**.

---

## 1. Ecosystem Repositories

| Repository | Tech Stack | Role | Port / Target |
| :--- | :--- | :--- | :--- |
| **`my-fellow`** | Expo SDK 58, React Native 0.88, NativeWind, Bun | Cross-platform mobile app (Android & iOS) | Expo Dev Server (8081) |
| **`my-fellow-api`** | Node.js (v24), Express 5, Prisma 7, PostgreSQL, MongoDB, Bun | Backend REST API server | 3000 / Production (Render) |
| **`my-fellow-bot`** | Grammy.js, TypeScript, Axios, Bun | Telegram Bot automation | Long polling / Webhook |
| **`my-fellow-admin`** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Bun | Administrative web dashboard | Next.js Dev (3000) |
| **`my-fellow-website`** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Bun | Public landing and informational website | Next.js Dev (3001) |

---

## 2. Environment Variables & Secrets Setup

Environment configurations are stored in `.env` files (ignored in Git). When bootstrapping new environments:

- **`my-fellow-api`**:
  - `PORT`: Server listening port (default: `3000`)
  - `JWT_SECRET`, `JWT_EXPIRES_IN`: Authentication token configuration
  - `MONGO_URI`: MongoDB connection string
  - `CLOUDINARY_*`: Cloudinary media upload credentials
- **`my-fellow-bot`**:
  - `BOT_TOKEN`: Telegram bot token from @BotFather
  - `API_BASE_URL`: URL of the deployed `my-fellow-api`

---

## 3. Package Management Standard: Bun

All projects standardize on **Bun** as the package manager:
- Use `bun install` to install dependencies.
- Use `bun run build` to build.
- Maintain `bun.lock` in each repository.
- Avoid committing npm `package-lock.json` or Yarn `yarn.lock`.

---

## 4. Key Developer Commands

### `my-fellow` (Mobile)
```bash
cd my-fellow
bun install
bunx expo start
bunx expo-doctor
bunx tsc --noEmit
bun run lint
```

### `my-fellow-api` (Backend)
```bash
cd my-fellow-api
bun install
bun run db:generate   # prisma generate
bun run build         # prisma generate && tsc
bun run dev           # nodemon with tsx
```

### `my-fellow-bot` (Telegram Bot)
```bash
cd my-fellow-bot
bun install
bun run build         # tsc
bun run dev           # nodemon
```

### `my-fellow-admin` (Admin Dashboard)
```bash
cd my-fellow-admin
bun install
bun run build         # next build
bun run dev           # next dev
```

### `my-fellow-website` (Public Website)
```bash
cd my-fellow-website
bun install
bun run build         # next build
bun run dev           # next dev
```

---

## 5. Coding Agent Guidelines

1. **Isolation:** Maintain each sub-project as an independent Git repository with its own remote (`origin` pointing to `https://github.com/4kilo-fellowship/<repo-name>.git`).
2. **Type Safety:** Adhere to strict TypeScript typing. Do not bypass errors with `any`, blanket `@ts-ignore`, or disabling compiler options.
3. **Expo Upgrades:** Always align packages using `bunx expo install --fix` and verify with `bunx expo-doctor` and `bunx tsc --noEmit`.

---

## 6. Authentication Architecture

The mobile app and backend implement a modern, passwordless authentication flow tailored for Ethiopia:

1. **Passwordless Phone-Only OTP:**
   - Entry point: `app/(auth)/sign-in.tsx` accepts only Ethiopian phone numbers (supporting `09...`, `07...`, `+251...`).
   - SMS delivery via GeezSMS gateway (`GEEZ_API_KEY` in `my-fellow-api/.env`).
   - Secure 6-digit OTP verification with timing-safe hash comparison and 5-minute expiration (`app/(auth)/otp-verify.tsx`).
2. **Backend Endpoints:**
   - `POST /api/auth/phone/send-otp`: Sends a 6-digit OTP via GeezSMS with rate limiting (60s cooldown).
   - `POST /api/auth/phone/verify-otp`: Verifies OTP, upserts user, issues JWT, and returns `isNewUser: boolean`.
   - `POST /api/auth/signin`: Preserved for administrative password-based logins (`my-fellow-admin`).
3. **Fellowship Profile Onboarding:**
   - If `isNewUser: true` or required profile fields are missing, user is routed to `app/(auth)/personalization.tsx` to set full name, fellowship team, department, and academic year.
   - Returning members with complete profiles transition directly to `/(tabs)`.

