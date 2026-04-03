# NexLearn

NexLearn is a web application for learner onboarding, timed MCQ exams, and results. The implementation lives in the **`frontend/`** directory as a [Next.js](https://nextjs.org) 16 (App Router) application with Redux state, Tailwind CSS 4, and Ant Design for selected UI (e.g. loading states).

**Live deployment (Vercel):** (https://nexlearn-beta.vercel.app/)
---

## Repository layout

| Path | Purpose |
|------|---------|
| `frontend/` | Next.js app: UI, client state, and Next.js **Route Handlers** under `app/api/*` that proxy to the backend API |
| `frontend/app/` | App Router pages and layouts (`create-account`, `exam/*`, home) |
| `frontend/lib/` | Shared helpers (auth, exam API clients, guards, formatting) |
| `frontend/public/` | Static assets (logos, SVGs) |

**Version control:** Push this repository to GitHub, GitLab, or another Git host and share the clone URL with the technical team.

---

## Features

- **Account creation:** Phone + OTP flow, registration with profile image, country code selection
- **Exam flow:** Instructions screen → timed test with question palette, mark-for-review, navigation, submission modal
- **Results:** Score summary with breakdown (correct / incorrect / not attended)
- **Auth:** JWT stored client-side; logout clears tokens, exam cache, and Redux auth/exam slices
- **Responsive UI:** Mobile-specific layouts for exam test, instructions, and create-account branding

---

## Prerequisites

- **Node.js** 20+ (recommended; LTS)
- **npm** (ships with Node)

---

## Environment variables

Create **`frontend/.env`** (do not commit secrets; use `.env.example` patterns in docs only):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (e.g. `https://nexlearn.noviindusdemosites.in`) |

Example:

```env
NEXT_PUBLIC_API_URL=https://your-api-host.example
```

---

## Install and run (local)

From the repository root:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Alternative dev server (Webpack)

Useful if the default dev bundler causes issues on your machine:

```bash
npm run dev:webpack
```

### Production build

```bash
npm run build
npm start
```

The production **build** uses **`next build --webpack`** (see `package.json`) to avoid intermittent Turbopack manifest errors on some CI hosts (e.g. Vercel) with certain Next.js 16.2.x builds. **`output: "standalone"`** is enabled in `next.config.js` for optional container/self-hosted deployments.

---

## NPM scripts (`frontend/`)

| Script | Command |
|--------|---------|
| `dev` | `next dev` |
| `dev:webpack` | `next dev --webpack` |
| `build` | `next build --webpack` |
| `start` | `next start` |
| `lint` | `eslint` |

---

## API routes (Next.js Route Handlers)

These live under `frontend/app/api/` and typically forward requests to `NEXT_PUBLIC_API_URL`:

| Route | Role |
|-------|------|
| `POST /api/auth/send-otp` | Send OTP |
| `POST /api/auth/verify-otp` | Verify OTP |
| `POST /api/auth/register` | Register user |
| `POST /api/auth/logout` | Logout (server notification + client cleanup) |
| `GET /api/question/list` | Load exam questions |
| `POST /api/answers/submit` | Submit answers |

---

## Deployment notes

- **Production URL:** [https://nexlearn-qjmobc7oo-subiths-projects-29780f67.vercel.app/](https://nexlearn-qjmobc7oo-subiths-projects-29780f67.vercel.app/)
- **Vercel:** Set the project **Root Directory** to `frontend` if the Git repo root is this monorepo-style layout. Use **`npm run build`** as the build command.
- Clear build cache and redeploy if you hit missing manifest errors after upgrading Next.js.

---

## Tech stack (summary)

- **Framework:** Next.js 16, React 19, TypeScript
- **State:** Redux Toolkit (`app/store/`)
- **Styling:** Tailwind CSS 4
- **UI:** Ant Design (`antd`) + `@ant-design/nextjs-registry` for App Router styling
- **Forms / validation:** react-hook-form, zod
- **HTTP:** axios

---

## Submission checklist

- [ ] Code pushed to Git (GitHub / GitLab / other)
- [ ] This `README.md` present at repository root
- [ ] **Email to the technical team:** include **total time spent on coding** (estimate or tracked hours), any extra technical notes, and whether you expect timeline risks

*(Replace brackets in your email with your own numbers and notes.)*

---

## License

Unless stated otherwise elsewhere in this repository, project licensing is as specified by the course or employer providing this assignment.
