# The six seven

The Six Seven is a Learning Management System (LMS) designed to facilitate exploration into Gen Alpha Culture. It provides a platform for contributors to create and manage courses, and for students to access course material and quiz themselves. Moreover, trend visualization allows users to turn fragmented Gen-Alpha trend signals into structured, decision-ready intelligence.

## Tech Stack

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TanStack Router** - File-based routing
- **TanStack Query** - Data fetching and state management
- **Tailwind CSS** - Utility-first CSS framework
- **ShadCn/UI** - Accessible component primitives
- **Milkdown** - Plugin-driven WYSIWYG markdown editor framework
- **Y.js** - Real-time collaboration and CRDTs
- **D3.js** - Data visualization
- **Zod** - Schema validation

### Backend

- **Java 21+** - Runtime environment
- **Spring Boot** - Application framework
- **Spring Security** - Authentication and authorization
- **PostgreSQL** - Primary database
- **Flyway** - Database migration tool
- **Maven** - Dependency management and build tool

### Infrastructure

- **Docker Compose** - Container orchestration
- **MinIO** - S3-compatible object storage
- **Y-WebSocket** - Real-time collaboration server
- **PgAdmin** - PostgreSQL management interface

## Contributors

- [@tiongg](https://github.com/tiongg) - Tan Tiong Guan
- [@WyattLeoz](https://github.com/WyattLeoz) - Loh Kai Zhe
- [@lineonthepaper](https://github.com/lineonthepaper)
- [@Shutowith3e](https://github.com/Shutowith3e) - Joey Chik
- [@limweiyau](https://github.com/limweiyau) - Lim Wei Yau

---

# Setup

## Prerequisites

[Docker and Docker Compose](https://docs.docker.com/compose/install) installed.

Verify with:

```bash
docker compose --version
```

## Environment Variables

Copy the `.env.sample` file to `.env` and fill in the required values.

```bash
cp .env.sample .env
```

You'll now need a Google auth client. Follow the instructions at [docs/001.%20Google%20oauth%20setup.md](docs/001.%20Google%20oauth%20setup.md) to set this up.

## Running the Project

```bash
docker compose up
```

## Services

| Service  | URL                                                       |
| -------- | --------------------------------------------------------- |
| Frontend | http://localhost:3000                                     |
| Backend  | http://localhost:8080                                     |
| PgAdmin  | http://localhost:8888                                     |
| Postgres | `localhost:5432` (user: `postgres`, password: `password`) |

---

# Deployment

For more details on deployment, please refer to [docs/002.%20Deployment.md](docs/002.%20Deployment.md).

# Testing

For details regarding testing, please refer to [docs/003.%20Testing.md](docs/003.%20Testing.md).
