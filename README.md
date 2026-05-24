# 🛒 Smart Grocery Management System

A full-stack multi-user grocery and expense tracking application with secure authentication, analytics dashboards, calendar-based tracking, and future AI integration.

🔗 Live Demo: https://smart-grocery-app-liard.vercel.app/

💻 Tech Stack:  
React • Vite • Node.js • Express • MongoDB • Mongoose • JWT • Recharts • Axios

---

## 👩‍💻 Development Approach

This project was developed using an AI-assisted workflow together with my own project planning, feature decisions, debugging process, and iterative improvements.

### My contribution included:

- Defining the complete project idea and requirements
- Designing application flow and user experience
- Planning dashboard behavior and feature interactions
- Structuring frontend and backend workflow
- Testing and debugging application behavior
- Deployment and project refinement
- Using prompt engineering to accelerate development and learning

### About implementation

This project was built as part of my learning journey.

AI tools were used as development assistants for implementation support and explanations, while I focused on understanding concepts, improving features, integrating components, and learning practical development workflows.

The goal was not only to build a working application, but also to understand how modern AI-assisted development workflows can be used effectively.

---

## 📚 Learning Note

This repository represents an AI-assisted learning project.

The focus was on:

- understanding project structure
- frontend-backend communication
- authentication workflow
- database integration
- deployment process
- practical development workflow

This project does not represent expertise in every technology used. It represents an ongoing learning process through real-world project building.

---

## What This Project Does

Smart Grocery Management is a full-stack grocery tracking application built with React, Vite, Express, and MongoDB.

It helps users:

- manage grocery items
- track daily and monthly expenses
- switch between household modes such as Family or Party
- review spending through calendar and chart-based views

The application supports real multi-user behavior.

Different users can:

- register
- log in later
- continue seeing only their own grocery records and expense history

The same authenticated user's data stays consistent across laptop and mobile logins because the dashboard reads from and writes to the backend database instead of device-specific local storage.

---

## Main Features

### 🔐 Authentication and User Access

- User registration with name, email, and password
- User login through backend API
- Passwords secured using `bcryptjs`
- JWT token generation after successful login
- Protected authenticated sessions
- Manual login required after registration
- Logout confirmation before session removal

---

### 🛒 Grocery Management

Users can:

- Add grocery items with:
  - Item name
  - Quantity
  - Unit
  - Price
  - Mode
  - Selected date

- Edit existing grocery items
- Delete grocery items
- View only their own authenticated data

---

### 📊 Dashboard and Analytics

Current household modes:

- Family
- Party
- Guest
- Festival

Features:

- Total selected-day expense tracking
- Total selected-month expense tracking
- Mode-wise expense pie chart
- Daily and monthly expense trend graphs
- Calendar-based date selection
- Item filtering by mode
- Calendar expense visualization

---

### 🎨 Interface and User Experience

- Responsive dashboard for desktop and mobile devices
- Refined light-mode interface
- Dedicated dark-mode support
- Dashboard-aligned login screen
- Clean user navigation flow
- Future AI integration route prepared

---

## 🤖 AI Integration Roadmap

Future AI-related features planned:

- AI suggested healthy food items
- Nutrition-aware grocery recommendations
- Healthier replacements for selected items
- Budget-friendly meal suggestions
- Recipe generation from purchased groceries
- Personalized recommendations

---

## ⚙️ Tech Stack

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

---

## 📁 Project Structure

```text
smart-grocery-app/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AIHealthyFood.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Login.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── Grocery.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── groceryRoutes.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
├── README.md
└── render.yaml
```

---

## 🔄 Authentication Flow

1. User registers using:
   - Name
   - Email
   - Password

2. Backend checks for existing user conflicts

3. Password gets hashed using `bcryptjs`

4. User data gets stored in MongoDB

5. User logs into the application

6. Backend verifies credentials

7. JWT token gets generated

8. Frontend stores:

```text
smartgrocery_token
smartgrocery_user
```

9. Protected APIs use:

```http
Authorization: Bearer <jwt_token>
```

10. Logout removes local session data

---

## 👥 Multi-User Behavior

This application behaves as a real multi-user system.

Features include:

- Different users can register independently
- Each authenticated user sees only their own data
- Expenses and charts remain user-specific
- Logging out one user does not affect another user's records
- Same user sees the same records across mobile and desktop devices
- Backend synchronizes data instead of relying on device storage

---

## 🔒 Grocery Data Ownership

Every grocery item is associated with the authenticated user.

This ensures:

- One user cannot access another user's grocery list
- One user cannot update another user's records
- One user cannot delete another user's items
- User data remains isolated and secure

---

## ⚙️ Environment Variables

Create actual `.env` files locally and never commit secrets to GitHub.

### Backend (`server/.env`)

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_secret
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## 🔐 About JWT_SECRET

`JWT_SECRET` is a private key used by the backend to sign and verify JWT authentication tokens.

Example:

```env
JWT_SECRET=smartgrocery_2026_auth_random_secret
```

Important rules:

- Never push it to GitHub
- Store it only in local `.env`
- Add it to deployment dashboards (Render/Vercel)
- Replace it immediately if exposed

---

## 🚀 Local Setup

### 1. Clone repository

```bash
git clone <your-repository-url>
cd smart-grocery-app
```

---

### 2. Install backend dependencies

```bash
cd server
npm install
```

---

### 3. Install frontend dependencies

```bash
cd client
npm install
```

---

### 4. Create environment files

Create:

```text
server/.env
client/.env
```

Copy values from:

```text
.env.example
```

and replace placeholders.

---

### 5. Run backend server

```bash
cd server
npm run dev
```

Default backend:

```text
http://localhost:5000
```

---

### 6. Run frontend

```bash
cd client
npm run dev
```

Default frontend:

```text
http://localhost:5173
```

---

## 🔌 API Overview

### Health Check Route

```http
GET /api/health
```

Expected response:

```json
{
   "status":"ok",
   "service":"smart-grocery-backend",
   "timestamp":"..."
}
```

---

## Authentication Routes

### Register User

```http
POST /api/auth/register
```

Request body:

```json
{
   "name":"Riya",
   "email":"riya@example.com",
   "password":"securePassword"
}
```

---

### Login User

```http
POST /api/auth/login
```

Request body:

```json
{
   "email":"riya@example.com",
   "password":"securePassword"
}
```

Response:

```json
{
   "token":"<jwt_token>",
   "user":{
      "id":"...",
      "name":"Riya",
      "email":"riya@example.com"
   }
}
```

---

## Grocery Routes

All grocery APIs require authentication:

```http
Authorization: Bearer <jwt_token>
```

### Get groceries

```http
GET /api/groceries
```

### Add grocery item

```http
POST /api/groceries
```

### Update grocery item

```http
PUT /api/groceries/:id
```

### Delete grocery item

```http
DELETE /api/groceries/:id
```

---

## 🌐 Deployment

Recommended deployment:

Frontend → Vercel

Backend → Render

### Vercel Configuration

Framework:

```text
Vite
```

Root directory:

```text
client
```

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Frontend environment variable:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

---

### Render Configuration

Root directory:

```text
server
```

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Health check path:

```http
/api/health
```

---

## 🔒 Security Notes

To keep the application secure:

- Do not expose MongoDB credentials publicly
- Do not expose JWT secrets publicly
- Store sensitive information only inside environment variables
- Never commit `.env` files to GitHub
- Rotate secrets immediately if exposed
- Keep production credentials only in deployment dashboards

---

## 🧪 Verification Commands

### Frontend

```bash
cd client
npm run lint
npm run build
```

### Backend Health Check

```http
GET /api/health
```

---

## ⚠️ Current Limitations

Current limitations of the project:

- AI assistant section is currently a placeholder
- Password reset functionality is not implemented yet
- Email verification flow is not available
- Profile editing functionality is not added
- Free Render deployments may become inactive after periods of inactivity

---

## 🚀 Future Work

Planned future improvements:

### AI Features

- AI suggested healthy food items
- Nutrition-aware grocery recommendations
- Healthier alternatives for selected products
- Budget-friendly meal recommendations
- Recipe generation from available groceries

### User Features

- User profile and settings page
- Password reset functionality
- Email verification system
- Shared family/group support
- Enhanced expense analytics
- Personalized recommendations

---

## 📌 Final Summary

This project currently includes:

✅ User registration and login system

✅ Password hashing using `bcryptjs`

✅ JWT authentication

✅ Protected backend routes

✅ User-specific grocery records

✅ Multi-user functionality

✅ Cross-device data consistency

✅ Expense analytics and charts

✅ Calendar integration

✅ Responsive UI for desktop and mobile

✅ Light and dark mode support

✅ Deployment-ready structure

✅ Future AI integration support

---

## 📖 Learning Journey Note

This repository is part of my learning journey and represents an AI-assisted development workflow.

The focus of this project was understanding:

- system design
- frontend-backend interaction
- authentication concepts
- database integration
- deployment workflow
- practical project building

AI tools were used as development assistants to support learning and implementation, while project planning, feature decisions, debugging, testing, and overall workflow understanding remained part of my learning process.
