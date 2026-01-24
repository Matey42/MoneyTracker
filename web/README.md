# MoneyTracker Web

Frontend for MoneyTracker (React 19 + TypeScript + Vite).

## Quick Start

```bash
npm install
npm run dev
```

## API Modes

Create a `.env` file (see `.env.example`) to switch between mock and backend-driven modes:

- `VITE_API_MODE=mock` uses mock auth + mock data for fast UI work.
- `VITE_API_MODE=hybrid` uses backend auth with mocked wallets/transactions (override each data source below).
- `VITE_API_MODE=api` uses backend auth and real data endpoints.

Data source selectors (use `mock` or `api`) let you mix and match in hybrid mode:
- `VITE_AUTH_SOURCE`
- `VITE_WALLETS_SOURCE`
- `VITE_TRANSACTIONS_SOURCE`

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Typecheck + build
npm run preview  # Preview production build
npm run lint     # Lint
```
