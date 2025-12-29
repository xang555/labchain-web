# LAB Chain Website

Official website for LAB Chain with admin panel for managing network data (RPC Endpoints, Boot Nodes, Beacon Nodes).

## Chain Details

| Property | Value |
|----------|-------|
| Chain ID | 5222 |
| Primary RPC | https://rpc.labchain.la |
| Explorer | https://explorer.labchain.la |

## Features

- **Public Pages**: RPC endpoints, Boot nodes, Beacon nodes listings with search and pagination
- **Admin Panel**: CRUD operations for managing network data
- **Community Submissions**: Users can submit nodes for review
- **Theme Support**: Light and dark mode
- **SQLite Database**: Lightweight data storage with WAL mode

## Tech Stack

- [Astro](https://astro.build) - Web framework
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite database
- Node.js adapter for SSR

## Project Structure

```
src/
├── components/        # Reusable components (Header, Footer, Logo, etc.)
├── layouts/           # Page layouts (Layout, AdminLayout)
├── lib/               # Database, auth, and data utilities
├── pages/             # All routes
│   ├── admin/         # Admin panel pages
│   └── community/     # Community submission pages
└── styles/            # Global CSS

public/
├── favicon.svg        # Browser favicon
└── icon.svg           # Full-size logo

data/
└── labchain.db        # SQLite database (auto-created)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### Production

```bash
# Build for production
yarn build

# Start production server
node dist/server/entry.mjs
```

### Docker Deployment

```bash
# Build and start container
docker-compose up -d --build

# View logs
docker-compose logs -f labchain-web

# Stop container
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

#### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `4321` | Server port |
| `DATA_DIR` | `/app/data` | SQLite database directory |

## Commands

| Command | Action |
|---------|--------|
| `yarn install` | Install dependencies |
| `yarn dev` | Start dev server at `localhost:4321` |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build |

## Admin Setup

1. Navigate to `/admin/login`
2. On first visit, create an admin account
3. Login to access the admin panel

## Environment

The database is automatically created at `data/labchain.db` on first run.

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

You are free to:
- **Share** — copy and redistribute the material
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit
- **NonCommercial** — You may not use the material for commercial purposes

See [LICENSE](./LICENSE) for full details.

For commercial licensing inquiries: xang.ultimate@gmail.com
