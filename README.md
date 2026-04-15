# Smart Grocery Management

Smart Grocery Management is a full-stack grocery tracking application built with React, Vite, Express, and MongoDB. It helps users manage grocery items, track daily and monthly expenses, switch between household modes such as Family or Party, and review spending through calendar and chart-based views.

The application now supports real multi-user behavior. Different users can register, log in later, and continue seeing only their own grocery records and expense history.

## What This Project Does

- lets users create their own account
- keeps login protected with hashed passwords and JWT authentication
- stores grocery records per authenticated user
- tracks item-level spending by date and by mode
- shows expense summaries, calendar highlights, pie chart distribution, and trend graphs
- provides a responsive dashboard for desktop and mobile

## Main Features

### Authentication and User Access

- user registration with name, email, and password
- user login through backend API
- passwords hashed with `bcryptjs`
- JWT token returned after successful login
- authenticated session stored on the frontend
- manual login required after registration
- logout confirmation before clearing the session

### Grocery Management

- add grocery items with:
  - item name
  - quantity
  - unit
  - price
  - mode
  - selected date
- edit existing grocery items
- delete grocery items
- see only the logged-in user's data

### Dashboard and Analysis

- current mode switching:
  - Family
  - Party
  - Guest
  - Festival
- total today expense
- total monthly expense
- mode-wise expense pie chart
- total expense trend graph
- calendar-based date selection
- item filtering by mode

### Interface and UX

- refined light-mode dashboard styling
- dedicated dark-mode styling with a professional palette
- mobile-friendly responsive layout
- premium-styled login screen aligned with the dashboard feel
- AI placeholder route ready for future work

## AI Placeholder

The AI section is currently a placeholder screen. It now clearly communicates:

`AI suggested healthy food items and recipes soon.`

This route is intentionally kept ready for future enhancement without changing the rest of the dashboard flow.

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Recharts
- React Calendar

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- dotenv
- cors

## Project Structure

```text
smart-grocery-app/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- pages/
|   |   |   |-- AIHealthyFood.jsx
|   |   |   |-- Home.jsx
|   |   |   `-- Login.jsx
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package.json
|   `-- vercel.json
|-- server/
|   |-- config/
|   |   `-- db.js
|   |-- middleware/
|   |   `-- authMiddleware.js
|   |-- models/
|   |   |-- Grocery.js
|   |   `-- User.js
|   |-- routes/
|   |   |-- authRoutes.js
|   |   `-- groceryRoutes.js
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- .gitignore
|-- README.md
`-- render.yaml
```

## Authentication Flow

1. A user registers with name, email, and password.
2. The backend checks for existing user conflicts.
3. The password is hashed using `bcryptjs`.
4. The backend stores the user in MongoDB.
5. Registration does not auto-login the user.
6. The user must manually log in after registration.
7. On login, the backend verifies credentials.
8. A JWT token is generated and returned.
9. The frontend stores:
   - `smartgrocery_token`
   - `smartgrocery_user`
10. All grocery APIs use the token in the `Authorization` header.
11. Logout asks for confirmation, then clears the local session.

## Multi-User Behavior

This app is designed to behave as a multi-user application.

- different users can register with different emails
- each authenticated user sees only their own grocery records
- expenses, items, charts, and calendar summaries are derived from that user's data only
- logging out one user does not merge their records with another user

## Grocery Data Ownership

Each grocery record is linked to the authenticated user on the backend.

This means:

- one user cannot fetch another user's grocery list
- one user cannot update another user's grocery item
- one user cannot delete another user's grocery item

## Environment Variables

Create real `.env` files locally. Do not commit secrets.

### Backend: `server/.env`

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
```

### Frontend: `client/.env`

```env
VITE_API_URL=http://localhost:5000
```

## What `JWT_SECRET` Means

`JWT_SECRET` is the private key used by the backend to sign and verify JWT tokens.

Use a long random string, for example:

```env
JWT_SECRET=smartgrocery_2026_auth_X7m!9qLp@4zRt#8nVk2sHd5wB1cYe
```

Rules:

- never commit it to GitHub
- keep it in local `.env` and deployment dashboards only
- if it gets exposed, replace it immediately

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd smart-grocery-app
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Create environment files

- create `server/.env`
- create `client/.env`
- copy values from the `.env.example` files and replace placeholders

### 5. Run the backend

```bash
cd server
npm run dev
```

Backend default URL:

```text
http://localhost:5000
```

### 6. Run the frontend

```bash
cd client
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

## API Overview

### Health Check

```http
GET /api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "smart-grocery-backend",
  "timestamp": "..."
}
```

### Auth Routes

#### Register

```http
POST /api/auth/register
```

Request body:

```json
{
  "name": "Riya",
  "email": "riya@example.com",
  "password": "securePassword"
}
```

#### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "riya@example.com",
  "password": "securePassword"
}
```

Response shape:

```json
{
  "token": "<jwt_token>",
  "user": {
    "_id": "...",
    "name": "Riya",
    "email": "riya@example.com"
  }
}
```

### Grocery Routes

All grocery routes require:

```http
Authorization: Bearer <jwt_token>
```

#### Get current user's groceries

```http
GET /api/groceries
```

#### Add grocery item

```http
POST /api/groceries
```

#### Update grocery item

```http
PUT /api/groceries/:id
```

#### Delete grocery item

```http
DELETE /api/groceries/:id
```

## UI Behavior Notes

- registration keeps the user on the auth screen
- after successful registration, the user must log in manually
- logout asks for confirmation before clearing the session
- the home dashboard is styled primarily for light mode
- dark mode uses a calmer professional treatment
- the login page has been visually aligned with the dashboard style
- the AI page is intentionally a placeholder for future work

## Deployment

Recommended deployment:

- frontend on Vercel
- backend on Render

## Deploy Frontend on Vercel

Use the `client` folder as the project root.

Recommended Vercel settings:

- Framework Preset: `Vite`
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Frontend environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

The repo already includes:

- `client/vercel.json`

## Deploy Backend on Render

Use the repo root blueprint or configure a manual Node web service.

Recommended backend settings:

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

Required Render environment variables:

```env
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=https://your-vercel-frontend-url.vercel.app
JWT_SECRET=replace_with_a_long_random_secret
```

The repo already includes:

- `render.yaml`

## Security Notes

- do not expose MongoDB usernames or passwords publicly
- do not expose JWT secrets publicly
- if any secret is leaked, rotate it immediately
- keep production secrets only in Render or Vercel environment settings

## Verification Commands

### Frontend

```bash
cd client
npm run lint
npm run build
```

### Backend sanity check

```text
GET /api/health
```

## Current Limitations

- the AI assistant route is only a placeholder
- no password reset flow yet
- no email verification flow yet
- no profile editing page yet
- old grocery records created before strict user ownership changes may require migration
- free Render deployments can sleep after inactivity

## Future Work

- AI suggested healthy food items and recipes
- nutrition-aware grocery suggestions
- healthier replacements for selected items
- budget-friendly meal recommendations
- recipe generation from purchased items
- user profile and settings page
- password reset functionality
- email verification
- enhanced analytics and spending insights
- family or shared group support

## Final Summary

This project now includes:

- real registration and login APIs
- hashed passwords
- JWT authentication
- protected grocery routes
- user-specific grocery and expense records
- responsive UI for desktop and mobile
- light and dark theme support
- deployment-ready frontend and backend structure
- a clear placeholder path for future AI suggestions
