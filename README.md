# GuiltPing

A lightweight accountability app for a small group of friends to build consistency solving daily DSA questions. Each person checks in once per day, and at 8 PM the app sends a summary notification showing who completed and who didn’t—creating social accountability and motivation.

## Overview
- Simple daily check-in: "I completed today’s DSA"
- Group summary notification at 8 PM
- Streak tracking to encourage habits
- Minimal UI focused only on accountability

## Key Features
- User accounts for each friend (5-person group by default)
- Daily check-in flow
- Automatic 8 PM summary sent to all users
	- List of users who completed
	- List of users who did not complete
- Optional streak tracking
- Backend scheduler for daily summary

## Tech Stack
- Frontend: Vite + React + TypeScript
- Styling: Tailwind CSS
- Components: ShadCN-style UI library in `src/components/ui`
- Notifications: Web Push (PWA) with service worker
- Build/Package: Bun or npm

## Architecture
- `src/pages`: Top-level views (Index, History, Profile, Auth, Install, GroupSetup)
- `src/components`: Reusable UI (CheckInButton, StreakCounter, StatusBadge, CalendarDay, BottomNav, etc.)
- `src/hooks`: Client hooks (push notifications, PWA install, mobile detection, toast)
- `src/lib/utils.ts`: Shared utilities
- `public/`: Static assets and `robots.txt`

Backend:
- `backend/`: Express + MongoDB API, JWT auth, check-ins, and a cron worker.
- Start API: `cd backend && npm install && npm run dev`
- Run cron: `cd backend && npm run summary`

Daily Summary (8 PM):
- A scheduler (server-side or serverless cron) aggregates check-ins and dispatches a Web Push or a backend-driven notification to all group members.
- Client PWA subscribes to push notifications and displays the summary.

## Setup

You can use Bun or npm. Pick one and stick to it.

### Prerequisites
- Node.js 18+ (or Bun 1.0+)
- A push notifications service (VAPID keys) if enabling Web Push

### Install
```zsh
# Using bun
bun install

# Or using npm
npm install
```

## Development
```zsh
# Start dev server
# Bun
bun dev

# npm
npm run dev
```

Open the app at `http://localhost:5173` (default Vite port).

### Build & Preview
```zsh
# Build
bun run build
# or
npm run build

# Preview production build
bun run preview
# or
npm run preview
```

## Configuration

Create a `.env` file for any environment-specific settings (examples below):
```
VITE_APP_NAME=GuiltPing
VITE_GROUP_SIZE=5
VITE_PUSH_PUBLIC_KEY=<your_vapid_public_key>
VITE_PUSH_SERVER_URL=<your_backend_push_endpoint>
VITE_SUMMARY_CRON="0 20 * * *" # 8 PM daily
```

Notes:
- `VITE_PUSH_PUBLIC_KEY` and `VITE_PUSH_SERVER_URL` are used if you enable web push notifications.
- `VITE_SUMMARY_CRON` represents the backend scheduler timing. Frontend reads it only for display; actual scheduling must run on a backend.

## Notifications (8 PM Summary)

There are two recommended approaches:
- Serverless Cron: Use a platform cron (e.g., Cloudflare Workers Cron, Vercel Cron, AWS EventBridge) to trigger a function at 8 PM.
- Server Scheduler: Run a small backend (Node, Bun, or server framework) with a cron job (e.g., `node-cron`) at 8 PM.

Workflow:
1. Users submit daily check-ins via the UI (`CheckInButton`).
2. At 8 PM, the backend aggregates completion states and constructs the summary.
3. Backend sends a push notification to all subscribed members (Web Push via VAPID).
4. Client PWA displays the summary (completed vs. not completed, streaks optional).

### Backend Cron Example
- See `backend/src/cron.mjs` for a minimal Node script using `node-cron`.
```zsh
cd backend
npm install
npm run summary
```

## PWA & Push
- The app uses hooks like `usePushNotifications` and `usePWAInstall` to manage subscriptions and install prompts.
- Ensure service worker registration and VAPID keys are configured on the backend.
- On iOS/macOS Safari, push requires user consent and HTTPS.

### Backend Push Endpoints
- `POST /api/notifications/subscribe` (auth required): store `{ endpoint, keys: { p256dh, auth } }` for the signed-in user.
- `POST /api/notifications/unsubscribe` (auth required): remove a subscription by `endpoint`.
- `POST /api/notifications/test` (auth required): send a test Web Push to the user’s subscriptions.

Backend config (in `backend/.env`):
```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:maintainer@guiltping.app
```

Frontend subscription flow:
- The app fetches the VAPID public key from `GET /api/notifications/public-key`.
- Service worker is registered via VitePWA (`registerType: autoUpdate`).
- `usePushNotifications` subscribes with `PushManager.subscribe` and posts the subscription to `POST /api/notifications/subscribe`.

## Data Model (Conceptual)
- Users: id, name, pushSubscription, streak
- Check-ins: userId, date, completed
- Daily Summary: date, completedUserIds, pendingUserIds

## Roadmap
- Auth integration (OIDC or passwordless)
- Admin controls for group setup (size, time, reminders)
- Enhanced streak logic (breaks, grace periods)
- Rich notifications (avatars, quick actions)
- Offline-first improvements

## Contributing
Pull requests welcome. Keep changes minimal and focused.

## License
MIT License. See `LICENSE` for details.

## Contributing
Please read `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` before submitting issues or PRs.

## Security
Please report vulnerabilities privately. See `SECURITY.md` for the disclosure policy.

