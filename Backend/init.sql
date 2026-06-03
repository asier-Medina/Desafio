-- =============================================================
-- SUSTRAIAPP — Esquema normalizado (v3)
-- =============================================================



CREATE SCHEMA IF NOT EXISTS shared;
CREATE SCHEMA IF NOT EXISTS market_data;
CREATE SCHEMA IF NOT EXISTS user_data;


-- =============================================================
-- ESQUEMA: shared
-- =============================================================

CREATE TABLE IF NOT EXISTS shared.municipalities (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    provincia       VARCHAR(50)  NOT NULL,
    nora_code       VARCHAR(20)  UNIQUE,
    province_code   VARCHAR(5),
    lat             FLOAT,
    lng             FLOAT,
    UNIQUE (nombre, provincia)
);
-- =============================================================
-- ESQUEMA: market_data
-- =============================================================

CREATE TABLE IF NOT EXISTS market_data.events (
    id                  SERIAL PRIMARY KEY,
    id_kulturklik       VARCHAR(50)  UNIQUE NOT NULL,
    municipality_id     INTEGER      NOT NULL REFERENCES shared.municipalities(id) ON DELETE RESTRICT,
    type                VARCHAR(50),
    subtipo             VARCHAR(100),
    start_date          TIMESTAMPTZ  NOT NULL,
    end_date            TIMESTAMPTZ  NOT NULL,
    publication_date    TIMESTAMPTZ,
    language            VARCHAR(10),
    opening_hours       VARCHAR(100),
    price_eur           FLOAT,
    is_free             BOOLEAN DEFAULT FALSE,
    is_sponsored        BOOLEAN DEFAULT FALSE,
    purchase_url        TEXT,
    url_event           TEXT,
    url_online          TEXT,
    images              JSONB,
    online              BOOLEAN DEFAULT FALSE,
    establishment       VARCHAR(255),
    place               VARCHAR(255),
    company             VARCHAR(255),
    active              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_start_date   ON market_data.events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_municipality ON market_data.events (municipality_id);
CREATE INDEX IF NOT EXISTS idx_events_active       ON market_data.events (active);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS market_data.gastronomy (
    id                      SERIAL PRIMARY KEY,
    google_place_id         VARCHAR(100) UNIQUE NOT NULL,
    nombre                  VARCHAR(255) NOT NULL,
    descripcion             TEXT,
    municipality_id         INTEGER NOT NULL REFERENCES shared.municipalities(id) ON DELETE RESTRICT,
    lat                     FLOAT,
    lng                     FLOAT,
    type                    VARCHAR(50),
    tipo_comida             VARCHAR(100),
    entorno                 VARCHAR(100),
    email                   VARCHAR(100),
    web                     TEXT,
    web_euskadi             TEXT,
    categoria               VARCHAR(50),
    calidad                 BOOLEAN DEFAULT FALSE,
    url_imagen              TEXT,
    valoracion              FLOAT CHECK (valoracion >= 1 AND valoracion <= 5),
    num_resenas             INTEGER,
    nivel_precio            VARCHAR(50),
    national_phone_number   VARCHAR(20),
    michelin                BOOLEAN DEFAULT FALSE,
    repsol                  BOOLEAN DEFAULT FALSE,
    is_sponsored            BOOLEAN DEFAULT FALSE,
    active                  BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gastro_municipality_active
    ON market_data.gastronomy (municipality_id, active);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS market_data.culture (
    id                  SERIAL PRIMARY KEY,
    google_place_id     VARCHAR(100) UNIQUE,
    kulturklik_id       VARCHAR(50)  UNIQUE,
    fuente              VARCHAR(50)  NOT NULL DEFAULT 'Open Data'
                            CHECK (fuente IN ('Google Places', 'Kulturklik', 'Open Data', 'Manual')),
    nombre              VARCHAR(255) NOT NULL,
    tipo_lugar          VARCHAR(100) NOT NULL,
    tipo_cultura        VARCHAR(100),
    descripcion         TEXT,
    precio              VARCHAR(100),
    horario             JSONB,
    telefono            VARCHAR(50),
    email               VARCHAR(100),
    web                 VARCHAR(255),
    web_amigable        VARCHAR(255),
    imagen_url          TEXT,
    municipality_id     INTEGER NOT NULL REFERENCES shared.municipalities(id) ON DELETE RESTRICT,
    direccion           VARCHAR(255),
    codigo_postal       VARCHAR(10),
    visita_guiada       BOOLEAN DEFAULT FALSE,
    capacidad           INTEGER,
    tienda              BOOLEAN DEFAULT FALSE,
    lat                 FLOAT   NOT NULL,
    lng                 FLOAT   NOT NULL,
    valoracion          FLOAT CHECK (valoracion >= 1 AND valoracion <= 5),
    numero_valoraciones INTEGER,
    is_sponsored        BOOLEAN DEFAULT FALSE,
    active              BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT culture_requires_external_id CHECK (
        google_place_id IS NOT NULL OR kulturklik_id IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_culture_municipality ON market_data.culture (municipality_id);
CREATE INDEX IF NOT EXISTS idx_culture_active       ON market_data.culture (active);
CREATE INDEX IF NOT EXISTS idx_culture_tipo_lugar   ON market_data.culture (tipo_lugar);


-- =============================================================
-- ESQUEMA: user_data
-- =============================================================

CREATE TABLE IF NOT EXISTS user_data.users (
    id_user         SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(256) NOT NULL,
    tlf             VARCHAR(20),
    municipality_id INTEGER      NOT NULL REFERENCES shared.municipalities(id) ON DELETE RESTRICT,
    sexo            VARCHAR(10)  NOT NULL CHECK (sexo IN ('hombre', 'mujer', 'otro')),
    age             INTEGER      NOT NULL CHECK (age > 0 AND age < 120),
    role            VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_data.interests (
    id_interes  SERIAL  PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    father_id   INTEGER REFERENCES user_data.interests(id_interes) ON DELETE SET NULL,
    level       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_data.user_interests (
    id_user     INTEGER NOT NULL REFERENCES user_data.users(id_user)        ON DELETE CASCADE,
    id_interes  INTEGER NOT NULL REFERENCES user_data.interests(id_interes) ON DELETE CASCADE,
    PRIMARY KEY (id_user, id_interes)
);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_data.preferences (
    id                  SERIAL  PRIMARY KEY,
    user_id             INTEGER NOT NULL UNIQUE REFERENCES user_data.users(id_user) ON DELETE CASCADE,
    rango_precio        VARCHAR(10)  CHECK (rango_precio IN ('bajo', 'medio', 'alto')),
    movilidad_reducida  BOOLEAN DEFAULT FALSE,
    municipios_interes  INTEGER[]    DEFAULT '{}',
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------
-- Reviews — tres tablas separadas con FKs reales
-- UNIQUE (user_id, entidad_id) evita reseñas duplicadas por usuario
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_data.event_reviews (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES user_data.users(id_user)   ON DELETE CASCADE,
    event_id    INTEGER NOT NULL REFERENCES market_data.events(id)     ON DELETE CASCADE,
    puntuacion  INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    texto       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reviews_event ON user_data.event_reviews (event_id);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_data.gastronomy_reviews (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES user_data.users(id_user)   ON DELETE CASCADE,
    gastro_id   INTEGER NOT NULL REFERENCES market_data.gastronomy(id) ON DELETE CASCADE,
    puntuacion  INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    texto       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, gastro_id)
);

CREATE INDEX IF NOT EXISTS idx_gastronomy_reviews_gastro ON user_data.gastronomy_reviews (gastro_id);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_data.culture_reviews (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES user_data.users(id_user)   ON DELETE CASCADE,
    culture_id  INTEGER NOT NULL REFERENCES market_data.culture(id)    ON DELETE CASCADE,
    puntuacion  INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    texto       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, culture_id)
);

CREATE INDEX IF NOT EXISTS idx_culture_reviews_culture ON user_data.culture_reviews (culture_id);

-- -------------------------------------------------------------------
-- Favoritos — tabla única con discriminador VARCHAR
-- FK lógica hacia la entidad; el CHECK garantiza valores válidos
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_data.favorites (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER     NOT NULL REFERENCES user_data.users(id_user) ON DELETE CASCADE,
    entidad_id      INTEGER     NOT NULL,
    entidad_tipo    VARCHAR(20) NOT NULL CHECK (entidad_tipo IN ('evento', 'gastronomia', 'cultura')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, entidad_id, entidad_tipo)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_data.favorites (user_id);




-- =============================================================
-- SUSTRAIAPP — Seed data
-- Usuarios de prueba + árbol de intereses completo
-- password_hash corresponde a '12345678' (bcrypt, cost 12)
-- =============================================================


INSERT INTO shared.municipalities (nombre, provincia, nora_code, province_code, lat, lng) VALUES
    ('Bilbao',          'Bizkaia',   NULL, '48',  43.2630, -2.9350),
    ('Getxo',           'Bizkaia',   NULL, '48',  43.3563, -3.0097),
    ('Barakaldo',       'Bizkaia',   NULL, '48',  43.2963, -2.9942),
    ('San Sebastián',   'Gipuzkoa',  NULL, '20',  43.3183, -1.9812),
    ('Vitoria-Gasteiz', 'Álava',     NULL, '01',  42.8469, -2.6728),
    ('Irún',            'Gipuzkoa',  NULL, '20',  43.3390, -1.7886),
    ('Ermua',           'Bizkaia',   NULL, '48',  43.1897, -2.5011),
    ('Durango',         'Bizkaia',   NULL, '48',  43.1706, -2.6325)
ON CONFLICT (nombre, provincia) DO NOTHING;

-- =============================================================
-- USUARIOS
-- =============================================================
INSERT INTO user_data.users
    (nombre, apellido, email, password_hash, municipality_id, sexo, age, role)
VALUES
    (
        'Test',
        'User',
        'test@sustraiapp.com',
        '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG',
        1,          -- Bilbao
        'otro',
        30,
        'user'
    ),
    (
        'Admin',
        'User',
        'admin@sustraiapp.com',
        '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG',
        1,          -- Bilbao
        'otro',
        30,
        'admin'
    )
ON CONFLICT (email) DO NOTHING;


-- =============================================================
-- INTERESES
-- Estructura:
--   level 0 → raíz (Eventos, Gastronomía, Puntos de Interés)
--   level 1 → categoría
--   level 2 → subcategoría
-- =============================================================

-- -----------------------------------------------------------
-- Raíces (level 0)
-- -----------------------------------------------------------
INSERT INTO user_data.interests (nombre, father_id, level) VALUES
    ('Eventos',            NULL, 0),   -- id 1
    ('Gastronomía',        NULL, 0),   -- id 2
    ('Puntos de Interés',  NULL, 0)    -- id 3
ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------
-- Eventos — categorías directas (level 1, father = Eventos)
-- -----------------------------------------------------------
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Eventos' AND level = 0), 1
FROM (VALUES
    ('Concierto'),
    ('Festival'),
    ('Fiestas'),
    ('Feria'),
    ('Teatro'),
    ('Danza'),
    ('Conferencia'),
    ('Eventos/Jornadas'),
    ('Presentación'),
    ('Cine y Audiovisuales'),
    ('Bertsolarismo'),
    ('Exposición'),
    ('Formación'),
    ('Concurso')
) AS t(nombre)
ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------
-- Gastronomía — categorías (level 1, father = Gastronomía)
-- -----------------------------------------------------------
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Gastronomía' AND level = 0), 1
FROM (VALUES
    ('Restaurantes'),
    ('Bodegas'),
    ('Queserías'),
    ('Gourmet')
) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Restaurantes → subcategorías (level 2)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Restaurantes' AND level = 1), 2
FROM (VALUES
    ('Restaurante'),
    ('Asador'),
    ('Sidrería')
) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Gourmet → subcategorías (level 2)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Gourmet' AND level = 1), 2
FROM (VALUES
    ('Agricultura Ecológica'),
    ('Denominación de Origen'),
    ('Eusko Label'),
    ('Euskal Baserri')
) AS t(nombre)
ON CONFLICT DO NOTHING;


-- -----------------------------------------------------------
-- Puntos de Interés — categorías (level 1)
-- -----------------------------------------------------------
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Puntos de Interés' AND level = 0), 1
FROM (VALUES
    ('Museos'),
    ('Patrimonio Cultural')
) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Museos → subcategorías (level 2)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Museos' AND level = 1), 2
FROM (VALUES
    ('Historia'),
    ('Ciencias Naturales'),
    ('Arte'),
    ('Etnografía')
) AS t(nombre)
ON CONFLICT DO NOTHING;