# OrgContributions Dashboard

A modern dashboard application for tracking organizational contributions across products and teams.

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

Follow these steps to get started:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd work-glow-ui

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server with auto-reloading
npm run dev
```

The application will be available at `http://localhost:8080`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technologies

This project is built with:

- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **React** - UI framework
- **shadcn-ui** - UI component library
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching and caching

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/        # shadcn/ui components
│   └── [custom]   # Application-specific components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── lib/           # Utilities & mock data
└── types/         # TypeScript type definitions
```

## Features

- Role-based dashboards (CEO, HOD, Pod Lead, Employee)
- Product contribution tracking (Academy, Intensive, NIAT)
- Department and pod breakdowns
- Employee contribution details
- Interactive charts and visualizations
- Month-based filtering

## Deployment

Build the project for production:

```sh
npm run build
```

The `dist` folder will contain the production-ready files that can be deployed to any static hosting service.
