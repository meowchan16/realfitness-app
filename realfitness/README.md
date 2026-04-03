# RealFitness

RealFitness is a website-first fitness tracker built with React on the frontend and Node.js on the backend.

## Why this project fits your React presentation

The client app already includes:

- JSX in every page and component
- reusable React components
- props plus PropTypes validation
- a class component with a constructor
- state with `useState`
- side effects with `useEffect`
- routing with `react-router-dom`
- component styling through a shared CSS file

The server app already includes:

- a Node.js + Express API
- a sample health route
- a sample "today's workout" route for future planner logic

## Project structure

```text
realfitness/
  client/    # React frontend with Vite
  server/    # Node.js + Express backend
```

## Install

From the project root:

```bash
npm run install:all
```

## Run the React app

```bash
npm run dev:client
```

## Run the Node.js server

```bash
npm run dev:server
```

## Current routes

Frontend:

- `/` login page
- `/dashboard-preview` dashboard preview

Backend:

- `GET /api/health`
- `GET /api/workout/today`

## React concepts shown in the code

- `client/src/components/FeatureCard.jsx`: reusable component with props
- `client/src/components/BenefitList.jsx`: list rendering from props
- `client/src/components/GoogleButton.jsx`: event handling with props
- `client/src/components/AuthTipCard.jsx`: class component using `constructor`, `state`, and lifecycle methods
- `client/src/pages/LoginPage.jsx`: `useState`, `useEffect`, routing with `useNavigate`
- `client/src/App.jsx`: route setup with `Routes` and `Route`

## Deployment options

- Frontend: Vercel or Netlify
- Backend: Render, Railway, or Cyclic

For your project demo, you can explain that the React frontend and Node backend are separated so the website can later become a mobile app using the same API.
