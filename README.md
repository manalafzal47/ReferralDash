# Referral OS

Referral OS helps job seekers find the strongest people in their personal network to ask for a referral. Users create an account, import connections, filter by target company and role, and review ranked warm leads.

## The Problem

Job seekers often search LinkedIn one person at a time, without knowing who in their existing network is most likely to help. Generic outreach is easy to ignore, and keeping track of conversations is difficult.

## The Solution

Referral OS turns a personal network into a focused referral workflow:

1. Create an account and sign in.
2. Import connections manually or through the configured LinkedIn MCP integration.
3. Enter a target company and role.
4. Review warm leads ranked by relationship strength and role/company fit.
5. Use the connection details to make a specific referral request.

## Current Features

- Account registration and login
- Authenticated user sessions with sign out
- User-owned connection imports
- Warm-lead ranking based on relationship, company, and role fit
- LinkedIn MCP search integration when Agent Reach is configured
- Dashboard and settings pages backed by the signed-in user

## Tech Stack

- Frontend: React, TypeScript, TanStack Start/Router, TanStack Query, Vite, Tailwind CSS
- Backend: Python, FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Integrations: Agent Reach and `mcporter` for LinkedIn MCP access

## How To Run

### 1. Start the backend

From the repository root, open a terminal:

```powershell
cd backend/apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
copy .env.example .env
```

Start PostgreSQL, then apply migrations and run the API:

```powershell
cd ..\..\infra
docker compose up -d postgres
cd ..\apps\api
alembic upgrade head
uvicorn app.main:app --reload
```

The API runs at <http://localhost:8000>. API documentation is available at <http://localhost:8000/docs>.

### 2. Start the frontend

In a second terminal from the repository root:

```powershell
npm install --no-package-lock
npm run dev
```

Open <http://localhost:5173>. The frontend uses `http://localhost:8000/api` by default. Set `VITE_API_URL` when the API runs elsewhere.

## LinkedIn Setup

The LinkedIn button does not create a LinkedIn account or collect credentials inside Referral OS. It calls the locally configured Agent Reach LinkedIn MCP. Configure that integration separately:

```powershell
uvx mcp-server-linkedin@latest --login
mcporter config add linkedin --command uvx --arg mcp-server-linkedin@latest --scope home
```

If LinkedIn MCP is not configured, use the manual connection import flow. The app ranks imported connections, but it does not bypass LinkedIn access controls or automatically retrieve a complete private connection list.

## Validation

Frontend checks from the repository root:

```powershell
npm run lint
npm run build
```

Backend tests from `backend/apps/api`:

```powershell
pytest
```

Health check:

```powershell
curl http://localhost:8000/api/health
```

## Project Structure

```text
src/                    React frontend and routes
backend/apps/api/app/   FastAPI application
backend/apps/api/tests/ Backend tests
Agent-Reach/            Local Agent Reach integration source
```

## Known Limitations

- LinkedIn authentication is handled by the local MCP setup, not by an in-app OAuth screen.
- The current referral request and messaging experience is still being built.
- PostgreSQL is the intended local and production database.
