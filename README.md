# Vehicle Telemetry Visualization

A fleet monitoring dashboard built with React, Vite, and TypeScript, with a lightweight backend workspace for future telemetry API work.

## Features

- Fleet dashboard with KPI cards, filters, vehicle list, and map view
- Vehicle detail navigation
- Responsive layout for dashboard views
- Mock telemetry and alert data for local development

## Project Structure

- `frontend/` – React + Vite dashboard application
- `backend/` – TypeScript backend workspace
- `shared/` – shared type definitions

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The frontend will start on a local Vite port (commonly `5173` or the next available port).

## Build

```bash
npm run build
```

## Scripts

- `npm run dev` – start the frontend development server
- `npm run build` – build the frontend and backend
- `npm run lint` – lint frontend and backend code
- `npm run type-check` – run TypeScript type checking

## Notes

This repository currently contains mock telemetry and alert data for local UI development.
