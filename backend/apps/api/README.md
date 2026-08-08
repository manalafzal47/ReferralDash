# AI Job Outreach API

FastAPI backend for the AI Job Outreach Assistant.

## Local Setup

```bash
cd backend/apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
copy .env.example .env
cd ..\..\infra
docker compose up -d postgres
cd ..\apps\api
alembic upgrade head
uvicorn app.main:app --reload
```

The API exposes health checks, campaign management, manual candidate intake, candidate scoring, message drafting, outreach tracking, and campaign analytics.

## Testing the Backend

Start PostgreSQL before starting the API:

```bash
cd backend/infra
docker compose up -d postgres
```

Apply migrations from `backend/apps/api`:

```bash
alembic upgrade head
```

Start the API from `backend/apps/api`:

```bash
uvicorn app.main:app --reload
```

Then verify it in another terminal:

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/campaigns
```

The interactive API tester is available at <http://localhost:8000/docs>.

Run backend tests from `backend/apps/api`:

```bash
pytest
```

## Testing the Frontend

Install the frontend dependencies from the repository root and start Vite:

```bash
cd ..\..\..
bun install
bun run dev
```

Open <http://localhost:5173>. The frontend currently renders its demo data from `src/data/outreach.ts`; the API integration will replace that data incrementally. Keep the FastAPI process running on port `8000` while testing connected frontend flows.

Useful frontend checks are:

```bash
bun run lint
bun run build
```
