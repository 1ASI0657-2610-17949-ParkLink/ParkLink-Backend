# ParkLink Platform Backend Microservices Monorepo

Monorepo backend de ParkLink compuesto por microservicios reales y un API Gateway independiente.

## Arquitectura

- Cada dominio está separado en un microservicio NestJS independiente.
- `apps/` contiene los microservicios de negocio; `api-gateway/` vive fuera de `apps/` porque es una aplicación de borde/entrada independiente.
- El API Gateway es la entrada principal para el frontend y no contiene lógica de negocio.
- Cada microservicio puede correr y desplegarse por separado.
- La base de datos está alojada en una VM y se accede mediante `DATABASE_URL`.
- Google Maps se integra exclusivamente mediante `maps-service` usando Adapter Pattern para geocoding, reverse geocoding, distancia, rutas/directions e imagen estática de mapa.
- Bun se usa como runtime/package manager operativo del monorepo.
- En esta primera versión se permite una base compartida en VM; en una evolución real cada microservicio debería tener su propia base de datos independiente.

```text
Frontend
  ↓
API Gateway - Vercel
  ↓
Microservices - Vercel
  ├── Auth Service
  ├── Users Service
  ├── Parking Service
  ├── Reservation Service
  ├── Payment Service
  ├── Notification Service
  └── Maps Service
        ↓
Google Maps API

Services with persistence
  ↓
Database in VM
```

## Instalación

Requisitos de runtime:

- Bun `>=1.3.11`.
- Node compatible con Prisma 7: `20.19+`, `22.12+` o `24+`. Recomendado: Node `22.12.0` LTS (`.node-version`).

```bash
bun install
```

## Ejecución local

```bash
bun run start:api-gateway
bun run start:auth-service
bun run start:users-service
bun run start:parking-service
bun run start:reservation-service
bun run start:payment-service
bun run start:notification-service
bun run start:maps-service
```

## Build

```bash
bun run build:api-gateway
bun run build:auth-service
bun run build:users-service
bun run build:parking-service
bun run build:reservation-service
bun run build:payment-service
bun run build:notification-service
bun run build:maps-service
```

## Testing

```bash
bun run test
```

Servicios individuales:

```bash
bun run test:auth-service
bun run test:users-service
bun run test:parking-service
bun run test:reservation-service
bun run test:payment-service
bun run test:notification-service
bun run test:maps-service
```

## Variables de entorno

Cada microservicio tiene su propio `.env.example` en `apps/<service>/.env.example`; el Gateway lo tiene en `api-gateway/.env.example`.

### api-gateway

```env
PORT=3000
AUTH_SERVICE_URL="http://localhost:3001"
USERS_SERVICE_URL="http://localhost:3002"
PARKING_SERVICE_URL="http://localhost:3003"
RESERVATION_SERVICE_URL="http://localhost:3004"
PAYMENT_SERVICE_URL="http://localhost:3005"
NOTIFICATION_SERVICE_URL="http://localhost:3006"
MAPS_SERVICE_URL="http://localhost:3007"
NODE_ENV="development"
```

### auth-service

```env
PORT=3001
DATABASE_URL="mysql://USER:PASSWORD@VM_PUBLIC_IP:3306/parklink_db"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="1d"
NODE_ENV="development"
```

### users-service

```env
PORT=3002
DATABASE_URL="mysql://USER:PASSWORD@VM_PUBLIC_IP:3306/parklink_db"
JWT_SECRET="change_this_secret"
NODE_ENV="development"
```

### parking-service

```env
PORT=3003
DATABASE_URL="mysql://USER:PASSWORD@VM_PUBLIC_IP:3306/parklink_db"
MAPS_SERVICE_URL="http://localhost:3007"
JWT_SECRET="change_this_secret"
NODE_ENV="development"
```

### reservation-service

```env
PORT=3004
DATABASE_URL="mysql://USER:PASSWORD@VM_PUBLIC_IP:3306/parklink_db"
PARKING_SERVICE_URL="http://localhost:3003"
PAYMENT_SERVICE_URL="http://localhost:3005"
NOTIFICATION_SERVICE_URL="http://localhost:3006"
JWT_SECRET="change_this_secret"
NODE_ENV="development"
```

### payment-service

```env
PORT=3005
DATABASE_URL="mysql://USER:PASSWORD@VM_PUBLIC_IP:3306/parklink_db"
RESERVATION_SERVICE_URL="http://localhost:3004"
NOTIFICATION_SERVICE_URL="http://localhost:3006"
JWT_SECRET="change_this_secret"
NODE_ENV="development"
```

### notification-service

```env
PORT=3006
DATABASE_URL="mysql://USER:PASSWORD@VM_PUBLIC_IP:3306/parklink_db"
JWT_SECRET="change_this_secret"
NODE_ENV="development"
```

### maps-service

```env
PORT=3007
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
# Enable these Google APIs for this key: Geocoding API, Distance Matrix API, Directions API, Static Maps API.
# If a future frontend renders an interactive map, use a separate browser-restricted Maps JavaScript API key.
NODE_ENV="development"
```

Endpoints Maps principales:

- `GET /maps/geocode`
- `GET /maps/reverse-geocode`
- `GET /maps/distance`
- `GET /maps/directions`
- `GET /maps/static-map`

## Prisma

Prisma 7 usa `prisma.config.ts` por servicio y genera clientes separados por microservicio.

Generar clientes:

```bash
bun run prisma:generate
```

Sincronizar la base local compartida MySQL con todos los modelos del MVP:

```bash
bun run db:push:local
```

Esto usa `prisma/local/schema.prisma` como esquema consolidado solo para desarrollo local. No uses `db push` servicio por servicio contra una base compartida porque cada schema conoce solo su bounded context y puede borrar tablas de otros servicios. Sí, ese es el tipo de quilombo que pasa cuando uno mezcla microservicios con una sola DB compartida.

Migraciones por servicio:

```bash
bun run prisma:migrate:dev:auth-service
bun run prisma:migrate:dev:users-service
bun run prisma:migrate:dev:parking-service
bun run prisma:migrate:dev:reservation-service
bun run prisma:migrate:dev:payment-service
bun run prisma:migrate:dev:notification-service
```

En Vercel/producción usá los scripts `prisma:migrate:deploy:<service>` contra la VM ya configurada.

Ojo: como primera versión puede compartir una DB en VM. En microservicios reales maduros, cada servicio debería evolucionar hacia una base propia para evitar acoplamiento de datos.

## Swagger

- http://localhost:3000/docs
- http://localhost:3001/docs
- http://localhost:3002/docs
- http://localhost:3003/docs
- http://localhost:3004/docs
- http://localhost:3005/docs
- http://localhost:3006/docs
- http://localhost:3007/docs

## Deployment en Vercel

Orden sugerido:

1. Desplegar `auth-service`.
2. Desplegar `users-service`.
3. Desplegar `maps-service`.
4. Desplegar `parking-service`.
5. Desplegar `reservation-service`.
6. Desplegar `payment-service`.
7. Desplegar `notification-service`.
8. Configurar las URLs públicas de todos los servicios en `api-gateway`.
9. Desplegar `api-gateway`.
10. Usar la URL pública del `api-gateway` como entrada principal del frontend.

Ejemplo:

```env
AUTH_SERVICE_URL=https://parklink-auth-service.vercel.app
USERS_SERVICE_URL=https://parklink-users-service.vercel.app
PARKING_SERVICE_URL=https://parklink-parking-service.vercel.app
RESERVATION_SERVICE_URL=https://parklink-reservation-service.vercel.app
PAYMENT_SERVICE_URL=https://parklink-payment-service.vercel.app
NOTIFICATION_SERVICE_URL=https://parklink-notification-service.vercel.app
MAPS_SERVICE_URL=https://parklink-maps-service.vercel.app
```

## API Gateway

El Gateway reenvía:

- Headers, incluido `Authorization`.
- Query params.
- Body.
- Método HTTP.

Rutas:

- `/auth/*` → `AUTH_SERVICE_URL`
- `/users/*` → `USERS_SERVICE_URL`
- `/parking-spaces/*` → `PARKING_SERVICE_URL`
- `/reservations/*` → `RESERVATION_SERVICE_URL`
- `/payments/*` → `PAYMENT_SERVICE_URL`
- `/notifications/*` → `NOTIFICATION_SERVICE_URL`
- `/maps/*` → `MAPS_SERVICE_URL`
