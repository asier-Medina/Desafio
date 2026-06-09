# SustraiApp

<p align="center">
  <img src="./Frontend/src/assets/images/logofinal.svg" alt="SustraiApp Logo" width="180" />
</p>

<p align="center">
  <strong>Descubre el País Vasco — gastronomía, cultura y eventos con recomendaciones inteligentes</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Node.js-Express-5-339933?logo=nodedotjs" alt="Express 5" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/Flask-3-000000?logo=flask" alt="Flask" />
</p>

---

## Tabla de contenidos

- [Descripción](#descripcion)
- [Stack tecnológico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Puesta en marcha](#puesta-en-marcha)
- [Configuración](#configuracion)
- [API](#api)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Frontend — arquitectura](#frontend--arquitectura)
- [Servicio de datos (ML)](#servicio-de-datos-ml)
- [Licencia](#licencia)
- [Equipo](#equipo)

---

## Descripción

SustraiApp es una aplicación web orientada a residentes y visitantes del País Vasco que busca conectar a diferentes públicos con lugares, establecimientos y actividades de interés cultural, gastronómico y de ocio.

La plataforma consume datos oficiales de **GEO-EUSKADI** y los complementa con un motor de recomendaciones basado en Machine Learning, ofreciendo una experiencia personalizada con filtros inteligentes, sistema de favoritos, reseñas y traducción multilingüe (ES, EU, EN).

Proyecto desarrollado como parte del **Desafío Final — Inetum / BBK Bootcamps 2026**.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 19, React Router 7, Vite 8, Tailwind CSS 4, Framer Motion 12 |
| **Backend API** | Node.js, Express 5, Sequelize ORM 6 |
| **Base de datos** | PostgreSQL 16 |
| **Autenticación** | JWT dual (access + refresh tokens en httpOnly cookies) |
| **ML / Datos** | Python, Flask 3, SQL|
| **Infraestructura** | Docker, Docker Compose (4 servicios) |
| **Traducción** | Widget Google Translate + sistema i18n propio (ES, EU, EN) |
| **Iconos** | react-icons |
| **Linter** | ESLint 10 |

---

## Arquitectura

```
                    ┌──────────────────────────────────────┐
                    │          Cliente (Browser)           │
                    │     React SPA — Vite — Tailwind      │
                    │         http://localhost:5173        │
                    └──────────┬───────────────────────────┘
                               │  HTTP / JSON
                    ┌──────────▼───────────────────────────┐
                    │       Backend API (Express 5)        │
                    │         http://localhost:3000        │
                    │   JWT Auth ─ Sequelize ─ REST        │
                    └──────────┬───────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
  ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
  │  PostgreSQL   │   │   ML / Data   │   │    pgAdmin    │
  │  Port 5440    │   │  Flask 3 API  │   │   Port 5051   │
  └───────────────┘   └───────────────┘   └───────────────┘
```

La comunicación entre servicios se realiza mediante una red bridge de Docker (`Desafio_net`). El backend consulta tanto a PostgreSQL como al servicio ML, con fallback automático a base de datos si el ML no responde.

---

## Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose v2
- [Node.js](https://nodejs.org/) v18+ y npm
- Git

---

## Puesta en marcha

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd SustraiApp
```

### 2. Configurar variables de entorno

**Backend** — crear `Backend/.env`:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sustraiapp
DB_HOST=db
DB_PORT=5432
JWT_SECRET=tu_secreto_aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu_refresh_secreto_aqui
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
PORT=3000
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
ML_API_URL=http://data:5442/api
```

**Frontend** — crear `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Arrancar infraestructura (Docker)

```bash
cd Backend
docker compose up --build -d
```

Esto levanta 4 servicios:

| Servicio | URL | Propósito |
|---|---|---|
| API Backend | http://localhost:3000 | API REST principal |
| Health check | http://localhost:3000/api/health | Estado del servidor |
| ML / Data API | http://localhost:5442 | Recomendaciones ML |
| pgAdmin | http://localhost:5051 | Administración BD |
| PostgreSQL | localhost:5440 | Base de datos |

### 4. Arrancar Frontend

```bash
cd Frontend
npm install
npm run dev
```

La aplicación estará disponible en **http://localhost:5173**.

### Resumen rápido

```bash
# Terminal 1 — Infraestructura
cd Backend && docker compose up --build -d

# Terminal 2 — Frontend
cd Frontend && npm run dev
```

---

## Configuración

### Backend — variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_USER` | Usuario PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `sustraiapp` |
| `DB_HOST` | Host de la BD | `db` (Docker) |
| `DB_PORT` | Puerto PostgreSQL | `5432` |
| `JWT_SECRET` | Secreto access token | — |
| `JWT_EXPIRES_IN` | Tiempo de vida access token | `15m` |
| `JWT_REFRESH_SECRET` | Secreto refresh token | — |
| `JWT_REFRESH_EXPIRES_IN` | Tiempo de vida refresh token | `7d` |
| `FRONTEND_URL` | Origen permitido por CORS | `http://localhost:5173` |
| `PORT` | Puerto del servidor Express | `3000` |
| `ML_API_URL` | URL del servicio ML | `http://data:5442/api` |

### Frontend — variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `VITE_API_BASE_URL` | URL base de la API backend | `http://localhost:3000` |

---

## API

### Autenticación

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | — | Registrar nuevo usuario |
| POST | `/api/auth/login` | — | Iniciar sesión |
| POST | `/api/auth/logout` | — | Cerrar sesión |
| POST | `/api/auth/refresh` | — | Renovar access token |
| GET | `/api/auth/me` | `protect` | Obtener usuario actual |

### Usuario

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/users/me` | `protect` | Perfil completo (municipio, intereses, preferencias) |
| PUT | `/api/users/me` | `protect` | Actualizar perfil |
| GET | `/api/users/me/interests` | `protect` | Obtener intereses |
| PUT | `/api/users/me/interests` | `protect` | Actualizar intereses |
| GET | `/api/users/me/preferences` | `protect` | Obtener preferencias |
| PUT | `/api/users/me/preferences` | `protect` | Actualizar preferencias |
| GET | `/api/users/interests/catalog` | — | Catálogo completo de intereses |

### Favoritos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/users/me/favorites` | `protect` | Listar favoritos (`?tipo=evento`) |
| POST | `/api/users/me/favorites` | `protect` | Añadir favorito (`entidad_id`, `entidad_tipo`) |
| DELETE | `/api/users/me/favorites/:tipo/:id` | `protect` | Eliminar favorito |

### Reseñas

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/reviews/:tipo/:id` | — | Obtener reseñas de una entidad |
| POST | `/api/reviews/:tipo/:id` | `protect` | Crear reseña |
| DELETE | `/api/reviews/:tipo/:id` | `protect` | Eliminar reseña propia |

### Gastronomía

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/gastronomy/` | — | Listado completo |
| GET | `/api/gastronomy/mejor-valorados` | — | Mejor valorados |
| GET | `/api/gastronomy/michelin-repsol` | — | Distinciones Michelin / Repsol |
| GET | `/api/gastronomy/entorno-especial` | — | Entorno especial |
| GET | `/api/gastronomy/cerca-de-ti` | `protect` | Cerca del usuario |
| GET | `/api/gastronomy/:id` | — | Detalle por ID |
| POST | `/api/gastronomy/` | Admin | Crear |
| PUT | `/api/gastronomy/:id` | Admin | Actualizar |
| DELETE | `/api/gastronomy/:id` | Admin | Eliminar |
| PATCH | `/api/gastronomy/:id/active` | Admin | Activar / desactivar |
| PATCH | `/api/gastronomy/:id/sponsored` | Admin | Patrocinar |

### Cultura

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/culture/` | — | Listado completo |
| GET | `/api/culture/museos` | — | Museos |
| GET | `/api/culture/patrimonio` | — | Patrimonio |
| GET | `/api/culture/visita-guiada` | — | Visita guiada |
| GET | `/api/culture/cerca-de-ti` | — | Cerca del usuario |
| GET | `/api/culture/:id` | — | Detalle por ID |
| POST | `/api/culture/` | Admin | Crear |
| PUT | `/api/culture/:id` | Admin | Actualizar |
| DELETE | `/api/culture/:id` | Admin | Eliminar |
| PATCH | `/api/culture/:id/active` | Admin | Activar / desactivar |
| PATCH | `/api/culture/:id/sponsored` | Admin | Patrocinar |

### Eventos

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/events/` | — | Listado completo |
| GET | `/api/events/esta-semana` | — | Eventos de esta semana |
| GET | `/api/events/fin-de-semana` | — | Eventos de fin de semana |
| GET | `/api/events/cerca-de-ti` | `protect` | Cerca del usuario |
| GET | `/api/events/en-euskera` | — | Eventos en euskera |
| GET | `/api/events/:id` | — | Detalle por ID |
| POST | `/api/events/` | Admin | Crear |
| PUT | `/api/events/:id` | Admin | Actualizar |
| DELETE | `/api/events/:id` | Admin | Eliminar |
| PATCH | `/api/events/:id/active` | Admin | Activar / desactivar |
| PATCH | `/api/events/:id/sponsored` | Admin | Patrocinar |

### Administración

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | Listar usuarios |
| PATCH | `/api/admin/users/:id` | Admin | Cambiar rol |
| DELETE | `/api/admin/users/:id` | Admin | Eliminar usuario |
| GET | `/api/admin/comercios` | Admin | Listar comercios |
| PATCH | `/api/admin/comercios/:id` | Admin | Activar / patrocinar |

### Autenticación — flujo JWT

El sistema usa **access token** (corta duración, 15 min) y **refresh token** (larga duración, 7 días). Ambos se almacenan en **httpOnly cookies**:

- `access_token` — se envía en cada petición, el middleware `protect` lo verifica.
- `refresh_token` — se usa en `POST /api/auth/refresh` para obtener un nuevo par de tokens sin re-autenticar.
- Las cookies son `secure` en producción y `sameSite: strict`.

---

## Estructura del proyecto

```
SustraiApp/
│
├── Backend/                        # API REST (Express + Sequelize)
│   ├── src/
│   │   ├── config/                 # Conexión PostgreSQL (Sequelize)
│   │   ├── controllers/            # Lógica de cada endpoint
│   │   ├── middlewares/            # protect, isAdmin, errorHandler
│   │   ├── models/                 # Modelos ORM (User, Event, Gastronomy, Culture…)
│   │   ├── routes/                 # Definición de rutas
│   │   ├── services/               # Lógica de negocio + integración ML
│   │   ├── data/mockData.js        # Datos de respaldo
│   │   └── index.js                # Punto de entrada Express
│   ├── docker-compose.yml          # Orquestación (db, pgadmin, data, app)
│   ├── Dockerfile
│   ├── init.sql                    # Schema + seed data completo
│   └── .env.example
│
├── Frontend/                       # SPA React + Vite
│   ├── src/
│   │   ├── main.jsx                # Entry point
│   │   ├── index.css               # Estilos globales + Tailwind
│   │   ├── routes/                 # Router (react-router v7)
│   │   ├── features/               # Módulos por funcionalidad
│   │   │   ├── auth/               # Login, registro, onboarding
│   │   │   ├── home/               # SplashScreen + landing
│   │   │   ├── events/             # Listado y detalle de eventos
│   │   │   ├── gastronomy/         # Listado y detalle de gastronomía
│   │   │   ├── culture/            # Listado y detalle de cultura
│   │   │   ├── favorite/           # Favoritos del usuario
│   │   │   ├── profile/            # Perfil, intereses, preferencias
│   │   │   └── admin/              # Panel de administración
│   │   ├── services/               # Clientes HTTP para cada entidad
│   │   ├── shared/
│   │   │   ├── components/         # Componentes reutilizables
│   │   │   │   ├── Header/         # Cabecera con nav + selector idioma
│   │   │   │   ├── Cards/          # Tarjetas de contenido
│   │   │   │   ├── Detail/         # Vista detalle genérica
│   │   │   │   ├── Filters/        # Filtros por categoría
│   │   │   │   ├── MobileNav/      # Navegación móvil inferior
│   │   │   │   ├── Footer/         # Pie de página
│   │   │   │   ├── PaginatedGrid/  # Grid paginado
│   │   │   │   ├── RequireAuth/    # Guard de autenticación
│   │   │   │   └── GoogleTranslate/ # Widget de traducción
│   │   │   ├── context/            # Contextos React (Auth, Lang, Favorites)
│   │   │   ├── hooks/              # Hooks personalizados
│   │   │   ├── layout/             # Layout principal (Header + Outlet + Footer)
│   │   │   ├── locales/            # Traducciones i18n (ES, EU, EN)
│   │   │   └── ui/                 # Primitivas UI (Button, BackButton, icons)
│   │   └── assets/                 # Imágenes, fuentes, SVGs
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── .env.example
│
├── DataV2/                         # API de datos / ML (Python Flask)
│   ├── app.py                      # Aplicación Flask con todos los endpoints
│   ├── config.py                   # Configuración SQLAlchemy
│   ├── models.py                   # Modelos de datos
│   ├── data/                       # Scripts y CSVs de carga inicial
│   └── requirements.txt
│
├── docker-compose.yml              # Orquestación transversal
└── README.md
```

---

## Funcionalidades

### Para usuarios

| Funcionalidad | Descripción |
|---|---|
| **Explorar** | Navega por gastronomía, cultura y eventos del País Vasco |
| **Buscar** | Encuentra contenido por categorías, ubicación y preferencias |
| **Recomendaciones ML** | Descubre lugares y actividades basados en tus intereses |
| **Traducción integrada** | Widget Google Translate + sistema i18n propio (ES, EU, EN) |
| **Favoritos** | Guarda y gestiona tus lugares favoritos |
| **Reseñas** | Valora y comenta establecimientos y actividades |
| **Perfil** | Edita tu información, intereses y preferencias |
| **Onboarding** | Configura tu perfil al registrarte con selector de intereses |

### Para administradores

| Funcionalidad | Descripción |
|---|---|
| **Gestión de usuarios** | Listar, cambiar roles, eliminar usuarios |
| **Gestión de comercios** | Activar/desactivar, patrocinar entidades |

### Cobertura geográfica

78 municipios vascos (Bizkaia, Gipuzkoa, Araba/Álava) con datos precargados:

| Provincia | Municipios |
|---|---|
| Bizkaia | Bilbao, Barakaldo, Getxo, Portugalete, Santurtzi, Basauri, Galdakao, etc. |
| Gipuzkoa | Donostia, Irun, Errenteria, Zarautz, Arrasate, etc. |
| Araba | Gasteiz, Laudio, Amurrio, etc. |

### Datos precargados (seed)

| Entidad | Cantidad |
|---|---|
| Eventos | 30 |
| Establecimientos gastronómicos | 30 |
| Lugares de cultura | 25 |
| Usuario  de prueba | 2  |
| Reseñas | 25+ |
| Distinciones gastronómicas | 8 (Michelin, Repsol, Eusko Label…) |
| Intereses | 31 (árbol de 3 niveles) |

---

## Frontend — arquitectura

### Gestión de estado

- **AuthContext** — estado global de autenticación, persiste sesión con `/api/auth/me`
- **LanguageContext** — idioma activo (es, eu, en), persistido en localStorage + cookie
- **FavoritesContext** — favoritos del usuario con actualización optimista y rollback

### Sistema de traducción

La aplicación cuenta con dos capas de traducción:

1. **i18n propio** — objetos planos por idioma en `shared/locales/translations.js` para textos estáticos de la interfaz.
2. **Widget Google Translate** — traduce contenido dinámico (datos de API) a nivel de DOM con soporte para re-renderizados de React mediante `MutationObserver`.

### Enrutamiento

| Ruta | Página | Protegida |
|---|---|---|
| `/` | Home (splash + landing) | — |
| `/culture` | Listado de cultura | — |
| `/culture/:id` | Detalle de cultura | — |
| `/gastronomy` | Listado de gastronomía | — |
| `/gastronomy/:id` | Detalle de gastronomía | — |
| `/events` | Listado de eventos | — |
| `/events/:id` | Detalle de evento | — |
| `/profile` | Perfil de usuario | ✓ |
| `/favoritos` | Favoritos | ✓ |
| `/login` | Auth (login / registro / onboarding) | — |
| `/admin/usuarios` | Admin — usuarios | Admin |
| `/admin/comercios` | Admin — comercios | Admin |

### Aliases de importación

| Alias | Ruta |
|---|---|
| `@` | `./src` |
| `@routes` | `./src/routes/` |
| `@features` | `./src/features/` |
| `@shared` | `./src/shared/` |
| `@components` | `./src/shared/components/` |
| `@ui` | `./src/shared/ui/` |
| `@hooks` | `./src/shared/hooks/` |
| `@services` | `./src/services/` |
| `@assets` | `./src/assets/` |

---

## Servicio de datos (ML)

El servicio `DataV2/` es una API Flask independiente que proporciona endpoints de datos y recomendaciones basadas en Machine Learning.

### Endpoints del servicio ML

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/municipios` | Listado de municipios |
| GET | `/api/eventos` | Eventos (con filtros) |
| GET | `/api/eventos/esta-semana` | Eventos de la semana |
| GET | `/api/eventos/fin-de-semana` | Eventos de finde |
| GET | `/api/eventos/en-euskera` | Eventos en euskera |
| GET | `/api/gastronomia` | Gastronomía (con filtros) |
| GET | `/api/gastronomia/mejor-valorados` | Mejor valorados |
| GET | `/api/gastronomia/entorno-especial` | Entorno especial |
| GET | `/api/gastronomia/:id/cualificaciones` | Cualificaciones |
| GET | `/api/cultura` | Cultura (con filtros) |
| GET | `/api/cultura/museos` | Museos |
| GET | `/api/cultura/patrimonio` | Patrimonio |
| GET | `/api/cultura/visita-guiada` | Visita guiada |
| GET | `/api/intereses` | Todos los intereses |
| POST | `/api/resenas` | Crear reseña |
| GET | `/api/resenas/:tipo/:id` | Obtener reseñas |

El backend consulta este servicio para ciertos endpoints y, si no obtiene respuesta, cae automáticamente a la base de datos PostgreSQL.

---

## Licencia

MIT License — Copyright (c) 2026 asMedina

---

## Equipo

Proyecto desarrollado como parte del **Desafío Final — Inetum / BBK Bootcamps 2026**.
