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

**Routing** (`src/App.jsx`): the router is created once, at module level. The `Protected`, `PublicPage` and `AuthRoute` wrappers read the auth store and pass `authUser`/`onLogout` into each page as props. `Protected` wraps its page in `PageLayout` and redirects to `/auth` when logged out. `Chatpage1`, `Control` and `InstallPage` are lazy-loaded; the chat page pulls in the syntax highlighter and Markdown renderer, which are large. `Chatpage1` exports a `ChatRoute` wrapper that keys the page by `chatId`, so each chat gets a fresh instance. Whenever the token changes, `App` refreshes the user from `GET /api/v1/auth/dashboard`. A 401 logs the user out; a network error keeps the cached user.

**Two page folders:** `src/routes/` and `src/pages/` both hold pages. Check which copy `App.jsx` imports before editing. The copies in `routes/Authpage/`, `routes/chatPage/ChatPage.jsx`, `routes/signInPage`, `routes/signUpPage`, `pages/Homepage/`, and `Layouts/rootLayout` / `Layouts/dashboardLayout` are not imported by anything.

**Auth:** `useAuthStore` holds `{ user, token }` and persists them to the `localStorage` key `"user-info"`. Use `setSession({ user, token })`, `setAuthUser(user)` or `logoutUser()`; don't write localStorage by hand. The backend's login and signup only return `{ token, userId }`, so `useLogin`/`useSignup` then load the user with `fetchCurrentUser(token)` from `utils/auth.js`. After login, signup and Google sign-in, `sendAuthEvent()` posts `/api/v1/ghgpt/events`, which is how the backend sends the welcome and new-device emails (fire-and-forget). The axios instance in `utils/api.js` attaches the stored Bearer token automatically. For Google login, `GoogleAuth` sends `redirect_uri=<origin>/auth/callback`, and `GoogleCallback` verifies the returned token. Use `unwrapUser(authUser)` to handle both `{ user }` and bare-user shapes.

**Chat flow (ChatGPT/Claude style):** all logged-in chat calls go through `utils/ghgptApi.js` → FullBackendd `/api/v1/ghgpt` (JWT; the user comes from the token).
1. `/dashboard` creates an empty chat (`POST /api/v1/ai/chats/:userId` with `text: "New Chat"`, which the backend stores as a `"."` placeholder). It puts the typed message/image in `useAiChatStore.pendingMessage` (in memory, not localStorage) and navigates to `/chat/:chatId`.
2. The chat page (`routes/chatPage/Chatpage1.jsx`) sends with `streamMessage()`: `POST /ghgpt/chats/:id/stream` (Server-Sent Events: `token` → `done` with the saved history → optional `title`, or `error`). Modes: `send`, `regenerate` (replace last answer), `edit` (`editIndex`; drops that message and everything after). Images are uploaded first (`POST /ghgpt/uploads` → `imageId`). Custom instructions (Settings, localStorage) go with every message. The backend keeps conversation context, so follow-ups work.
3. `live` state holds the exchange in progress. Streamed text is revealed with requestAnimationFrame (`targetRef` → `liveText`) and the saved history is swapped in once the reveal catches up. Stop = abort the fetch (Esc too); the backend saves the partial answer. Leaving the chat doesn't abort; the server finishes and saves. Errors keep the user's message and show Retry.
4. `utils/formatMessage.js` converts backend `history` (`{ role, parts: [{text}], img? }`). The page hides the `"."` placeholder but keeps each message's original history index (`idx`) because edit/delete are index-based (the backend adjusts `editIndex` for the placeholder).
5. Sidebar `RecentChats` groups chats (Pinned/Today/Yesterday/7/30 days/Older) with rename/pin/delete; `ChatHeader` adds Email me this chat and Download (.md). Both use `hooks/useChatListActions.js`. Titles are AI-generated by the backend after the first answer.

**Attachments, images and charts:**
- `Composer` takes `attachments` (items shaped `{ key, kind: 'image'|'doc', file, preview }`: one image, up to 5 documents; attach, paste or drop) and `tool` (`'image'` = "Create image").
- The chat page's `run()` uploads everything first. Images go to `POST /ghgpt/uploads` and return an `imageId`; documents go to `POST /ghgpt/files` and return `fileIds`. The body is then marked `uploaded`, so Retry doesn't upload again.
- `status` stream events ("Reading report.pdf…", "Creating image…") show next to the thinking dots.
- `formatMessage` exposes `attachments` (file chips that link to the original) and `generated` (an `img` on a model message is an image GH-GPT created).
- `MessageContent` renders ```chart JSON blocks with `components/Chat/ChartBlock.jsx` (recharts).
- Legal pages live at `/privacy` and `/terms` (`pages/Legal/LegalPage.jsx`). `SUPPORT_EMAIL` is in `utils/config.js`.
- After installing a new dependency, restart Vite with `--force`. Otherwise its prebundle can load two copies of React ("Invalid hook call").

**Device notifications (Web Push):** `public/push-sw.js` is loaded into the generated service worker via `workbox.importScripts`. `utils/push.js` has `enablePush` (call it from a click), `disablePush`, `getPushState`, `sendTestPush`, and `syncPushSubscription` (called after the user refreshes in `App.jsx`). The switch is `components/Settings/PushSettings.jsx` in Settings; `NotificationPrompt.jsx` is a one-time card on the dashboard. The backend is FullBackendd `utils/push.js`.

**Installable app (PWA):** `vite-plugin-pwa` generates the manifest (icons in `public/icons/`, rendered from the logo SVG; maskable + apple-touch) and service worker. `main.jsx` registers it with `virtual:pwa-register`; `skipWaiting`/`clientsClaim` are set explicitly in `vite.config.js` because `injectRegister: false` drops them, and without them a deploy waits until every tab closes. `utils/installPrompt.js` captures `beforeinstallprompt` (Chrome/Edge on Android, Windows, Mac) for the Install button on `/install`, which also explains Safari's Add to Home Screen / Add to Dock for iPhone, iPad and Mac.

**Layout & UI:** Chakra UI v2. The theme is in `src/theme.js` and defaults to dark mode. `ColorModeToggle` switches light/dark. Use its semantic color tokens (`bg.canvas`, `bg.surface`, `bg.subtle`, `bg.hover`, `border.default`, `text.muted`, `bubble.user`, `bubble.bot`, `accent`) instead of hardcoded colors so both modes work. `PageLayout` is responsive:
- phones: top bar plus a drawer
- `md`: a 72px icon rail (`SideBar compact`)
- `lg`+: a 264px sidebar with recent chats

Shared pieces are in `components/ui/` (`Brand`, `ColorModeToggle`), `components/Chat/` (`Composer` with Stop mode, `MessageContent` = react-markdown + GFM, `ChatHeader`, `RenameChatModal`), `components/Settings/SettingsModal.jsx`, and `components/SideBar/` (`NavItem`, `RecentChats`, `ProfileMenu`). Set text inputs to `fontSize="16px"` so iOS doesn't zoom.

## Legacy code

Nothing imports these files:
- `src/lib/gemini.js` (its `@google/generative-ai` package isn't installed) and `src/firebase/firebase.js`
- `components/ChatApp/ChatAppDemo.jsx` (socket.io demo) and `components/test/Try1.jsx`
- the feed/post/comment/follow components from the Instagram clone
- `routes/Authpage/*`, which only re-exports `pages/Authpage/*`
- `components/ui/{color-mode,provider,toaster,tooltip}.jsx`, which are thin Chakra v2 wrappers
- `hooks/useCreateChat.js` and `hooks/useDeleteChat.js`, which delegate to `useAiChatActions`
- `hooks/useHandleMessageSend.js`, `useAddMessage.js`, `useAddImageMessage.js`, `useEditMessage.js`: the older non-streaming `/api/v1/ai/ask` flow, replaced by `/ghgpt/.../stream`
- `routes/homePage/homepage.css` (the homepage now uses `components/Home/ChatShowcase.jsx`)

`npm run lint` is clean. Keep it that way.
