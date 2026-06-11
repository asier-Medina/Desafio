# SustraiApp

> Aplicación web para descubrir eventos, gastronomía y cultura del País Vasco. Recomendaciones personalizadas impulsadas por un motor ML, con datos oficiales de **GEO-EUSKADI** y soporte para español, euskera e inglés.

Proyecto desarrollado como **Desafío Final — Inetum · BBK Bootcamps 2026**.

---

## Funcionalidades

### Contenido y exploración
- **Eventos** — listado con filtros por categoría (esta semana, fin de semana, cerca de ti, en euskera) y por tipo (concierto, festival, teatro, danza, bertsolarismo, exposición, conferencia, feria)
- **Gastronomía** — filtros por categoría (mejor valorados, distinción Michelin/Repsol, entorno especial, cerca de ti) y por tipo (restaurante, bar, sidrería, bodega, asador, café)
- **Cultura** — filtros por categoría (museos, patrimonio, visita guiada, cerca de ti) y por tipo (museo, monumento, casco histórico, patrimonio, teatro, parque/playa)
- Páginas de detalle para cada elemento con información completa, localización y reseñas

### Usuarios
- **Registro y login** con validación completa de formulario y sanitización de inputs
- **Onboarding** tras el registro: selección de intereses (catálogo jerárquico), rango de precio preferido, accesibilidad por movilidad reducida y municipios de interés
- **Perfil editable**: información personal, municipio, género, edad, intereses y preferencias
- **Favoritos**: guardar y eliminar elementos de las tres secciones, con optimistic update y persistencia en base de datos
- **Reseñas**: crear y eliminar reseñas en eventos, restaurantes y lugares culturales

### Recomendaciones y chatbot
- **Motor ML** (API Flask externa): cada sección consulta el motor de recomendaciones con fallback transparente a PostgreSQL si el servicio no está disponible
- **Cerca de ti**: recomendaciones basadas en el municipio del usuario, con fallback a Bilbao si no hay resultados locales
- **Chatbot conversacional**: asistente flotante que responde en lenguaje natural, devuelve ítems sugeridos con navegación directa al detalle, y se personaliza con el perfil del usuario si está autenticado

### Administración
- **Panel de usuarios**: listar, buscar, actualizar y eliminar usuarios
- **Panel de comercios**: listar, buscar, activar/desactivar y marcar como patrocinado
- **Gestión de cultura y eventos**: mismas operaciones de activación y patrocinio
- Todas las rutas de administración protegidas con rol `admin`

### Internacionalización
- Soporte completo en **español**, **euskera** y **inglés**
- Selector de idioma persistente en `localStorage`
- Traducciones dinámicas de contenido de base de datos vía servicio de traducción con caché

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19 · React Router 7 · Vite · Tailwind CSS 4 · Framer Motion |
| Backend | Node.js · Express 5 · Sequelize 6 |
| Base de datos | PostgreSQL 16 |
| Autenticación | JWT — access token (15 min) + refresh token (7 días) en cookies HttpOnly |
| ML / Chatbot | Flask (Python 3.11) con seeder de datos incluido |
| Infraestructura | Docker · Docker Compose |

---

## Puesta en marcha

### Requisitos previos

- [Docker](https://www.docker.com/) y Docker Compose instalados
- Archivo `.env` en la raíz del proyecto (ver sección siguiente)

---

### Configuración

Crea el archivo `.env` en la raíz a partir de `.env.example`:

```env
# PostgreSQL
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_HOST=db
DB_PORT=5432

# pgAdmin
PGADMIN_DEFAULT_EMAIL=
PGADMIN_DEFAULT_PASSWORD=

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Servidor
PORT=3000
FRONTEND_URL=http://localhost:5173
```

---

### Arranque

Un único comando desde la raíz del proyecto levanta todos los servicios:

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| Backend (Node.js) | http://localhost:3000 |
| ML / Chatbot (Flask) | http://localhost:5442 |
| Health check | http://localhost:3000/api/health |
| pgAdmin | http://localhost:5051 |

Los servicios arrancan en orden: primero PostgreSQL (con healthcheck), luego el seeder de datos (Python, se ejecuta una sola vez y termina), después el ML/Flask, el backend y finalmente el frontend.

---

## Rutas de la aplicación

| Ruta | Descripción | Auth |
|---|---|---|
| `/` | Home con secciones destacadas | Pública |
| `/events` | Listado de eventos con filtros | Pública |
| `/events/:id` | Detalle de evento | Pública |
| `/gastronomy` | Listado de gastronomía con filtros | Pública |
| `/gastronomy/:id` | Detalle de restaurante | Pública |
| `/culture` | Listado de cultura con filtros | Pública |
| `/culture/:id` | Detalle de lugar cultural | Pública |
| `/favoritos` | Favoritos del usuario | Requerida |
| `/profile` | Perfil del usuario | Requerida |
| `/profile/account` | Edición de perfil, intereses y preferencias | Requerida |
| `/admin/usuarios` | Gestión de usuarios | Admin |
| `/admin/comercios` | Gestión de comercios | Admin |
| `/login` | Login y registro | Pública |

---

## API — Endpoints

### Autenticación
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Usuario (requieren autenticación)
```
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
GET    /api/users/me/interests
PUT    /api/users/me/interests
GET    /api/users/me/preferences
PUT    /api/users/me/preferences
GET    /api/users/me/reviews
GET    /api/users/interests/catalog          ← público
```

### Favoritos (requieren autenticación)
```
GET    /api/users/me/favorites
GET    /api/users/me/favorites?tipo={evento|gastronomia|cultura}
POST   /api/users/me/favorites
DELETE /api/users/me/favorites/:entidad_tipo/:entidad_id
```

### Eventos
```
GET    /api/events                           ← público
GET    /api/events/esta-semana               ← público
GET    /api/events/fin-de-semana             ← público
GET    /api/events/cerca-de-ti               ← público
GET    /api/events/en-euskera                ← público
GET    /api/events/:id                       ← público
POST   /api/events                           ← admin
PUT    /api/events/:id                       ← admin
DELETE /api/events/:id                       ← admin
PATCH  /api/events/:id/active                ← admin
PATCH  /api/events/:id/sponsored             ← admin
```

### Gastronomía
```
GET    /api/gastronomy                       ← público
GET    /api/gastronomy/mejor-valorados       ← público
GET    /api/gastronomy/michelin-repsol       ← público
GET    /api/gastronomy/entorno-especial      ← público
GET    /api/gastronomy/cerca-de-ti           ← público
GET    /api/gastronomy/:id                   ← público
POST   /api/gastronomy                       ← admin
PUT    /api/gastronomy/:id                   ← admin
DELETE /api/gastronomy/:id                   ← admin
PATCH  /api/gastronomy/:id/active            ← admin
PATCH  /api/gastronomy/:id/sponsored         ← admin
```

### Cultura
```
GET    /api/culture                          ← público
GET    /api/culture/museos                   ← público
GET    /api/culture/patrimonio               ← público
GET    /api/culture/visita-guiada            ← público
GET    /api/culture/cerca-de-ti              ← público
GET    /api/culture/:id                      ← público
POST   /api/culture                          ← admin
PUT    /api/culture/:id                      ← admin
DELETE /api/culture/:id                      ← admin
PATCH  /api/culture/:id/active               ← admin
PATCH  /api/culture/:id/sponsored            ← admin
```

### Reseñas
```
GET    /api/reviews/me                       ← autenticado
GET    /api/reviews/gastronomy/:id           ← público
GET    /api/reviews/culture/:id              ← público
GET    /api/reviews/event/:id                ← público
POST   /api/reviews/gastronomy/:id           ← autenticado
POST   /api/reviews/culture/:id              ← autenticado
POST   /api/reviews/event/:id                ← autenticado
DELETE /api/reviews/:tipo/:id                ← autenticado
```

### Administración (requieren rol admin)
```
GET    /api/admin/users
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
GET    /api/admin/comercios
PATCH  /api/admin/comercios/:id
GET    /api/admin/cultura
PATCH  /api/admin/cultura/:id
GET    /api/admin/eventos
PATCH  /api/admin/eventos/:id
```

### Municipios y chatbot
```
GET    /api/municipalities                   ← público
POST   /api/chat                             ← público (personalizado si autenticado)
```

---

## Estructura del proyecto

```
SustraiApp/
├── Backend/
│   ├── src/
│   │   ├── config/          # Conexión PostgreSQL (Sequelize)
│   │   ├── controllers/     # Lógica de cada endpoint
│   │   ├── middlewares/     # protect, isAdmin, errorHandler
│   │   ├── models/          # User, Culture, Event, Gastronomy, Favorite, Interest, Preference, Review, Municipality
│   │   ├── routes/          # Definición de rutas por módulo
│   │   ├── services/        # Lógica de negocio y llamadas al ML
│   │   └── index.js
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── init.sql
└── Frontend/
    └── src/
        ├── features/        # auth, events, gastronomy, culture, chatbot, profile, admin, home, favorite
        ├── routes/          # React Router — definición de rutas
        ├── services/        # Llamadas a la API REST
        └── shared/
            ├── components/  # Componentes reutilizables
            ├── context/     # AuthContext, LanguageContext, FavoritesContext
            ├── layout/      # Header, Footer, MainLayout
            ├── locales/     # Traducciones ES / EU / EN
            └── ui/          # Componentes UI base (Button, etc.)
```

---

## Roles y permisos

| Acción | Sin cuenta | Usuario | Admin |
|---|---|---|---|
| Explorar contenido | ✓ | ✓ | ✓ |
| Ver reseñas | ✓ | ✓ | ✓ |
| Guardar favoritos | — | ✓ | ✓ |
| Escribir reseñas | — | ✓ | ✓ |
| Editar perfil e intereses | — | ✓ | ✓ |
| Usar chatbot |       | ✓ (personalizado) | ✓ |
| Panel de administración | — | — | ✓ |
| Activar / patrocinar contenido | — | — | ✓ |
| Gestionar usuarios | — | — | ✓ |
