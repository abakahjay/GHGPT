# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

GH-GPT: a React 18 + Vite single-page frontend for an AI chatbot (with some leftover Instagram-clone features: feed posts, profiles, follows, DMs). It is **frontend only**. Everything goes through the separate Express backend FullBackendd. The AI calls happen on the backend; the frontend never calls an LLM itself.

This folder is `Chatbot/` inside the `abakahjayy/GHGPT` repo, which is what the Render deploy builds from.

## Commands

```bash
npm run dev       # Vite dev server on port 7009 (set in vite.config.js)
npm run build     # production build to dist/
npm run preview   # serve the built dist/
npm run lint      # ESLint flat config (eslint.config.js; react/prop-types is off)
npm test          # vitest; run one file: npx vitest run src/__tests__/UsernameDis.test.jsx
```

Testing setup is incomplete. `vitest`, `jsdom`, `@testing-library/react` and `@testing-library/jest-dom` are referenced in `vite.config.js` and `setupTests.js`, but they are not in `package.json`. Install them before running tests. The only existing test is a placeholder.

## Environment

`src/utils/config.js` exports `API_URL`. It uses `VITE_API_URL` when that is set. Otherwise dev falls back to `http://localhost:7004` (FullBackendd's default port) and production builds fall back to `https://fullbackendd.onrender.com`. Always import `API_URL` instead of reading `import.meta.env` directly. See `.env.example`.

The app uses client-side routing, so the static host must rewrite every path to `/index.html`. `vercel.json` does this for Vercel. The Render static site (https://gh-gpt.onrender.com) has a dashboard rewrite rule `/*` → `/index.html`.

## Architecture

**Routing** (`src/App.jsx`): the router is created once, at module level. The `Protected`, `PublicPage` and `AuthRoute` wrappers read the auth store and pass `authUser`/`onLogout` into each page as props. `Protected` wraps its page in `PageLayout` and redirects to `/auth` when logged out. `Chatpage1` and `Control` are lazy-loaded; the chat page pulls in the syntax highlighter, which is large. Whenever the token changes, `App` refreshes the user from `GET /api/v1/auth/dashboard`. A 401 logs the user out; a network error keeps the cached user.

**Two page folders:** `src/routes/` and `src/pages/` both hold pages. Check which copy `App.jsx` imports before editing. The copies in `routes/Authpage/`, `routes/chatPage/ChatPage.jsx`, `routes/signInPage`, `routes/signUpPage`, `pages/Homepage/`, and `Layouts/rootLayout` / `Layouts/dashboardLayout` are not imported by anything.

**Auth:** `useAuthStore` holds `{ user, token }` and persists them to the `localStorage` key `"user-info"`. Use `setSession({ user, token })`, `setAuthUser(user)` or `logoutUser()`; don't write localStorage by hand. The backend's login and signup only return `{ token, userId }`, so `useLogin`/`useSignup` then load the user with `fetchCurrentUser(token)` from `utils/auth.js`. The axios instance in `utils/api.js` attaches the stored Bearer token automatically. For Google login, `GoogleAuth` sends `redirect_uri=<origin>/auth/callback`, and `GoogleCallback` verifies the returned token. Use `unwrapUser(authUser)` to handle both `{ user }` and bare-user shapes.

**Chat flow:**
1. `/dashboard` (`routes/dashboardPage/Dashboard.jsx`) creates an empty chat (`text: "New Chat"`, which the backend stores as a `"."` placeholder). It puts the typed message/image in `useAiChatStore.pendingMessage` (in memory, not localStorage) and navigates to `/chat/:chatId`.
2. The chat page takes `pendingMessage` and sends it with `hooks/useHandleMessageSend.js`. That hook calls `POST /api/v1/ai/ask` (multipart when there's an image), then saves the Q&A with `useAddMessage` or `useAddImageMessage`, then silently refreshes `userChats`, because the backend retitles the chat after the first question.
3. Every hook converts backend `history` (`{ role, parts: [{text}], img? }`) with `utils/formatMessage.js`. The chat page hides the `"."` placeholder, but it keeps each message's original history index (`idx`), because edit/delete endpoints are index-based.

**Layout & UI:** Chakra UI v2. The theme is in `src/theme.js` and defaults to dark mode. `ColorModeToggle` switches light/dark. Use its semantic color tokens (`bg.canvas`, `bg.surface`, `bg.subtle`, `bg.hover`, `border.default`, `text.muted`, `bubble.user`, `bubble.bot`, `accent`) instead of hardcoded colors so both modes work. `PageLayout` is responsive:
- phones: top bar plus a drawer
- `md`: a 72px icon rail (`SideBar compact`)
- `lg`+: a 264px sidebar with recent chats

Shared pieces are in `components/ui/` (`Brand`, `ColorModeToggle`), `components/Chat/` (`Composer`, `MessageContent`) and `components/SideBar/NavItem.jsx`. Set text inputs to `fontSize="16px"` so iOS doesn't zoom.

## Legacy code

Nothing imports these files:
- `src/lib/gemini.js` (its `@google/generative-ai` package isn't installed) and `src/firebase/firebase.js`
- `components/ChatApp/ChatAppDemo.jsx` (socket.io demo) and `components/test/Try1.jsx`
- the feed/post/comment/follow components from the Instagram clone
- `routes/Authpage/*`, which only re-exports `pages/Authpage/*`
- `components/ui/{color-mode,provider,toaster,tooltip}.jsx`, which are thin Chakra v2 wrappers
- `hooks/useCreateChat.js` and `hooks/useDeleteChat.js`, which delegate to `useAiChatActions`

`npm run lint` is clean. Keep it that way.
