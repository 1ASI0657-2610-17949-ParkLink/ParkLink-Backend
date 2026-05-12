# ParkLink Auth Service API

Servicio NestJS independiente dentro del monorepo `parklink-platform`.

## Puerto local

`http://localhost:3001`

## Swagger

`http://localhost:3001/docs`

## Health

`GET /health`

## Persistencia

Usa Prisma con DATABASE_URL apuntando a la base remota en VM.

## Variables de entorno

Copiar `.env.example` a `.env` y configurar valores reales. No commitear `.env`.

## Comandos Bun

```bash
bun run start:auth-service
bun run build:auth-service
bun run test:auth-service
```

## Vercel

Este servicio incluye `vercel.json` para deploy individual. Configurá las variables de entorno del servicio en Vercel antes de desplegar.
