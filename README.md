# AI Interview Analyzer

AI-Integrated Interview Analyzer — a full-stack career preparation platform with resume analysis, AI-powered mock interviews, coding practice, voice analysis, job matching, and GitHub open-source recommendations.

## Project Structure

```
ai-interview-analyzer/
├── frontend/          # React + Vite frontend
├── backend/           # Express + Node.js backend
├── docker/            # Docker configurations
├── package.json       # Root workspace scripts
└── README.md
```

## Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Install all dependencies (root, frontend, backend)
npm run install:all
```

### Development

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run individually:
npm run dev:frontend    # Starts Vite dev server on :5173
npm run dev:backend     # Starts Express server on :3000
```

### Production Build

```bash
npm run build   # Builds the frontend
npm start       # Starts the backend server
```

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 6
- Bootstrap 5 + Tailwind CSS 4
- Lucide React Icons
- Motion (animations)

### Backend
- Express 4 + TypeScript
- Node.js Standard Library Crypto (PBKDF2, HMAC-SHA256)
- Cookie-based Authentication
- In-memory Data Store (ready for MongoDB)

## Architecture
- **Frontend**: SPA with state-based routing, context-based auth, modular component architecture
- **Backend**: RESTful API with controller → route → middleware pattern
- **Auth**: HttpOnly cookies + HMAC-SHA256 JWT tokens
