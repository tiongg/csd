Run migrations

```
docker compose --profile flyway run --rm flyway
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
