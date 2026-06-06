# SustraiApp

> Aplicación web para la zona del País Vasco orientada a diferentes públicos para encontrar lugares, establecimientos y actividades de interés — impulsada por datos de **GEO-EUSKADI**.

---

## Estado del proyecto

| Módulo | Estado |
|---|---|
| Backend — Auth | Completado |
| Backend — Usuario | Completado |
| Backend — Favoritos | Completado |
| Backend — Reviews | Completado |
| Backend — Eventos | En construcción |
| Backend — Gastronomía | En construcción |
| Backend — Cultura | En construcción |
| Frontend | En construcción |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js · Express · Sequelize |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT (access + refresh token) |
| Frontend | React · Vite · Tailwind CSS |
| Infraestructura | Docker · Docker Compose |

---

## Puesta en marcha

### Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose instalados
- [Node.js](https://nodejs.org/) (v18 o superior) y npm instalados
- Archivo `.env` configurado en `/Backend` (ver sección de variables de entorno)

---

### 1. Backend (Docker)

El backend y la base de datos se levantan con Docker Compose.

**Configura las variables de entorno** — crea el archivo `Backend/.env`:

```env
DB_USER=
DB_PASSWORD=
DB_NAME=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
PORT=3000
PGADMIN_DEFAULT_EMAIL=
PGADMIN_DEFAULT_PASSWORD=
```

**Arranca los servicios:**

```bash
cd Backend
docker compose up --build -d
```

Servicios disponibles tras el arranque:

| Servicio | URL |
|---|---|
| API Backend | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |
| pgAdmin | http://localhost:5051 |

---

### 2. Frontend (Vite)

El frontend se ejecuta directamente con npm en modo desarrollo.

**Configura las variables de entorno** — crea el archivo `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**Instala dependencias y arranca el servidor de desarrollo:**

```bash
cd Frontend
npm install
npm run dev
```

La aplicación estará disponible en:

| Servicio | URL |
|---|---|
| App web | http://localhost:5173 |

---

### Resumen rápido

```bash
# Terminal 1 — Backend
cd Backend
docker compose up --build -d

# Terminal 2 — Frontend
cd Frontend
npm run dev
```

---

## Endpoints disponibles

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Usuario
```
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
GET    /api/users/me/interests
PUT    /api/users/me/interests
GET    /api/users/me/preferences
PUT    /api/users/me/preferences
GET    /api/users/me/reviews
GET    /api/users/me/reviews?tipo={evento|gastronomia|cultura}
GET    /api/users/me/favorites
GET    /api/users/me/favorites?tipo={evento|gastronomia|cultura}
POST   /api/users/me/favorites
DELETE /api/users/me/favorites/:entidad_tipo/:entidad_id
GET    /api/users/interests/catalog
```

### Reviews
```
GET    /api/reviews/:tipo/:entidad_id
POST   /api/reviews/:tipo/:entidad_id
PUT    /api/reviews/:tipo/:entidad_id
DELETE /api/reviews/:tipo/:entidad_id
```

---

## Estructura del proyecto

```
SustraiApp/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.js
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── init.sql
└── Frontend/
    └── src/
        ├── features/
        ├── routes/
        ├── services/
        └── shared/
```

---

## Equipo

Proyecto desarrollado como parte del **Desafío Final — Inetum · BBK Bootcamps 2026**.
