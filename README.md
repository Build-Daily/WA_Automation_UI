# WA_Automation_UI

Next.js dashboard for the WhatsApp Automation SaaS platform.

## Stack

- **Next.js 14** (Pages Router, JavaScript)
- **Tailwind CSS** with a custom dark theme
- **DM Sans + DM Mono** via Google Fonts

## Prerequisites

- Node.js 18+
- Backend (`wa-automation-backend`) running on `localhost:3000`

## Setup

```bash
cd WA_Automation_UI
npm install
npm run dev       # starts on localhost:3001
```

Open [http://localhost:3001](http://localhost:3001).

## Project structure

```
WA_Automation_UI/
├── pages/
│   ├── _app.js               # Global layout + CSS
│   ├── _document.js          # Font preconnect, meta
│   ├── index.js              # / — Dashboard (today's stats)
│   ├── appointments/
│   │   └── index.js          # /appointments — table + actions
│   └── slots/
│       └── index.js          # /slots — slot management
├── components/
│   ├── Layout.js             # Sidebar + main wrapper
│   ├── Sidebar.js            # Left navigation
│   ├── PageHeader.js         # Title bar shared across pages
│   ├── StatCard.js           # Metric card for dashboard
│   ├── StatusBadge.js        # Coloured status pill
│   └── Modal.js              # Reusable confirm/form dialog
├── lib/
│   └── api.js                # All fetch helpers — one import for all pages
├── styles/
│   └── globals.css           # Tailwind base + custom utilities
├── next.config.js            # Rewrites /api/* → localhost:3000/api/*
├── tailwind.config.js
└── API_CONTRACT.md           # Full backend endpoint specification
```

## API proxy

All `/api/*` requests are transparently proxied to the backend:

```js
// next.config.js
rewrites: [{ source: "/api/:path*", destination: "http://localhost:3000/api/:path*" }]
```

No CORS configuration needed on the backend for dashboard calls.

## Adding a new page

1. Create `pages/your-page/index.js`
2. Import helpers from `lib/api.js` (or add new ones there)
3. Add a nav entry in `components/Sidebar.js`

## Backend endpoints

See [`API_CONTRACT.md`](./API_CONTRACT.md) for the full specification of every endpoint the UI expects, including request/response shapes and error format.
