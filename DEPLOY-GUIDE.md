# 🅿️ ParkLink — Guía Completa de Despliegue del Backend

> **Fecha:** Junio 2026  
> **Repositorio:** `https://github.com/1ASI0657-2610-17949-ParkLink/ParkLink-Backend`  
> **Team Vercel:** `maximoff19s-projects` (ID: `team_IxXwaiePaFZYxZIyYaUj1jjY`)  
> **Render API Key:** almacenar solo en un secret manager o variable de entorno local (`RENDER_API_KEY`). No versionar claves reales.

---

## 📋 Índice

1. [Arquitectura del Backend](#1-arquitectura-del-backend)
2. [Qué está desplegado actualmente en Vercel](#2-qué-está-desplegado-actualmente-en-vercel)
3. [Requisitos previos](#3-requisitos-previos)
4. [Paso 1: Crear la base de datos PostgreSQL en Render](#4-paso-1-crear-la-base-de-datos-postgresql-en-render)
5. [Paso 2: Conectar Render con Vercel](#5-paso-2-conectar-render-con-vercel)
6. [Paso 3: Desplegar el Backend en Vercel](#6-paso-3-desplegar-el-backend-en-vercel)
7. [Paso 4: Desplegar el API Gateway en Vercel](#7-paso-4-desplegar-el-api-gateway-en-vercel)
8. [Paso 5: Verificar el despliegue](#8-paso-5-verificar-el-despliegue)
9. [Variables de entorno — Resumen](#9-variables-de-entorno--resumen)
10. [Solución de problemas comunes](#10-solución-de-problemas-comunes)
11. [Mantenimiento](#11-mantenimiento)

---

## 1. Arquitectura del Backend

```
ParkLink-Backend/ (Monorepo NestJS)
│
├── apps/backend/           → Backend consolidado (NestJS + Prisma + PostgreSQL)
│   ├── src/
│   │   ├── main.ts         → Entry point (serverless + local)
│   │   ├── app.module.ts   → Módulo raíz (importa los 7 dominios)
│   │   ├── database/       → PrismaService (conexión a PostgreSQL vía PrismaPg)
│   │   ├── common/         → Guards, interceptors, filters, enums, utils
│   │   └── modules/
│   │       ├── auth/        → Registro, login, JWT
│   │       ├── users/       → CRUD de usuarios
│   │       ├── parking/     → Espacios de estacionamiento + búsqueda
│   │       ├── reservation/ → Reservas, cancelación, extensión
│   │       ├── payment/     → Pagos mock (90% aprobación)
│   │       ├── notification/→ Notificaciones
│   │       └── maps/        → Google Maps (geocoding, direcciones, mapas)
│   └── prisma/
│       └── schema.prisma    → Esquema PostgreSQL (producción)
│
├── api-gateway/             → API Gateway (proxy NestJS)
│   └── src/
│       ├── main.ts          → Entry point (serverless)
│       └── proxy/           → ProxyService (reenvía a BACKEND_URL)
│
└── api/index.js             → Vercel serverless handler (backend)
```

### Stack técnico

| Componente | Tecnología | Versión |
|---|---|---|
| **Runtime** | Node.js | 22.12.0 LTS |
| **Framework** | NestJS | 11.1.19 |
| **ORM** | Prisma | 7.8.0 |
| **Base de datos** | PostgreSQL (producción) | — |
| **Autenticación** | JWT + bcrypt | — |
| **Validación** | class-validator + class-transformer | — |
| **Maps** | Google Maps API (adapter pattern) | — |
| **Despliegue** | Vercel Serverless Functions | — |

### Base de datos — Modelos (PostgreSQL)

| Modelo | Tabla | Propósito |
|---|---|---|
| `User` | `users` | Conductores, dueños y admins |
| `ParkingSpace` | `parking_spaces` | Espacios de estacionamiento con geolocalización |
| `Reservation` | `reservations` | Reservas con código único (PKL-...) |
| `Payment` | `payments` | Pagos mock con receipt code (RCT-...) |
| `Notification` | `notifications` | Notificaciones por usuario y tipo |

### API — Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/auth/register-driver` | ❌ | Registro conductor |
| POST | `/auth/register-owner` | ❌ | Registro dueño |
| POST | `/auth/login` | ❌ | Login → JWT |
| GET | `/auth/me` | 🔐 JWT | Perfil actual |
| GET/PATCH | `/users/me` | 🔐 JWT | Perfil propio |
| POST/GET | `/parking-spaces` | Mixto | CRUD espacios |
| GET | `/parking-spaces/search` | ❌ | Búsqueda con filtros |
| POST | `/reservations` | 🔐 JWT | Crear reserva |
| PATCH | `/reservations/:id/cancel` | 🔐 JWT | Cancelar |
| POST | `/payments` | 🔐 JWT | Crear pago mock |
| GET | `/maps/geocode` | ❌ | Geocodificar dirección |
| GET | `/health` | ❌ | Health check |

---

## 2. Qué está desplegado actualmente en Vercel

Según la API de Vercel (MCP), estos son los proyectos activos relacionados a ParkLink en el team `maximoff19s-projects`:

### Proyectos activos

| Proyecto Vercel | ID | URL | Framework | Último deploy | Estado |
|---|---|---|---|---|---|
| **`parklink-platform`** | `prj_QLjmh3TjMKRIVE69rjgR2p8PyNMU` | [parklink-platform.vercel.app](https://parklink-platform.vercel.app) | — | `dpl_7grFVEuCLGaceewqnxmKcQbUSBQb` | ✅ READY (production) |
| **`api-gateway`** | `prj_KehkEY9WuPZ0S9RCQqI0DoMjwcy8` | [api-gateway-xi-five.vercel.app](https://api-gateway-xi-five.vercel.app) | NestJS | `dpl_3ZFp1kC4aCJtux4qgemhy99YaozA` | ✅ READY (production) |
| **`parklink-gateway`** | `prj_xEBac9XyYrLiEA9XbW2hsgvpu8Ty` | [parklink-gateway.vercel.app](https://parklink-gateway.vercel.app) | — | `dpl_2vMgRWwq6veLYub77mbsctvXLRhf` | ✅ READY (production) |
| **`parklink-web`** | `prj_fv0zVOZcRjVKZMpQZnKptWXKGFBE` | [parklink-web.vercel.app](https://parklink-web.vercel.app) | — | `dpl_H2zCKG95RAqyhBZrvBSKmurswFKB` | ✅ READY (production) |
| **`parklink`** | `prj_y5MBc2g8X51mfAsmsCpkCfNRjiPn` | [parklink-eta.vercel.app](https://parklink-eta.vercel.app) | Vite | `dpl_HsRbjRTNxQRJ6FfzhYTjukWCf8oQ` | ✅ READY (production) |
| **`backend`** (⚠️ otro repo) | `prj_n6HOezTDNA87Z9DFcL6dRIMqZ4aF` | [backend-silk-two-93.vercel.app](https://backend-silk-two-93.vercel.app) | — | `dpl_78exWAUtmZA5r2dEBGkEgtyhPupM` | ✅ READY (sin target) |

### Mapeo repo → Vercel

| Repositorio | Proyecto Vercel | Root Directory |
|---|---|---|
| `ParkLink-Backend` | **`parklink-platform`** | `/` (raíz) → compila `apps/backend` |
| `ParkLink-Backend` | **`api-gateway`** | `api-gateway/` → subdirectorio |
| `ParkLink-Frontend` | **`parklink`** | `/` (root del frontend) |

### Último commit desplegado

- **Repo:** `ParkLink-Backend`
- **Branch:** `main`
- **SHA:** `c1883eb3ba0b866611f7ee61dce51e76f16ad74c`
- **Mensaje:** `refactor: restructure architecture and migrate to serverless deployment`
- **Autor:** Pietro Osores (pietroxz19@gmail.com)

---

## 3. Requisitos previos

### Cuentas necesarias

1. **Vercel** — ya configurada con el team `maximoff19s-projects`
2. **Render** — cuenta creada; usar `RENDER_API_KEY` desde un entorno seguro para automatizaciones
3. **GitHub** — repo `ParkLink-Backend` conectado a Vercel

### Herramientas locales (opcional)

```bash
node -v    # >= 22.12.0
npm -v     # >= 10.x
bun -v     # >= 1.3.11 (package manager del proyecto)
```

---

## 4. Paso 1: Crear la base de datos PostgreSQL en Render

### 4.1. Ir a Render Dashboard

1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Inicia sesión con tu cuenta
3. Haz clic en **"New +"** → **"PostgreSQL"**

### 4.2. Configurar la base de datos

| Campo | Valor |
|---|---|
| **Name** | `parklink-db` |
| **Database** | `parklink_db` (o el que prefieras) |
| **User** | Déjalo por defecto (autogenerado) |
| **Region** | `US East (Virginia)` — mismo cluster que Vercel `iad1` |
| **Plan** | **Free** (1 GB storage, 0.5 GB RAM) — para desarrollo |
| **PostgreSQL Version** | `16` (la más reciente estable) |

### 4.3. Crear y obtener credenciales

1. Haz clic en **"Create Database"**
2. Espera ~2-3 minutos a que se provisione
3. Una vez creada, verás la sección **"Connections"**
4. Copia la **"External Database URL"** — tiene este formato:

```
postgresql://parklink_db_user:XXXXXXXXXX@dpg-XXXXXXXXX-a.render.com:5432/parklink_db
```

> ⚠️ **IMPORTANTE:** Guarda esta URL. La necesitarás como `DATABASE_URL` en Vercel.

### 4.4. Verificar la conexión externa

Render permite conexiones desde cualquier IP externa en el plan Free.  
Para verificar localmente:

```bash
# Instalar psql si no lo tienes
brew install postgresql-client   # macOS

# Probar conexión
psql "postgresql://tu_usuario:tu_password@dpg-xxxxx-a.render.com:5432/parklink_db"
```

---

## 5. Paso 2: Conectar Render con Vercel

### 5.1. Configurar variables de entorno en Vercel (Backend)

Ve al proyecto **parklink-platform** en Vercel:

1. Entra a: [vercel.com/maximoff19s-projects/parklink-platform/settings/environment-variables](https://vercel.com/maximoff19s-projects/parklink-platform/settings/environment-variables)
2. Agrega estas variables:

| Variable | Valor | Entorno |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` (la de Render) | Production, Preview, Development |
| `JWT_SECRET` | `cambia_esto_por_un_secreto_seguro` | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `1d` | Production, Preview, Development |
| `GOOGLE_MAPS_API_KEY` | `tu_google_maps_key` (sin comillas) | Production, Preview, Development |
| `REDIS_URL` | `redis://...` o Upstash Redis recomendado para cache compartido | Production, Preview, Development |
| `REQUIRE_REDIS_CACHE` | `true` para fallar si no hay Redis; `false` para fallback memoria | Production, Preview, Development |
| `PORT` | `4000` | Production, Preview, Development |

> 🔐 **Para JWT_SECRET:** Genera un secreto fuerte:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Esto produce algo como → `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b`

### 5.2. Configurar variables de entorno en Vercel (API Gateway)

Ve al proyecto **api-gateway** en Vercel:

1. Entra a: [vercel.com/maximoff19s-projects/api-gateway/settings/environment-variables](https://vercel.com/maximoff19s-projects/api-gateway/settings/environment-variables)
2. Agrega:

| Variable | Valor | Entorno |
|---|---|---|
| `BACKEND_URL` | `https://parklink-platform.vercel.app` | Production, Preview, Development |
| `PORT` | `3000` | Production, Preview, Development |

> **BACKEND_URL** debe apuntar al dominio de producción del backend (parklink-platform).  
> Si el backend cambia de dominio, actualiza esta variable.

### 5.3. Configurar clientes contra el API Gateway

Los clientes no deben consumir `parklink-platform` directo en producción.

| Cliente | Variable | Valor producción |
|---|---|---|
| Web Vite | `VITE_API_URL` | `https://api-gateway-xi-five.vercel.app` |
| Flutter | `--dart-define=PARKLINK_API_URL=...` | `https://api-gateway-xi-five.vercel.app` |

Para Android Flutter, `GOOGLE_MAPS_API_KEY` se toma de variable de entorno, `-PGOOGLE_MAPS_API_KEY` o `android/local.properties`. Si falta localmente y tienes Vercel CLI autenticado, copia el valor desde las variables del proyecto Vercel que lo tenga configurado y expórtalo antes de `flutter run`.

### 5.4. Configurar IP Allow (si Render lo requiere)

Render Free no tiene IP Allow List. Pero si usas un plan **Starter** o superior de Render:

1. En Render: Dashboard → PostgreSQL → **"IP Access List"**
2. Agrega la IP de Vercel: Consulta [Vercel IP ranges](https://vercel.com/docs/security/encryption#ip-ranges)
   - `52.223.84.0/24`
   - `35.241.96.0/24`
   - Y otras según la documentación oficial

---

## 6. Paso 3: Desplegar el Backend en Vercel

### 6.1. Configuración del proyecto en Vercel

El proyecto **parklink-platform** ya existe. En caso de crearlo desde cero:

1. En Vercel: **Add New → Project**
2. Importar repositorio: `ParkLink-Backend`
3. **Root Directory:** `/` (la raíz del repo)
4. **Framework Preset:** Other
5. **Build Command:** `bun run build:backend`
6. **Install Command:** `bun install`
7. **Output Directory:** `dist/apps/backend`

### 6.2. El archivo `vercel.json` (raíz)

```json
{
  "version": 2,
  "buildCommand": "bun run build:backend",
  "installCommand": "bun install",
  "outputDirectory": "dist/apps/backend",
  "functions": {
    "api/index.js": {
      "includeFiles": "{dist/apps/backend/**,apps/backend/prisma/**,node_modules/@prisma/client/**,node_modules/.prisma/**,apps/backend/node_modules/@prisma/client/**,apps/backend/node_modules/.prisma/**}"
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

> 📝 **Nota:** El `includeFiles` es crítico porque garantiza que Prisma y sus clientes generados se incluyan en el bundle serverless.

### 6.3. El entry point serverless (`api/index.js`)

```js
const handler = require('../dist/apps/backend/main.js').default;
module.exports = handler;
```

Este archivo carga la compilación de NestJS (que exporta un `default handler`) y la expone como función serverless de Vercel.

### 6.4. Cómo funciona el serverless handler (`main.ts`)

```typescript
// apps/backend/src/main.ts
let cachedServer: Express | undefined;

export default async function handler(request: Request, response: Response): Promise<void> {
  const server = await createVercelServer();
  const listener = server as unknown as RequestListener;
  listener(request, response);
}

if (!process.env.VERCEL) {
  void bootstrap(); // Local development: inicia el servidor normal
}
```

- **En Vercel:** solo se ejecuta el `handler` exportado. NestJS se bootea bajo demanda (cached en warm starts).
- **Local:** `bootstrap()` inicia el servidor NestJS normal en el puerto configurado.

### 6.5. Desplegar manualmente

Desde la raíz del repositorio:

```bash
# Push a main en GitHub → despliegue automático (Git Integration)
git push origin main

# O forzar redeploy desde Vercel CLI
npx vercel --prod
```

### 6.6. Migraciones de Prisma

> ⚠️ **IMPORTANTE:** Las migraciones NO se ejecutan automáticamente en Vercel.

Hay que ejecutarlas manualmente después del deploy:

```bash
# Opción 1: Vía terminal local (apuntando a la DB de Render)
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma

# Opción 2: Vía Vercel CLI (ejecuta un comando en el entorno serverless)
npx vercel env pull   # Descarga .env con DATABASE_URL de Render
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

> Para evitar errores de `DATABASE_URL` en build, Vercel necesita la variable configurada.  
> Puedes optar por **`prisma generate`** sin migrar en build, y migrar manualmente después.

---

## 7. Paso 4: Desplegar el API Gateway en Vercel

### 7.1. Configuración del proyecto

El proyecto **api-gateway** ya existe. En caso de crearlo:

1. Vercel → **Add New → Project**
2. Importar repositorio: `ParkLink-Backend` (mismo repo que el backend)
3. **Root Directory:** `api-gateway/`
4. **Build Command:** `bun run build:api-gateway`
5. **Install Command:** `bun install --frozen-lockfile`
6. **Output Directory:** `dist/api-gateway`
7. **Region:** `iad1` (US East)

### 7.2. El archivo `api-gateway/vercel.json`

```json
{
  "version": 2,
  "buildCommand": "bun run build:api-gateway",
  "outputDirectory": "dist/api-gateway",
  "installCommand": "bun install --frozen-lockfile",
  "framework": null,
  "regions": ["iad1"]
}
```

### 7.3. Importante: variable BACKEND_URL

El API Gateway necesita saber a dónde redirigir las solicitudes.  
La variable `BACKEND_URL` en el proyecto **api-gateway** debe apuntar a:

```
https://parklink-platform.vercel.app
```

---

## 8. Paso 5: Verificar el despliegue

### 8.1. Health check del Backend

```bash
curl https://parklink-platform.vercel.app/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "ParkLink Backend — All systems operational",
  "data": {
    "status": "ok",
    "timestamp": "2026-06-22T..."
  }
}
```

### 8.2. Health check del API Gateway

```bash
curl https://api-gateway-xi-five.vercel.app/
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "ParkLink API Gateway — Running",
  "data": {}
}
```

### 8.3. Probar proxy del Gateway

```bash
curl https://api-gateway-xi-five.vercel.app/health
```

Debería devolver el mismo health check del backend (proxy funciona).

### 8.4. Probar base de datos (registrar un driver)

```bash
curl -X POST https://parklink-platform.vercel.app/auth/register-driver \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "123456",
    "phone": "999888777",
    "plateNumber": "ABC-123"
  }'
```

Respuesta esperada (201 Created):
```json
{
  "success": true,
  "message": "Driver registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "email": "test@example.com", "role": "DRIVER" }
  }
}
```

### 8.5. Verificar Swagger

```
# Backend
https://parklink-platform.vercel.app/docs

# API Gateway
https://api-gateway-xi-five.vercel.app/docs
```

### 8.6. Ver logs en Vercel

```bash
# Build logs del backend
npx vercel logs parklink-platform --build

# Runtime logs (producción)
npx vercel logs parklink-platform
```

---

## 9. Variables de entorno — Resumen

### Backend — `parklink-platform`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión PostgreSQL (Render) | `postgresql://user:pass@dpg-xxx.render.com:5432/parklink_db` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `a1b2c3d4...` (64 chars hex) |
| `JWT_EXPIRES_IN` | Duración del token | `1d` |
| `GOOGLE_MAPS_API_KEY` | API Key de Google Maps | `AIzaSy...` |
| `REDIS_URL` | Cache Redis recomendado en producción | `rediss://...` |
| `REQUIRE_REDIS_CACHE` | Falla el arranque si Redis falta | `false` |
| `PORT` | Puerto local (no usado en Vercel) | `4000` |

### API Gateway — `api-gateway`

| Variable | Descripción | Ejemplo |
|---|---|---|
| `BACKEND_URL` | URL del backend desplegado | `https://parklink-platform.vercel.app` |
| `PORT` | Puerto local (no usado en Vercel) | `3000` |

### Clientes

| Cliente | Variable | Ejemplo |
|---|---|---|
| Web | `VITE_API_URL` | `https://api-gateway-xi-five.vercel.app` |
| Mobile Flutter | `PARKLINK_API_URL` (`--dart-define`) | `https://api-gateway-xi-five.vercel.app` |

---

## 10. Solución de problemas comunes

### ❌ Error: `DATABASE_URL is required for persistent services`

**Causa:** La variable `DATABASE_URL` no está configurada en Vercel.

**Solución:**
1. Ve a Vercel → Project → Settings → Environment Variables
2. Agrega `DATABASE_URL` con la URL de Render
3. Redeploy

### ❌ Error: `PrismaClientInitializationError: Can't reach database server`

**Causa:** La base de datos de Render no acepta conexiones externas o la URL es incorrecta.

**Solución:**
1. Verifica que la URL comience con `postgresql://` (no con `mysql://`)
2. Verifica que las credenciales sean correctas
3. Si Render lo requiere, agrega la IP de Vercel a la IP Allow List

### ❌ Error: Backend build fails con `bun: command not found`

**Causa:** Vercel no tiene Bun instalado globalmente, pero el `installCommand` lo instala.

**Solución:**
- El `package.json` define `"packageManager": "bun@1.3.11"` y esto activa Corepack en Vercel automáticamente.
- Si sigue fallando, usa Node + `npm install` en vez de `bun install`.

### ❌ Error: `Cannot find module '@prisma/client'`

**Causa:** Prisma Client no se generó durante el build.

**Solución:**
```json
// En root vercel.json, verifica que buildCommand incluya prisma generate
"buildCommand": "bun run prisma:generate:backend && nest build backend"
```

### ❌ Error: API Gateway devuelve `502 Bad Gateway`

**Causa:** El Gateway no puede conectar con el Backend (`BACKEND_URL` incorrecto).

**Solución:**
1. Verifica que `BACKEND_URL` tenga el dominio correcto
2. Verifica que el Backend esté funcionando (health check directo)
3. Redeploy del API Gateway

### ❌ Error: `refreshinterval` de Prisma en Vercel

**Causa:** Prisma 7.x puede requerir `--no-engine` en serverless Vercel.

**Solución:**
```bash
# En lugar de engine local, usa Prisma Data Proxy (opcional)
# O asegura que includeFiles cubra los engines
```

---

## 11. Mantenimiento

### Actualizar esquema de base de datos

```bash
# 1. Modificar schema.prisma localmente
# 2. Crear migración
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma --name nombre_migracion

# 3. Commit y push
git add . && git commit -m "feat(db): add new field to X" && git push

# 4. Aplicar migración en producción (Render)
npx prisma migrate deploy --schema=apps/backend/prisma/schema.prisma
```

### Redeploy manual

```bash
# Desde el root del repo
npx vercel --prod

# O desde GitHub → push a main gatilla CI/CD
```

### Monitorear costos

- **Render Free:** Se pone en pausa tras 15 min sin uso (~30s en reactivar). Para producción, usar plan **Starter** ($7/mes sin pausa).
- **Vercel:** El plan Hobby incluye 100h de serverless + 100 GB de ancho de banda. Para producción, plan **Pro** ($20/mes).

---

## 📌 Notas importantes

1. **El Backend y API Gateway comparten el mismo repo** `ParkLink-Backend`, pero son proyectos separados en Vercel.
   - La raíz (`/`) despliega `parklink-platform` (backend)
   - El subdirectorio `api-gateway/` despliega `api-gateway`
2. **Prisma requiere que `DATABASE_URL` exista en build time** para generar el client. Sin ella, el build falla.
3. **El esquema de producción usa PostgreSQL.** El esquema local usa MySQL (espejo). No uses el esquema local para producción.
4. **Los pagos son mock (simulados).** No hay integración real con pasarela de pagos.
5. **No hay Docker.** El proyecto se despliega 100% serverless en Vercel.
6. **Si la base de datos Free de Render se pausa**, la primera request puede tardar 20-30 segundos en responder (cold start + DB wake).
