# ParkLink Maps Service API

Servicio NestJS independiente dentro del monorepo `parklink-platform`.

## Puerto local

`http://localhost:3007`

## Swagger

`http://localhost:3007/docs`

## Health

`GET /health`

## Persistencia

No usa base de datos.

## Google Maps APIs usadas

- Geocoding API: `GET /maps/geocode`
- Reverse Geocoding API: `GET /maps/reverse-geocode`
- Distance Matrix API: `GET /maps/distance`
- Directions API: `GET /maps/directions`
- Static Maps API: `GET /maps/static-map`

La API key se lee desde `GOOGLE_MAPS_API_KEY`; no se hardcodea ni se devuelve en JSON.

## Variables de entorno

Copiar `.env.example` a `.env` y configurar valores reales. No commitear `.env`.

## Comandos Bun

```bash
bun run start:maps-service
bun run build:maps-service
bun run test:maps-service
```

## Vercel

Este servicio incluye `vercel.json` para deploy individual. Configurá las variables de entorno del servicio en Vercel antes de desplegar.
