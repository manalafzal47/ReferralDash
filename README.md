# Referral OS

Referral OS is an AI-assisted outreach workspace for students and job seekers. It helps users find potential referral contacts, research them, write personalized messages, and track conversations through to referrals and interviews.

## Project Structure

This repository contains two applications:

### Frontend: `src/`

The frontend is a Lovable-generated React application using:

- React 19
- TanStack Start and TanStack Router
- TanStack Query for API caching
- Vite
- Tailwind CSS and Radix UI components
- Recharts for analytics

The frontend owns the user experience:

- Dashboard
- Campaign creation and campaign list
- Candidate discovery and candidate profiles
- Message review and editing
- Outreach pipeline
- Analytics views
- User settings

The campaigns screen is connected to the backend. It reads campaigns from `GET /api/campaigns` and creates campaigns through `POST /api/campaigns`. Other screens still contain prototype data in `src/data/outreach.ts` and will be connected incrementally.

### Backend: `backend/apps/api/`

The backend is a FastAPI application using:

- Python 3.11+
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic settings and schemas

The backend owns persistence and business operations:

- Campaigns and companies
- Candidates and candidate facts
- Match scoring
- Generated messages
- Outreach events
- Follow-ups and responses
- Campaign analytics

The API is mounted under `/api`. Current endpoints include health checks, campaign creation/listing, candidate intake/listing, candidate scoring, message generation, marking messages as sent, and campaign analytics.

## Product Flow

```text
Create campaign -> Find candidates -> Research and score -> Generate message -> Review -> Contact -> Track replies and referrals
```

## Local Development

### Frontend

From the repository root:

```powershell
npm install --no-package-lock
npm run dev
```

The project normally uses Bun, so `bun install` and `bun run dev` are also supported when Bun is installed. Open <http://localhost:5173>.

Frontend checks:

```powershell
npm run lint
npm run build
```

### Backend

The backend requires PostgreSQL. Docker is optional; PostgreSQL can be installed and run as a local Windows service.

From the API directory:

```powershell
cd backend/apps/api
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

The API runs at <http://localhost:8000>. Interactive API documentation is available at <http://localhost:8000/docs>.

Backend checks:

```powershell
pytest
```

Smoke-test the running API:

```powershell
curl http://localhost:8000/api/health
curl http://localhost:8000/api/campaigns
```

## Running Both Applications

Use two terminals.

Terminal 1, from `backend/apps/api`:

```powershell
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Terminal 2, from the repository root:

```powershell
npm run dev
```

The frontend uses `VITE_API_URL` when it is set. Otherwise it defaults to `http://localhost:8000/api`.

## Database

The initial schema is in:

```text
backend/apps/api/migrations/versions/0001_initial_schema.py
```

Apply it with:

```powershell
cd backend/apps/api
alembic upgrade head
```

The backend currently uses PostgreSQL-specific column types, so SQLite is not a drop-in replacement.

## Next Integration Work

The next frontend/backend slices are:

1. Add campaign summary counts for the dashboard and campaign cards.
2. Connect candidate list and candidate detail pages.
3. Persist message edits and regeneration.
4. Add pipeline status updates and follow-up endpoints.
5. Replace hard-coded analytics with backend aggregates.
6. Add authentication and user-level data ownership.

Best Connection Types

Design Requirements

Use:

TypeScript

React

Tailwind CSS

shadcn/ui components

Design should be:

clean

professional

minimal

recruiter/productivity focused

responsive

Avoid:

flashy gradients

excessive animations

clutter

The feeling should be:

"An AI career operating system."

Create reusable components.

Use realistic sample data.

Focus on excellent UX.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://career-muse-dash.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/26e42559-5ec9-4480-9a76-fbb10734d551).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
