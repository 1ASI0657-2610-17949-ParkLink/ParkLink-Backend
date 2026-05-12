# ParkLink Users Service API

Servicio NestJS independiente dentro del monorepo `parklink-platform`.

## Puerto local

`http://localhost:3002`

## Swagger

`http://localhost:3002/docs`

## Health

`GET /health`

## Persistencia

Usa Prisma con DATABASE_URL apuntando a la base remota en VM.

## Variables de entorno

Copiar `.env.example` a `.env` y configurar valores reales. No commitear `.env`.

## Comandos Bun

```bash
bun run start:users-service
bun run build:users-service
bun run test:users-service
```

## Vercel

Este servicio incluye `vercel.json` para deploy individual. Configurá las variables de entorno del servicio en Vercel antes de desplegar.
