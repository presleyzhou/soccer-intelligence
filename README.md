# Soccer Intelligence

Deployable bilingual platform for international football match probabilities, score distributions, tournament simulation, market comparison, and evidence-grounded AI answers.

## What is implemented

- Next.js 15, React 19, strict TypeScript and responsive bilingual routes.
- Dashboard, match centre, detailed multi-model forecasts, teams, groups, bracket, markets, methodology, backtest, sources and disclaimer.
- Dark/light theme and local timezone formatting.
- FastAPI Elo, Dixon-Coles/Poisson, ensemble, evaluation and deterministic Monte Carlo service.
- PostgreSQL Prisma schema covering teams, matches, lineups, ratings, odds, markets, news, model versions, immutable predictions, simulations and chat.
- Provider adapters for football-data.org, Open-Meteo and Polymarket, with retries and controlled degradation.
- Evidence-constrained bilingual chat API with a no-LLM fallback.
- Docker, Compose, CI, tests and health/readiness endpoints.

The public site uses TheSportsDB's documented free API for live FIFA World Cup fixtures, scores, and status, plus Polymarket's public read-only API for market data. If a live provider is unavailable, the UI shows no data rather than substituting simulations. Forecast probabilities and backtest metrics remain unpublished until a real, calibrated production model passes rolling out-of-time validation.

## Local development

Requirements: Node.js 22+, npm 10+, Python 3.9+.

```bash
cp .env.example .env
npm install
python3 -m pip install -r apps/model-service/requirements.txt
npm run dev
```

In another terminal:

```bash
npm run model:dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/zh`.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run model:test
npm run build
```

## Database

Start PostgreSQL and Redis:

```bash
docker compose up -d postgres redis
npm run db:generate
npm run db:push
npm run db:seed
```

The public match centre works without a private key through TheSportsDB's documented free API. Private provider keys activate additional authorized adapters; they never enable simulated data as a live fallback.

## Full container deployment

```bash
docker compose up --build
```

Web: `http://localhost:3000`  
Model API: `http://localhost:8000/docs`

## Deployment

- **Vercel:** deploy the repository and set Root Directory to `apps/web`. Keep the model service on Railway, Render or Fly.io and configure `MODEL_SERVICE_URL`.
- **Railway:** deploy PostgreSQL, Redis and the model Dockerfile; deploy Web using `Dockerfile.web`.
- **Single host:** use `docker-compose.yml`.

Never expose provider tokens to the browser. All external calls with secrets belong in server routes or the worker.

## Data and model integrity

- Training and backtests must use `available_at <= prediction_cutoff`.
- Features, sources, model versions and predictions are immutable snapshots.
- Ensemble weights must be learned using rolling out-of-time predictions.
- Market backtests must use executable bid/ask prices, liquidity, fees and slippage.
- Published outcome probabilities are normalized and tested to sum to one.

## Compliance

This independent project is not affiliated with FIFA. It does not include FIFA marks or unlicensed team crests. All forecasts are uncertain, informational only, and not betting or investment advice. Users must follow local laws and age restrictions.

See [architecture](docs/architecture.md) and [literature notes](research/football_prediction_literature.md).
