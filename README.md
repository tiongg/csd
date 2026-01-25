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
