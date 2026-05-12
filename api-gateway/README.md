# ParkLink API Gateway

Servicio NestJS independiente dentro del monorepo `parklink-platform`.

## Puerto local

`http://localhost:3000`

## Swagger

`http://localhost:3000/docs`

## Health

`GET /health`

## Persistencia

No usa base de datos.

## Variables de entorno

Copiar `.env.example` a `.env` y configurar valores reales. No commitear `.env`.

## Comandos Bun

```bash
bun run start:api-gateway
bun run build:api-gateway
bun run test:api-gateway
```

## Vercel

Este servicio incluye `vercel.json` para deploy individual. Configurá las variables de entorno del servicio en Vercel antes de desplegar.
