# SecureAuth

A modern, Vercel-ready authentication system built with the MERN stack. Features a beautiful dark-themed UI inspired by Vercel's design language.

## Features

- 🔐 **Secure Authentication** - JWT-based auth with HttpOnly cookies
- 🎨 **Vercel-inspired Dark Theme** - Beautiful, accessible UI with CSS custom properties
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop
- ⚡ **Optimized for Vercel** - Serverless functions, edge-ready
- 🔒 **Password Security** - bcrypt hashing with configurable rounds
- ✅ **Form Validation** - Client & server-side with Zod
- 🎯 **TypeScript-ready** - JSDoc types for better DX
- ♿ **Accessible** - WCAG AA compliant, proper ARIA attributes

## Tech Stack

- **Frontend**: React 18 + Vite + React Router
- **Backend**: Node.js + Express (Vercel Serverless Functions)
- **Database**: MongoDB (Atlas recommended)
- **Styling**: Pure CSS with Custom Properties (no framework)
- **Validation**: Zod
- **Auth**: JWT + bcryptjs

## Project Structure

```
secureauth/
├── client/                 # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components (Toast, etc.)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── lib/            # Utilities (API client)
│   │   ├── pages/          # Page components
│   │   ├── styles/         # Global & component styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── api/                    # Vercel Serverless Functions
│   ├── auth/               # Auth endpoints
│   │   ├── signup.js
│   │   ├── login.js
│   │   ├── logout.js
│   │   ├── me.js
│   │   ├── forgot-password.js
│   │   └── reset-password.js
│   ├── lib/                # Shared utilities
│   │   ├── mongodb.js
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── response.js
│   └── package.json
├── vercel.json             # Vercel configuration
├── package.json            # Root workspace config
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Vercel CLI (for deployment)

### Installation

1. Clone and install dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

3. Start development servers:
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173
- API: http://localhost:3000 (via Vercel CLI)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB` | Database name (default: secureauth) | No |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) | Yes |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) | No |
| `BCRYPT_ROUNDS` | Bcrypt cost factor (default: 12) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/secureauth.git
git push -u origin main
```

### 2. Import in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite + API structure

### 3. Configure Environment Variables

In Vercel project settings, add:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` |
| `BCRYPT_ROUNDS` | `12` |
| `NODE_ENV` | `production` |

### 4. Deploy

Vercel will automatically build and deploy. Your app will be live at `https://your-project.vercel.app`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Sign in user |
| `POST` | `/api/auth/logout` | Sign out user |
| `GET` | `/api/auth/me` | Get current user |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset password with token |

## Scripts

```bash
# Development
npm run dev              # Start both client & API
npm run dev:client       # Start only Vite dev server
npm run dev:api          # Start only Vercel dev server

# Building
npm run build            # Build all workspaces
npm run build:client     # Build client for production
npm run build:api        # Build API (no-op for serverless)

# Production preview
npm run preview          # Preview client build
```

## Security Considerations

- Passwords hashed with bcrypt (configurable rounds)
- JWT stored in HttpOnly, Secure, SameSite=Lax cookies
- CORS configured for your domain
- Input validation on all endpoints
- Rate limiting recommended (add via Vercel Edge Middleware)

## Customization

### Theme Colors

Edit CSS custom properties in `client/src/styles/global.css`:

```css
:root {
  --accent-primary: #22d3ee;    /* Primary accent (cyan) */
  --accent-secondary: #06b6d4;  /* Secondary accent */
  --bg-primary: #030712;        /* Main background */
  --bg-card: #0f172a;           /* Card background */
  /* ... more variables */
}
```

### Adding Pages

1. Create component in `client/src/pages/`
2. Add route in `client/src/App.jsx`
3. Update navigation as needed

## License

MIT