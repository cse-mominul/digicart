# DigiCart

A modern MERN stack e-commerce platform with a minimalist glassmorphism UI, modular architecture, BDT (৳) currency formatting, and practical inventory management workflows.

## Highlights

- **Modern UI:** Clean, responsive shopping experience with glassmorphism-inspired styling.
- **Modular Architecture:** Clear backend/frontend separation for easier maintenance and scaling.
- **BDT Currency Support:** Consistent product and cart price formatting in Bangladeshi Taka (৳).
- **Inventory Management:** Product stock tracking and admin-side management capabilities.

## Tech Stack

### Backend
- MongoDB
- Express.js
- Node.js
- Mongoose
- JWT Authentication

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router

## Project Structure

```text
DigiCart/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── seeder.js
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   └── pages/
    └── vite.config.js
```

## Installation

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd digicart
```

### 2) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3) Configure environment variables

Create a `.env` file inside `backend/` (see the next section for exact keys).

### 4) Run the backend

```bash
cd backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### 5) Run the frontend

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

## Environment Variables

Create this file:

- `backend/.env`

Recommended configuration:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/digicart
JWT_SECRET=your_super_secret_jwt_key
```

### Variable Notes
- `NODE_ENV`: App environment (`development`, `production`, etc.).
- `PORT`: Backend server port.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key used to sign authentication tokens.

## Useful Scripts

### Backend (`backend/package.json`)
- `npm run dev` — Start server with nodemon.
- `npm start` — Start server with Node.
- `npm run data:import` — Seed demo users/products.
- `npm run admin:create` — Create or update admin user.

### Frontend (`frontend/package.json`)
- `npm run dev` — Start Vite dev server.
- `npm run build` — Build production assets.
- `npm run preview` — Preview production build locally.

## API Base Path

The frontend uses `/api` as base path via Axios, and the backend serves:

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/admin`

## License

This project is for learning and portfolio use. Add your preferred license if needed.
