Run migrations

```
docker compose run --rm flyway-manual migrate \
  -url=jdbc:postgresql://db:5432/postgres \
  -user=postgres \
  -password=password
```

Installing packages on FE

```
docker compose exec frontend npm install
```

Adding shadcn packages

```
docker compose exec frontend npx shadcn@latest add input
```

Regenerating API types

```
docker compose exec frontend npm run generate-api
```

Testing docker image

```
docker run \
  -e JOOQ_JDBC_URL=jdbc:postgresql://db:5432/postgres \
  -e JOOQ_JDBC_USER=postgres \
  -e JOOQ_JDBC_PASSWORD=password \
  -e FRONTEND_URL=http://localhost:3000 \
  -p 8080:8080 \
  ghcr.io/tiongg/csd/backend
```
