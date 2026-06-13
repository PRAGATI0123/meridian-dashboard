# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Meridian — SaaS Analytics Dashboard

A subscription-analytics dashboard built as a UI/UX case study: from user research
and wireframes through a tokenised design system to a fully interactive React build.
Light/dark themes, real data filtering, and complete loading / empty / error states.

Highlights

Interactive — click any KPI to re-drive the hero chart; date-range filter
(90 days / 6 months / 12 months) re-slices every series live.
Dark mode — single data-theme toggle; charts re-theme automatically because
every color is a CSS variable.
All four states — ready, loading (skeleton shimmer), empty, and error
(with retry). A built-in Preview states switcher lets you see each one.
Accessible — keyboard focus rings, aria-pressed / aria-expanded,
prefers-reduced-motion respected.
Responsive — 4-col → 2-col → 1-col; sidebar collapses on mobile.


Screenshots

LightDarkShow ImageShow ImageShow ImageShow Image

Design system

TokenLightDarkRolecanvas#EDEBE4#1A1917app backgroundsurface#FBFAF6#232220cardsink#1F1E1B#F2F0EAprimary textaccent#1A6A66#3FA89Fbrand / primary seriesaccent-2#C8801E#E0A24Asecondary seriespositive#2E7D5B#5FB98Cgainsnegative#B4452F#D9744Flosses

Type — Fraunces (serif display + hero numbers · the signature) / Inter (UI) /
JetBrains Mono (tabular figures). Flat hairline-bordered cards, no heavy shadows.

Tokens are exported in design-tokens.json (importable into Figma via Tokens Studio).

Tech stack

React · Recharts · lucide-react · plain CSS variables (no UI framework)

Run locally

bashnpm create vite@latest meridian -- --template react
cd meridian
npm install recharts lucide-react
# replace src/App.jsx with MeridianDashboard.jsx (and update the import in main.jsx)
npm run dev

The component is self-contained — mock data and all styles live inside the file,
so there's nothing else to wire up.

Capturing the screenshots


npm run dev, open at 1440×900 (DevTools device toolbar → Responsive).
Capture overview-light.png, toggle theme, capture overview-dark.png.
Use the Preview states switcher for state-loading.png and state-error.png.
Drop them in screenshots/ — the README already references these names.


Process

This started as a design exercise: research → information architecture →
low-fi wireframe → design tokens → high-fidelity build. Notes on the key
decisions (light sidebar over the default dark navy, serif hero numbers,
semantic green/red kept conventional for data clarity) are in FIGMA-GUIDE.md.

License

Pragati— do whatever you like, attribution appreciated.