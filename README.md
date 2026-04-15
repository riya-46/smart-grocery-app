# Smart Grocery Management

MERN-based grocery expense tracker with:
- mode-wise grocery entries
- calendar-based filtering
- daily/monthly expense summaries
- pie and trend charts
- responsive light and dark UI

## Project Structure

- `client/` - React + Vite frontend
- `server/` - Express + MongoDB backend

## Environment Setup

Create these files before running locally:

1. `server/.env`
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
```

2. `client/.env`
```env
VITE_API_URL=http://localhost:5000
```

## Local Development

Frontend:
```bash
cd client
npm install
npm run dev
```

Backend:
```bash
cd server
npm install
npm run dev
```

## Production Notes

- Frontend reads API base URL from `VITE_API_URL`.
- Backend exposes health check at `/api/health`.
- Backend CORS uses `CLIENT_URL` and accepts comma-separated origins.
- If frontend and backend are deployed on different domains, set both env files correctly before deployment.

## Recommended Deployment

- Frontend: Vercel
- Backend: Render

### Vercel Frontend

Use the `client/` folder as the project root.

- Framework preset: `Vite`
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://your-render-backend-url.onrender.com`

`client/vercel.json` is already added for React Router SPA rewrites.

### Render Backend

Use the included `render.yaml` blueprint from the repo root, or create a web service manually with:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Required Render environment variables:

- `MONGO_URI`
- `CLIENT_URL=https://your-vercel-frontend-url.vercel.app`
