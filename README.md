# Setup

## Prerequisites

[Docker and Docker Compose](https://docs.docker.com/compose/install) installed.

Verify with:

```bash
docker compose --version
```

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
