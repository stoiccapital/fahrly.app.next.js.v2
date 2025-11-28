# Fahrly v2

Next.js App Router application for fleet and driver management.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Local Build Check

Before deploying, verify the project builds successfully:

```bash
# Install dependencies
npm install

# Run linter (if applicable)
npm run lint

# Build for production
npm run build
```

If the build succeeds, you're ready to deploy. If you encounter errors, fix them before proceeding with deployment.

### Production

```bash
npm run build
npm start
```

## Project Structure

- `app/` - Next.js App Router pages and components
- `lib/` - Shared utilities and mocks
- `store/` - Zustand state management
- `app/components/shared/` - Reusable UI components

## Deployment

See [docs/deployment-vercel.md](./docs/deployment-vercel.md) for detailed Vercel deployment instructions.

