# CampusFix — MERN Stack Project
**College Facility Issue Reporting and Tracking System**

A beginner-friendly MERN project for reporting campus maintenance issues and tracking their status.

## Features
- Report an issue with title, description, location, and category
- View all reported issues
- Search issues and filter by category/status
- Update an issue's status
- Delete an issue
- Summary cards for total, open, in-progress, and resolved issues
- MongoDB persistence through an Express REST API
- Responsive React interface

## Technology
- MongoDB + Mongoose
- Express.js + Node.js
- React + Vite
- Plain CSS

## Requirements
Install Node.js (LTS) and have MongoDB running locally, or use a MongoDB Atlas connection string.

## Run the backend
Open a terminal:
```bash
cd backend
npm install
```
Create `backend/.env` using `.env.example` as a guide:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/campusfix
```
Then run:
```bash
npm run dev
```
Backend health check: http://localhost:5000/api/health

## Run the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually http://localhost:5173).

The frontend uses `http://localhost:5000/api/issues` by default. If your backend runs on another address, create `frontend/.env` based on `.env.example`.

## Main API routes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/issues` | List issues; supports `?search=`, `?status=`, `?category=` |
| GET | `/api/issues/:id` | Get one issue |
| POST | `/api/issues` | Create issue |
| PUT | `/api/issues/:id` | Update issue fields/status |
| DELETE | `/api/issues/:id` | Delete issue |
| GET | `/api/health` | API health check |

## MongoDB model
Each issue stores:
- `title`
- `description`
- `category`
- `location`
- `reporter`
- `status` (`Open`, `In Progress`, `Resolved`)
- `createdAt` and `updatedAt`

## Suggested viva explanation
1. React builds the user interface using reusable components and `useState`/`useEffect`.
2. The form is controlled by React state and validates required fields.
3. React calls the backend using `fetch`.
4. Express defines REST API routes using GET, POST, PUT, and DELETE.
5. Mongoose defines the Issue schema and communicates with MongoDB.
6. MongoDB stores issue reports as documents.

## Important
This is a starter academic project, not a production deployment. It intentionally does not include login, file uploads, email alerts, or role-based access so the core MERN flow stays easy to understand. Add these only if your instructor requires them.
