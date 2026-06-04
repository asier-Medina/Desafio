-- =============================================================
-- SUSTRAIAPP — Esquema Final Unificado
-- Basado en init.sql (v3) + sustraiapp_normalized.sql (v4)
-- Cambios principales:
--   · gastronomy: google_place_id → external_id (opcional)
--                 eliminados michelin y repsol (→ gastronomy_qualifications)
--   · culture:    eliminados google_place_id y kulturklik_id → external_id
--                 DEFAULT fuente cambiado a 'Manual'
--                 eliminado CONSTRAINT culture_requires_external_id (roto)
--   · reviews:    tres tablas separadas (event_reviews, gastronomy_reviews, culture_reviews)
--   · seed evento: id_kulturklik → external_id
--   · añadido seed de qualifications + gastronomy_qualifications
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
    external_id         VARCHAR(100) UNIQUE,
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
    external_id             VARCHAR(100) UNIQUE,        -- antes: google_place_id NOT NULL UNIQUE
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
    is_sponsored            BOOLEAN DEFAULT FALSE,
    active                  BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gastro_municipality_active
    ON market_data.gastronomy (municipality_id, active);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS market_data.culture (
    id                  SERIAL PRIMARY KEY,
    external_id         VARCHAR(100) UNIQUE,            -- antes: google_place_id + kulturklik_id separados
    fuente              VARCHAR(50)  NOT NULL DEFAULT 'Manual'
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
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- CONSTRAINT culture_requires_external_id eliminado:
    -- google_place_id y kulturklik_id ya no existen como columnas separadas
);

CREATE INDEX IF NOT EXISTS idx_culture_municipality ON market_data.culture (municipality_id);
CREATE INDEX IF NOT EXISTS idx_culture_active       ON market_data.culture (active);
CREATE INDEX IF NOT EXISTS idx_culture_tipo_lugar   ON market_data.culture (tipo_lugar);


-- -------------------------------------------------------------------
-- Cualificaciones
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS market_data.qualifications (
    id      SERIAL PRIMARY KEY,
    codigo  VARCHAR(50)  UNIQUE,
    nombre  VARCHAR(100) NOT NULL
);

-- Catálogo inicial
INSERT INTO market_data.qualifications (codigo, nombre) VALUES
    ('repsol_sol',          'Sol Repsol'),
    ('michelin_estrella',   'Estrella Michelin'),
    ('denominacion_origen', 'Denominación de Origen'),
    ('q_calidad',           'Q de Calidad Turística'),
    ('euskolabel',          'Eusko Label'),
    ('agricultura_eco',     'Agricultura Ecológica'),
    ('euskal_baserri',      'Euskal Baserri')
ON CONFLICT (codigo) DO NOTHING;

-- Relación gastronomy ↔ qualifications
CREATE TABLE IF NOT EXISTS market_data.gastronomy_qualifications (
    id                  SERIAL PRIMARY KEY,
    gastronomy_id       INTEGER NOT NULL REFERENCES market_data.gastronomy(id)     ON DELETE CASCADE,
    qualification_id    INTEGER NOT NULL REFERENCES market_data.qualifications(id) ON DELETE RESTRICT,
    UNIQUE (gastronomy_id, qualification_id)
);

CREATE INDEX IF NOT EXISTS idx_gastro_qualif_gastronomy
    ON market_data.gastronomy_qualifications (gastronomy_id);
CREATE INDEX IF NOT EXISTS idx_gastro_qualif_qualification
    ON market_data.gastronomy_qualifications (qualification_id);

-- Vista con cualificaciones agregadas
CREATE OR REPLACE VIEW market_data.gastronomy_with_qualifications AS
SELECT
    g.id,
    g.nombre,
    g.municipality_id,
    g.valoracion,
    g.active,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id',     q.id,
                'nombre', q.nombre
            )
        ) FILTER (WHERE q.id IS NOT NULL),
        '[]'
    ) AS cualificaciones
FROM market_data.gastronomy g
LEFT JOIN market_data.gastronomy_qualifications gq ON gq.gastronomy_id = g.id
LEFT JOIN market_data.qualifications            q  ON q.id = gq.qualification_id
GROUP BY g.id;


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
    user_id     INTEGER NOT NULL REFERENCES user_data.users(id_user)  ON DELETE CASCADE,
    event_id    INTEGER NOT NULL REFERENCES market_data.events(id)    ON DELETE CASCADE,
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
    user_id     INTEGER NOT NULL REFERENCES user_data.users(id_user)  ON DELETE CASCADE,
    culture_id  INTEGER NOT NULL REFERENCES market_data.culture(id)   ON DELETE CASCADE,
    puntuacion  INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    texto       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, culture_id)
);

CREATE INDEX IF NOT EXISTS idx_culture_reviews_culture ON user_data.culture_reviews (culture_id);

-- -------------------------------------------------------------------
-- Favoritos
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
-- SUSTRAIAPP — Seed Data Completa
-- Cubre todas las tablas del esquema final unificado
-- Datos realistas del País Vasco / Euskadi
-- =============================================================


-- =============================================================
-- shared.municipalities (ampliado)
-- =============================================================

INSERT INTO shared.municipalities (nombre, provincia, nora_code, province_code, lat, lng) VALUES
    ('Bilbao',          'Bizkaia',  NULL, '48', 43.2630, -2.9350),
    ('Getxo',           'Bizkaia',  NULL, '48', 43.3563, -3.0097),
    ('Barakaldo',       'Bizkaia',  NULL, '48', 43.2963, -2.9942),
    ('San Sebastián',   'Gipuzkoa', NULL, '20', 43.3183, -1.9812),
    ('Vitoria-Gasteiz', 'Álava',    NULL, '01', 42.8469, -2.6728),
    ('Irún',            'Gipuzkoa', NULL, '20', 43.3390, -1.7886),
    ('Ermua',           'Bizkaia',  NULL, '48', 43.1897, -2.5011),
    ('Durango',         'Bizkaia',  NULL, '48', 43.1706, -2.6325),
    ('Leioa',           'Bizkaia',  NULL, '48', 43.3288, -2.9899),
    ('Zarautz',         'Gipuzkoa', NULL, '20', 43.2847, -2.1724),
    ('Hondarribia',     'Gipuzkoa', NULL, '20', 43.3722, -1.7961),
    ('Tolosa',          'Gipuzkoa', NULL, '20', 43.1368, -2.0785),
    ('Llodio',          'Álava',    NULL, '01', 43.1403, -2.9742),
    ('Amurrio',         'Álava',    NULL, '01', 43.0534, -3.0011),
    ('Bermeo',          'Bizkaia',  NULL, '48', 43.4226, -2.7244)
ON CONFLICT (nombre, provincia) DO NOTHING;


-- =============================================================
-- market_data.qualifications
-- =============================================================

INSERT INTO market_data.qualifications (codigo, nombre) VALUES
    ('repsol_sol',          'Sol Repsol'),
    ('michelin_estrella',   'Estrella Michelin'),
    ('denominacion_origen', 'Denominación de Origen'),
    ('q_calidad',           'Q de Calidad Turística'),
    ('euskolabel',          'Eusko Label'),
    ('agricultura_eco',     'Agricultura Ecológica'),
    ('euskal_baserri',      'Euskal Baserri')
ON CONFLICT (codigo) DO NOTHING;


-- =============================================================
-- market_data.events
-- =============================================================

INSERT INTO market_data.events
    (external_id, municipality_id, type, subtipo, start_date, end_date,
     publication_date, language, price_eur, is_free, is_sponsored,
     establishment, place, company, active)
VALUES
    -- Bilbao
    ('EVT-001', 1, 'Concierto', 'Rock', '2026-06-14 20:00:00+02', '2026-06-14 23:00:00+02',
     '2026-05-01 10:00:00+02', 'es', 25.00, FALSE, FALSE,
     'Bilbao Arena', 'Bilbao Arena', 'Promotora Vasca', TRUE),

    ('EVT-002', 1, 'Festival', 'Música', '2026-07-01 17:00:00+02', '2026-07-03 02:00:00+02',
     '2026-05-10 10:00:00+02', 'es', 45.00, FALSE, TRUE,
     'Parque Europa', 'Parque Europa Bilbao', 'BBK Live', TRUE),

    ('EVT-003', 1, 'Exposición', 'Arte Moderno', '2026-06-01 10:00:00+02', '2026-08-31 20:00:00+02',
     '2026-05-15 10:00:00+02', 'es', 14.00, FALSE, FALSE,
     'Museo Guggenheim', 'Guggenheim Bilbao', 'Guggenheim Bilbao Museoa', TRUE),

    ('EVT-004', 1, 'Fiestas', 'Semana Grande', '2026-08-15 12:00:00+02', '2026-08-22 23:59:00+02',
     '2026-06-01 10:00:00+02', 'es', 0.00, TRUE, FALSE,
     NULL, 'Casco Viejo Bilbao', 'Ayuntamiento de Bilbao', TRUE),

    ('EVT-005', 1, 'Teatro', 'Drama', '2026-06-20 19:30:00+02', '2026-06-20 21:30:00+02',
     '2026-05-20 10:00:00+02', 'eu', 18.00, FALSE, FALSE,
     'Teatro Arriaga', 'Teatro Arriaga', 'Sociedad Bilbaína', TRUE),

    -- San Sebastián
    ('EVT-006', 4, 'Festival', 'Cine', '2026-09-18 10:00:00+02', '2026-09-27 23:00:00+02',
     '2026-06-01 10:00:00+02', 'es', 12.00, FALSE, TRUE,
     'Kursaal', 'Palacio Kursaal', 'Festival de San Sebastián', TRUE),

    ('EVT-007', 4, 'Concierto', 'Jazz', '2026-07-20 21:00:00+02', '2026-07-20 23:30:00+02',
     '2026-06-10 10:00:00+02', 'es', 20.00, FALSE, FALSE,
     'Jazzaldia', 'Paseo de la Concha', 'Heineken Jazzaldia', TRUE),

    ('EVT-008', 4, 'Feria', 'Gastronomía', '2026-10-05 11:00:00+02', '2026-10-08 20:00:00+02',
     '2026-08-01 10:00:00+02', 'es', 0.00, TRUE, FALSE,
     'Mercado de San Martín', 'San Martín Kalea', 'Ayuntamiento de Donostia', TRUE),

    -- Vitoria-Gasteiz
    ('EVT-009', 5, 'Festival', 'Jazz', '2026-07-14 20:00:00+02', '2026-07-19 23:59:00+02',
     '2026-05-25 10:00:00+02', 'es', 0.00, TRUE, TRUE,
     'Casco Medieval', 'Plaza de la Virgen Blanca', 'Festival de Jazz de Vitoria', TRUE),

    ('EVT-010', 5, 'Conferencia', 'Sostenibilidad', '2026-06-25 09:00:00+02', '2026-06-25 18:00:00+02',
     '2026-05-30 10:00:00+02', 'es', 30.00, FALSE, FALSE,
     'Palacio Europa', 'Avda. Gasteiz 85', 'Basque Ecodesign Center', TRUE),

    -- Getxo
    ('EVT-011', 2, 'Concierto', 'Blues', '2026-07-10 21:00:00+02', '2026-07-10 23:30:00+02',
     '2026-06-05 10:00:00+02', 'es', 0.00, TRUE, FALSE,
     'Getxo Blues', 'Puerto Viejo de Algorta', 'Ayuntamiento de Getxo', TRUE),

    -- Zarautz
    ('EVT-012', 10, 'Festival', 'Surf', '2026-08-01 09:00:00+02', '2026-08-07 20:00:00+02',
     '2026-06-15 10:00:00+02', 'es', 0.00, TRUE, FALSE,
     'Playa de Zarautz', 'Playa de Zarautz', 'Zarautz Surf Club', TRUE),

    -- Bermeo
    ('EVT-013', 15, 'Fiestas', 'San Pedro', '2026-06-27 12:00:00+02', '2026-06-30 23:59:00+02',
     '2026-05-20 10:00:00+02', 'eu', 0.00, TRUE, FALSE,
     NULL, 'Puerto de Bermeo', 'Ayuntamiento de Bermeo', TRUE),

    -- Durango
    ('EVT-014', 8, 'Feria', 'Libro Vasco', '2026-12-02 10:00:00+01', '2026-12-06 20:00:00+01',
     '2026-09-01 10:00:00+02', 'eu', 0.00, TRUE, FALSE,
     'Landako Gunea', 'Landako Gunea', 'Durangoko Azoka', TRUE),

    -- Barakaldo
    ('EVT-015', 3, 'Exposición', 'Fotografía', '2026-06-10 10:00:00+02', '2026-07-10 20:00:00+02',
     '2026-05-25 10:00:00+02', 'es', 0.00, TRUE, FALSE,
     'Bilbao Exhibition Centre', 'BEC Barakaldo', 'Foto Bilbao', TRUE)
ON CONFLICT (external_id) DO NOTHING;


-- =============================================================
-- market_data.gastronomy
-- =============================================================

INSERT INTO market_data.gastronomy
    (external_id, nombre, descripcion, municipality_id, lat, lng,
     type, tipo_comida, entorno, email, web,
     categoria, calidad, url_imagen, valoracion, num_resenas,
     nivel_precio, national_phone_number, is_sponsored, active)
VALUES
    -- Bilbao
    ('GOOG-gast-001', 'Azurmendi',
     'Restaurante de alta cocina vasca con tres estrellas Michelin. Cocina de autor con productos km0 del entorno.',
     1, 43.2712, -2.9511,
     'Restaurante', 'Vasca', 'Rural',
     'info@azurmendi.biz', 'https://www.azurmendi.biz',
     'Alta Cocina', TRUE, 'https://images.sustraiapp.com/gastro/azurmendi.jpg',
     4.8, 1240, 'alto', '+34 944 558 866', FALSE, TRUE),

    ('GOOG-gast-002', 'Restaurante Nerua',
     'Cocina vasca de vanguardia dentro del Museo Guggenheim. Una experiencia gastronómica única.',
     1, 43.2688, -2.9340,
     'Restaurante', 'Vasca Creativa', 'Urbano',
     'nerua@guggenheim-bilbao.es', 'https://www.nerua.com',
     'Alta Cocina', TRUE, 'https://images.sustraiapp.com/gastro/nerua.jpg',
     4.6, 870, 'alto', '+34 944 000 430', FALSE, TRUE),

    ('GOOG-gast-003', 'La Viña del Ensanche',
     'Bar referente del Ensanche bilbaíno. Famoso por sus pintxos y su ambiente animado.',
     1, 43.2605, -2.9262,
     'Bar', 'Pintxos', 'Urbano',
     NULL, 'https://lavinadelensanche.com',
     'Bar de Pintxos', FALSE, 'https://images.sustraiapp.com/gastro/lavina.jpg',
     4.4, 2100, 'medio', '+34 944 155 615', FALSE, TRUE),

    ('GOOG-gast-004', 'Sidrería Petritegi',
     'Sidrería tradicional con manzanos propios en Astigarraga. Menú de sidrería con chuleta a la brasa.',
     4, 43.2900, -1.9411,
     'Sidrería', 'Vasca', 'Rural',
     'info@petritegi.com', 'https://www.petritegi.com',
     'Sidrería', FALSE, 'https://images.sustraiapp.com/gastro/petritegi.jpg',
     4.5, 1530, 'medio', '+34 943 457 188', FALSE, TRUE),

    ('GOOG-gast-005', 'Arzak',
     'Restaurante mítico con tres estrellas Michelin. Juan Mari y Elena Arzak, pioneros de la Nueva Cocina Vasca.',
     4, 43.3059, -1.9692,
     'Restaurante', 'Vasca Creativa', 'Urbano',
     'arzak@arzak.es', 'https://www.arzak.es',
     'Alta Cocina', TRUE, 'https://images.sustraiapp.com/gastro/arzak.jpg',
     4.9, 3200, 'alto', '+34 943 278 465', FALSE, TRUE),

    ('GOOG-gast-006', 'Bar Nestor',
     'Bar emblemático en el Parte Viejo donostiarra. Tortilla de patata a fuego lento y chuletón de vaca.',
     4, 43.3238, -1.9766,
     'Bar', 'Pintxos', 'Casco Histórico',
     NULL, NULL,
     'Bar de Pintxos', FALSE, 'https://images.sustraiapp.com/gastro/nestor.jpg',
     4.7, 4100, 'bajo', '+34 943 422 873', FALSE, TRUE),

    ('GOOG-gast-007', 'Bodega El Fabulista',
     'Bodega histórica en el corazón del casco medieval de Vitoria. Txakoli y vinos de Rioja Alavesa.',
     5, 42.8502, -2.6715,
     'Bar', 'Pintxos', 'Casco Histórico',
     'elfabulista@gmail.com', 'https://elfabulista.com',
     'Bar de Pintxos', FALSE, 'https://images.sustraiapp.com/gastro/elfabulista.jpg',
     4.3, 960, 'bajo', '+34 945 162 213', FALSE, TRUE),

    ('GOOG-gast-008', 'Asador Etxebarri',
     'Asador de fuego mundialmente reconocido. Victor Arguinzoniz y su cocina a las brasas, entre los mejores del mundo.',
     8, 43.1750, -2.6211,
     'Asador', 'Vasca', 'Rural',
     'info@asadoretxebarri.com', 'https://www.asadoretxebarri.com',
     'Alta Cocina', TRUE, 'https://images.sustraiapp.com/gastro/etxebarri.jpg',
     4.9, 2700, 'alto', '+34 946 583 042', TRUE, TRUE),

    ('GOOG-gast-009', 'Txakoli Itsasmendi',
     'Bodega con viñedos en altura en Bermeo. Txakoli D.O. Bizkaiko Txakolina con vistas al mar.',
     15, 43.4180, -2.7130,
     'Bodega', 'Vasca', 'Rural',
     'itsasmendi@itsasmendi.com', 'https://www.itsasmendi.com',
     'Bodega', FALSE, 'https://images.sustraiapp.com/gastro/itsasmendi.jpg',
     4.6, 540, 'medio', '+34 946 884 314', FALSE, TRUE),

    ('GOOG-gast-010', 'Restaurante Arbidel',
     'Cocina de mercado en Getxo con producto fresco del Cantábrico. Terraza con vistas al Puerto Viejo.',
     2, 43.3571, -3.0102,
     'Restaurante', 'Pescados y Mariscos', 'Costero',
     'info@arbidel.com', NULL,
     'Restaurante', FALSE, 'https://images.sustraiapp.com/gastro/arbidel.jpg',
     4.2, 380, 'medio', '+34 944 910 005', FALSE, TRUE),

    ('GOOG-gast-011', 'Caserio Zabalegi',
     'Caserio ecológico en Tolosa. Productos propios con sello Eusko Label: queso de oveja, verduras y mermeladas.',
     12, 43.1350, -2.0740,
     'Restaurante', 'Vasca', 'Rural',
     'zabalegi@euskalbaserri.eus', NULL,
     'Restaurante', TRUE, 'https://images.sustraiapp.com/gastro/zabalegi.jpg',
     4.4, 210, 'medio', '+34 943 650 000', FALSE, TRUE),

    ('GOOG-gast-012', 'Bar Gandarias',
     'Histórico bar del Parte Viejo de San Sebastián. Pintxos premiados y carta de temporada.',
     4, 43.3236, -1.9770,
     'Bar', 'Pintxos', 'Casco Histórico',
     'info@bargandarias.com', 'https://www.bargandarias.com',
     'Bar de Pintxos', FALSE, 'https://images.sustraiapp.com/gastro/gandarias.jpg',
     4.5, 3400, 'medio', '+34 943 426 362', FALSE, TRUE)
ON CONFLICT (external_id) DO NOTHING;


-- =============================================================
-- market_data.gastronomy_qualifications
-- (relación restaurantes ↔ cualificaciones)
-- =============================================================

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE (g.external_id = 'GOOG-gast-001' AND q.codigo IN ('michelin_estrella', 'repsol_sol', 'euskolabel'))
   OR (g.external_id = 'GOOG-gast-002' AND q.codigo IN ('michelin_estrella', 'repsol_sol'))
   OR (g.external_id = 'GOOG-gast-005' AND q.codigo IN ('michelin_estrella', 'repsol_sol'))
   OR (g.external_id = 'GOOG-gast-008' AND q.codigo IN ('michelin_estrella', 'repsol_sol'))
   OR (g.external_id = 'GOOG-gast-009' AND q.codigo IN ('denominacion_origen', 'euskolabel'))
   OR (g.external_id = 'GOOG-gast-011' AND q.codigo IN ('euskal_baserri', 'agricultura_eco', 'euskolabel'))
   OR (g.external_id = 'GOOG-gast-004' AND q.codigo IN ('denominacion_origen'))
   OR (g.external_id = 'GOOG-gast-007' AND q.codigo IN ('denominacion_origen'))
ON CONFLICT (gastronomy_id, qualification_id) DO NOTHING;


-- =============================================================
-- market_data.culture
-- =============================================================

INSERT INTO market_data.culture
    (external_id, fuente, nombre, tipo_lugar, tipo_cultura, descripcion,
     precio, horario, telefono, email, web, web_amigable, imagen_url,
     municipality_id, direccion, codigo_postal,
     visita_guiada, capacidad, tienda,
     lat, lng, valoracion, numero_valoraciones, is_sponsored, active)
VALUES
    ('GPLC-001', 'Google Places', 'Museo Guggenheim Bilbao',
     'Museo', 'Arte Contemporáneo',
     'Museo de arte contemporáneo diseñado por Frank O. Gehry. Colección permanente e itinerante de alcance internacional.',
     '18€ adultos, 9€ reducida, gratis menores 12',
     '{"lunes": "cerrado", "martes_domingo": "10:00-20:00"}',
     '+34 944 359 080', 'info@guggenheim-bilbao.eus', 'https://www.guggenheim-bilbao.eus',
     'guggenheim-bilbao.eus', 'https://images.sustraiapp.com/culture/guggenheim.jpg',
     1, 'Abandoibarra Etorb. 2', '48009',
     TRUE, 2000, TRUE,
     43.2688, -2.9341, 4.7, 18500, TRUE, TRUE),

    ('GPLC-002', 'Google Places', 'Museo de Bellas Artes de Bilbao',
     'Museo', 'Bellas Artes',
     'Uno de los museos de bellas artes más importantes de España. Desde el medievo hasta el arte contemporáneo.',
     '10€ adultos, gratis menores 26 los martes',
     '{"lunes": "cerrado", "martes_domingo": "10:00-20:00"}',
     '+34 944 396 060', 'info@museobilbao.com', 'https://www.museobilbao.com',
     'museobilbao.com', 'https://images.sustraiapp.com/culture/bbaa.jpg',
     1, 'Museoa Plaza 2', '48009',
     TRUE, 1500, TRUE,
     43.2668, -2.9270, 4.5, 7400, FALSE, TRUE),

    ('KTLK-003', 'Kulturklik', 'Palacio Kursaal',
     'Sala de Eventos', 'Arquitectura',
     'Emblemático palacio de congresos y auditorio diseñado por Rafael Moneo. Sede del Festival de Cine de San Sebastián.',
     'Variable según evento',
     '{"lunes_domingo": "según programación"}',
     '+34 943 003 000', 'info@kursaal.eus', 'https://www.kursaal.eus',
     'kursaal.eus', 'https://images.sustraiapp.com/culture/kursaal.jpg',
     4, 'Av. de Zurriola 1', '20002',
     TRUE, 1800, FALSE,
     43.3220, -1.9766, 4.6, 5200, FALSE, TRUE),

    ('GPLC-004', 'Google Places', 'Aquarium de San Sebastián',
     'Museo', 'Ciencias Naturales',
     'Acuario oceanográfico con peces del Cantábrico, tiburones y una impresionante galería submarina.',
     '15€ adultos, 8€ niños',
     '{"lunes_domingo": "10:00-19:00"}',
     '+34 943 440 099', 'info@aquariumss.com', 'https://www.aquariumss.com',
     'aquariumss.com', 'https://images.sustraiapp.com/culture/aquarium.jpg',
     4, 'Pl. de Carlos Blasco de Imaz 1', '20003',
     TRUE, 800, TRUE,
     43.3193, -1.9900, 4.4, 9300, FALSE, TRUE),

    ('OPDT-005', 'Open Data', 'Catedral de Santa María',
     'Patrimonio', 'Patrimonio Cultural',
     'Catedral gótica del s.XIV en el corazón del casco medieval de Vitoria-Gasteiz. Patrimonio de la Humanidad candidato.',
     '5€ adultos, 3€ reducida',
     '{"lunes_sabado": "10:00-14:00 / 16:00-18:30", "domingo": "11:00-14:00"}',
     '+34 945 255 135', 'visitas@catedralvitoria.com', 'https://www.catedralvitoria.com',
     'catedralvitoria.com', 'https://images.sustraiapp.com/culture/catedral_vitoria.jpg',
     5, 'Cuchillería 95', '01001',
     TRUE, 500, TRUE,
     42.8517, -2.6729, 4.8, 3100, FALSE, TRUE),

    ('GPLC-006', 'Google Places', 'Artium — Museo Vasco de Arte Contemporáneo',
     'Museo', 'Arte Contemporáneo',
     'Centro-museo de arte contemporáneo con énfasis en artistas vascos. Colección en continua expansión.',
     '8€ adultos, gratis menores 18',
     '{"martes_viernes": "11:00-14:00 / 17:00-21:00", "sabado_domingo": "11:00-21:00", "lunes": "cerrado"}',
     '+34 945 209 020', 'artium@artium.eus', 'https://www.artium.eus',
     'artium.eus', 'https://images.sustraiapp.com/culture/artium.jpg',
     5, 'Francia 24', '01002',
     TRUE, 600, TRUE,
     42.8480, -2.6731, 4.3, 2700, FALSE, TRUE),

    ('GPLC-007', 'Google Places', 'Puente Colgante de Bizkaia',
     'Monumento', 'Patrimonio Cultural',
     'Primer puente transbordador del mundo. Patrimonio Mundial UNESCO desde 2006. Une Getxo y Portugalete.',
     '9€ pasarela superior, 0.45€ góndola',
     '{"lunes_domingo": "10:00-14:00 / 16:00-20:00"}',
     '+34 944 801 012', 'info@puente-colgante.com', 'https://www.puente-colgante.com',
     'puente-colgante.com', 'https://images.sustraiapp.com/culture/puentecolgante.jpg',
     2, 'Av. de Repélaga 1, Getxo', '48993',
     TRUE, NULL, TRUE,
     43.3233, -3.0173, 4.8, 12000, TRUE, TRUE),

    ('KTLK-008', 'Kulturklik', 'Museo Chillida-Leku',
     'Museo', 'Escultura',
     'Museo-jardín del escultor Eduardo Chillida. Esculturas monumentales en un caserío del s.XVI rodeado de hayas.',
     '14€ adultos, 7€ reducida',
     '{"martes_domingo": "10:00-15:00", "lunes": "cerrado"}',
     '+34 943 336 006', 'info@museochillidaleku.com', 'https://www.museochillidaleku.com',
     'museochillidaleku.com', 'https://images.sustraiapp.com/culture/chillidaleku.jpg',
     4, 'Jáuregui 66, Hernani (San Sebastián)', '20120',
     TRUE, 300, TRUE,
     43.2530, -1.9880, 4.9, 4800, FALSE, TRUE),

    ('OPDT-009', 'Open Data', 'San Juan de Gaztelugatxe',
     'Monumento', 'Patrimonio Natural',
     'Islote unido a la costa por un puente de piedra con 241 escalones. Ermita románica del s.X. Paisaje único del litoral vizcaíno.',
     'Gratuito (reserva obligatoria en verano)',
     '{"lunes_domingo": "09:00-20:00"}',
     NULL, NULL, 'https://www.gaztelugatxe.eus',
     'gaztelugatxe.eus', 'https://images.sustraiapp.com/culture/gaztelugatxe.jpg',
     15, 'Camino Gaztelugatxe, Bermeo', '48370',
     FALSE, NULL, FALSE,
     43.4459, -2.7726, 4.9, 21000, FALSE, TRUE),

    ('GPLC-010', 'Google Places', 'Museo Euskal Herria',
     'Museo', 'Historia y Etnografía',
     'Museo de historia vasca en un palacio barroco del s.XVII. Etnografía, arte, historia y vida tradicional vasca.',
     '3€ adultos, gratis domingos',
     '{"martes_sabado": "10:00-14:00 / 16:00-19:30", "domingo": "10:30-13:30", "lunes": "cerrado"}',
     '+34 946 255 451', 'museoa@bizkaia.eus', 'https://www.bizkaikoa.bizkaia.eus',
     'bizkaikoa.bizkaia.eus', 'https://images.sustraiapp.com/culture/euskalherria.jpg',
     8, 'Josef Maria Arizmendiarrietaren pl. 1, Durango', '48200',
     TRUE, 400, FALSE,
     43.1703, -2.6331, 4.2, 1100, FALSE, TRUE),

    ('GPLC-011', 'Google Places', 'Torre Azkuna Centro',
     'Centro Cultural', 'Arquitectura',
     'Centro cultural en una bodega modernista rehabilitada por Philippe Starck. Piscina de fondo transparente, exposiciones y actividades.',
     'Gratuito (actividades con precio variable)',
     '{"lunes_domingo": "07:00-23:00"}',
     '+34 944 012 014', 'info@torreazkunazentroa.eus', 'https://www.torreazkunazentroa.eus',
     'torreazkunazentroa.eus', 'https://images.sustraiapp.com/culture/torrearzkuna.jpg',
     1, 'Arriquibar pl. 4', '48010',
     FALSE, 1200, FALSE,
     43.2625, -2.9344, 4.6, 6700, FALSE, TRUE),

    ('OPDT-012', 'Open Data', 'Casco Viejo de Hondarribia',
     'Casco Histórico', 'Patrimonio Cultural',
     'Conjunto medieval amurallado declarado Monumento Nacional. Palacios renacentistas, calles empedradas y la iglesia de Santa María.',
     'Gratuito',
     '{"lunes_domingo": "00:00-23:59"}',
     NULL, 'turismo@hondarribia.eus', 'https://www.hondarribia.eus',
     'hondarribia.eus', 'https://images.sustraiapp.com/culture/hondarribia.jpg',
     11, 'Casco Histórico, Hondarribia', '20280',
     TRUE, NULL, FALSE,
     43.3693, -1.7962, 4.8, 8900, FALSE, TRUE)
ON CONFLICT (external_id) DO NOTHING;


-- =============================================================
-- user_data.users
-- password_hash = '12345678' (bcrypt cost 12)
-- =============================================================

INSERT INTO user_data.users
    (nombre, apellido, email, password_hash, tlf, municipality_id, sexo, age, role)
VALUES
    ('Test',    'User',      'test@sustraiapp.com',   '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', NULL,           1,  'otro',   30, 'user'),
    ('Admin',   'User',      'admin@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', NULL,           1,  'otro',   30, 'admin'),
    ('Ane',     'Goikoetxea','ane@sustraiapp.com',    '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34 600111222', 1, 'mujer',  27, 'user'),
    ('Mikel',   'Zabala',    'mikel@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34 600333444', 4, 'hombre', 34, 'user'),
    ('Leire',   'Txurruka',  'leire@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34 600555666', 5, 'mujer',  22, 'user'),
    ('Jon',     'Etxeberria','jon@sustraiapp.com',    '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34 600777888', 2, 'hombre', 41, 'user'),
    ('Miren',   'Larrañaga', 'miren@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', NULL,           8, 'mujer',  29, 'user'),
    ('Gorka',   'Urrutia',   'gorka@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34 600999000', 1, 'hombre', 38, 'user')
ON CONFLICT (email) DO NOTHING;


-- =============================================================
-- user_data.interests
-- =============================================================

-- Raíces (level 0)
INSERT INTO user_data.interests (nombre, father_id, level) VALUES
    ('Eventos',            NULL, 0),
    ('Gastronomía',        NULL, 0),
    ('Puntos de Interés',  NULL, 0)
ON CONFLICT DO NOTHING;

-- Eventos — categorías (level 1)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Eventos' AND level = 0), 1
FROM (VALUES
    ('Concierto'), ('Festival'), ('Fiestas'), ('Feria'), ('Teatro'),
    ('Danza'), ('Conferencia'), ('Eventos/Jornadas'), ('Presentación'),
    ('Cine y Audiovisuales'), ('Bertsolarismo'), ('Exposición'),
    ('Formación'), ('Concurso')
) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Gastronomía — categorías (level 1)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Gastronomía' AND level = 0), 1
FROM (VALUES ('Restaurantes'), ('Bodegas'), ('Queserías'), ('Gourmet'))
AS t(nombre) ON CONFLICT DO NOTHING;

-- Restaurantes → subcategorías (level 2)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Restaurantes' AND level = 1), 2
FROM (VALUES ('Restaurante'), ('Asador'), ('Sidrería')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Gourmet → subcategorías (level 2)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Gourmet' AND level = 1), 2
FROM (VALUES
    ('Agricultura Ecológica'), ('Denominación de Origen'),
    ('Eusko Label'), ('Euskal Baserri')
) AS t(nombre) ON CONFLICT DO NOTHING;

-- Puntos de Interés — categorías (level 1)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Puntos de Interés' AND level = 0), 1
FROM (VALUES ('Museos'), ('Patrimonio Cultural')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Museos → subcategorías (level 2)
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Museos' AND level = 1), 2
FROM (VALUES ('Historia'), ('Ciencias Naturales'), ('Arte'), ('Etnografía'))
AS t(nombre) ON CONFLICT DO NOTHING;


-- =============================================================
-- user_data.user_interests
-- =============================================================

INSERT INTO user_data.user_interests (id_user, id_interes)
SELECT u.id_user, i.id_interes FROM user_data.users u, user_data.interests i
WHERE
    -- Ane: conciertos, festivales, gastronomía, museos
    (u.email = 'ane@sustraiapp.com'   AND i.nombre IN ('Concierto', 'Festival', 'Gastronomía', 'Restaurantes', 'Museos', 'Arte'))
    -- Mikel: pintxos, alta cocina, patrimonio, bertsolarismo
 OR (u.email = 'mikel@sustraiapp.com' AND i.nombre IN ('Bertsolarismo', 'Fiestas', 'Restaurantes', 'Asador', 'Patrimonio Cultural'))
    -- Leire: exposiciones, teatro, danza, gourmet ecológico
 OR (u.email = 'leire@sustraiapp.com' AND i.nombre IN ('Exposición', 'Teatro', 'Danza', 'Gourmet', 'Agricultura Ecológica', 'Euskal Baserri'))
    -- Jon: festivales de música, sidrerías, naturaleza
 OR (u.email = 'jon@sustraiapp.com'   AND i.nombre IN ('Festival', 'Concierto', 'Sidrería', 'Patrimonio Cultural'))
    -- Miren: museos, historia, cine, bodegas
 OR (u.email = 'miren@sustraiapp.com' AND i.nombre IN ('Museos', 'Historia', 'Cine y Audiovisuales', 'Bodegas', 'Denominación de Origen'))
    -- Gorka: deportes, gastronomía en general, ferias
 OR (u.email = 'gorka@sustraiapp.com' AND i.nombre IN ('Feria', 'Gastronomía', 'Restaurantes', 'Gourmet', 'Museos'))
ON CONFLICT DO NOTHING;


-- =============================================================
-- user_data.preferences
-- =============================================================

INSERT INTO user_data.preferences (user_id, rango_precio, movilidad_reducida, municipios_interes)
SELECT id_user, pref.rango, pref.mov, pref.munis
FROM user_data.users u
JOIN (VALUES
    ('ane@sustraiapp.com',   'medio', FALSE, ARRAY[1,4,2]),
    ('mikel@sustraiapp.com', 'alto',  FALSE, ARRAY[4,1,10]),
    ('leire@sustraiapp.com', 'bajo',  FALSE, ARRAY[5,1,8]),
    ('jon@sustraiapp.com',   'medio', FALSE, ARRAY[2,1,15]),
    ('miren@sustraiapp.com', 'medio', TRUE,  ARRAY[8,1,5]),
    ('gorka@sustraiapp.com', 'alto',  FALSE, ARRAY[1,4,2])
) AS pref(email, rango, mov, munis) ON u.email = pref.email
ON CONFLICT (user_id) DO NOTHING;


-- =============================================================
-- user_data.event_reviews
-- =============================================================

INSERT INTO user_data.event_reviews (user_id, event_id, puntuacion, texto)
SELECT u.id_user, e.id, r.puntuacion, r.texto
FROM user_data.users u
JOIN (VALUES
    ('ane@sustraiapp.com',   'EVT-003', 5, 'La exposición del Guggenheim es simplemente espectacular. Las piezas de la colección permanente son impresionantes.'),
    ('ane@sustraiapp.com',   'EVT-007', 5, 'El concierto de jazz en la Concha fue mágico. Ambiente inmejorable bajo las estrellas.'),
    ('mikel@sustraiapp.com', 'EVT-004', 4, 'Las fiestas de la Semana Grande tienen una energía increíble. El ambiente del Casco Viejo no tiene precio.'),
    ('mikel@sustraiapp.com', 'EVT-005', 5, 'Teatro Arriaga en plena forma. Actuación en euskera de primer nivel, muy emocionante.'),
    ('leire@sustraiapp.com', 'EVT-003', 4, 'Impresionante. El edificio ya es una obra de arte, pero la exposición temporal lo superaba todo.'),
    ('leire@sustraiapp.com', 'EVT-010', 4, 'Conferencia muy interesante sobre sostenibilidad. Los ponentes vinieron de toda Europa.'),
    ('jon@sustraiapp.com',   'EVT-002', 5, 'BBK Live en su mejor edición. Cartel increíble y organización impecable. Volvería sin dudarlo.'),
    ('jon@sustraiapp.com',   'EVT-012', 4, 'Festival de surf de Zarautz con olas perfectas. El ambiente de playa todo el día.'),
    ('miren@sustraiapp.com', 'EVT-006', 5, 'El Festival de Cine de San Sebastián es un evento de categoría mundial. Una experiencia única.'),
    ('miren@sustraiapp.com', 'EVT-014', 5, 'La Durangoko Azoka es el alma de la cultura vasca. Imprescindible si te interesa Euskal Herria.'),
    ('gorka@sustraiapp.com', 'EVT-001', 3, 'Buen concierto aunque el recinto podría mejorar la acústica. Bien de precio.'),
    ('gorka@sustraiapp.com', 'EVT-008', 5, 'La Feria de Gastronomía de San Sebastián es un festival para los sentidos. Pintxos de nivel altísimo.')
) AS r(email, ext_id, puntuacion, texto) ON u.email = r.email
JOIN market_data.events e ON e.external_id = r.ext_id
ON CONFLICT (user_id, event_id) DO NOTHING;


-- =============================================================
-- user_data.gastronomy_reviews
-- =============================================================

INSERT INTO user_data.gastronomy_reviews (user_id, gastro_id, puntuacion, texto)
SELECT u.id_user, g.id, r.puntuacion, r.texto
FROM user_data.users u
JOIN (VALUES
    ('ane@sustraiapp.com',   'GOOG-gast-003', 5, 'La Viña del Ensanche es el bar de pintxos perfecto. El bacalao y el txangurro son espectaculares.'),
    ('ane@sustraiapp.com',   'GOOG-gast-009', 4, 'Txakoli Itsasmendi con vistas al Cantábrico, no se puede pedir más. El Urezti 7 es memorable.'),
    ('mikel@sustraiapp.com', 'GOOG-gast-008', 5, 'Etxebarri es una experiencia de vida. Las angulas, el txuleto, el foie. Imposible describirlo sin haber estado.'),
    ('mikel@sustraiapp.com', 'GOOG-gast-006', 5, 'Bar Nestor es intocable. La tortilla hay que reservarla sí o sí. Una institución.'),
    ('leire@sustraiapp.com', 'GOOG-gast-011', 5, 'El Caserío Zabalegi es lo que busco: producto local, honesto y sostenible. La mermelada de manzana, de otro mundo.'),
    ('leire@sustraiapp.com', 'GOOG-gast-007', 4, 'El Fabulista es el pintxo de Vitoria que cualquiera recomendaría. Buen txakoli y ambiente genial.'),
    ('jon@sustraiapp.com',   'GOOG-gast-004', 5, 'Sidrería Petritegi: el ritual de la sidrería vasca en su máxima expresión. La chuleta, brutal.'),
    ('jon@sustraiapp.com',   'GOOG-gast-010', 4, 'Pescado fresco en Getxo con vistas al puerto. Servicio atento y carta bien calibrada.'),
    ('miren@sustraiapp.com', 'GOOG-gast-005', 5, 'Arzak es pura magia. Cada plato cuenta una historia. Una de las mejores experiencias gastronómicas de mi vida.'),
    ('miren@sustraiapp.com', 'GOOG-gast-012', 4, 'Bar Gandarias con un nivel constante temporada tras temporada. Los pintxos calientes son lo mejor.'),
    ('gorka@sustraiapp.com', 'GOOG-gast-001', 5, 'Azurmendi merecía cada una de sus estrellas. El menú degustación es un viaje por el paisaje vasco.'),
    ('gorka@sustraiapp.com', 'GOOG-gast-002', 5, 'Comer en el Nerua dentro del Guggenheim es una experiencia doble. La cocina y el entorno se complementan a la perfección.')
) AS r(email, ext_id, puntuacion, texto) ON u.email = r.email
JOIN market_data.gastronomy g ON g.external_id = r.ext_id
ON CONFLICT (user_id, gastro_id) DO NOTHING;


-- =============================================================
-- user_data.culture_reviews
-- =============================================================

INSERT INTO user_data.culture_reviews (user_id, culture_id, puntuacion, texto)
SELECT u.id_user, c.id, r.puntuacion, r.texto
FROM user_data.users u
JOIN (VALUES
    ('ane@sustraiapp.com',   'GPLC-001', 5, 'El Guggenheim nunca decepciona. La colección permanente te da perspectiva del arte de los últimos 50 años.'),
    ('ane@sustraiapp.com',   'GPLC-007', 5, 'Subir a la pasarela del Puente Colgante es una experiencia que todo el mundo debería vivir. Vistas increíbles.'),
    ('mikel@sustraiapp.com', 'OPDT-009', 5, 'San Juan de Gaztelugatxe es uno de los lugares más impresionantes de toda Euskadi. Los 241 escalones merecen cada paso.'),
    ('mikel@sustraiapp.com', 'GPLC-002', 4, 'El Museo de Bellas Artes tiene una colección sorprendentemente buena. Los martes gratis, un lujo.'),
    ('leire@sustraiapp.com', 'GPLC-006', 4, 'Artium hace una labor importante con el arte vasco contemporáneo. Buena programación y espacio muy cómodo.'),
    ('leire@sustraiapp.com', 'OPDT-005', 5, 'La Catedral de Santa María de Vitoria en obras es una experiencia única: puedes ver la historia en capas.'),
    ('jon@sustraiapp.com',   'GPLC-007', 5, 'El Puente Colgante desde abajo ya impone, pero cruzarlo por arriba es otra dimensión. UNESCO con razón.'),
    ('jon@sustraiapp.com',   'OPDT-012', 4, 'Hondarribia es un pueblo para perderse. El casco amurallado en piedra es precioso, especialmente al atardecer.'),
    ('miren@sustraiapp.com', 'KTLK-008', 5, 'Chillida-Leku es un museo-jardín que te cambia la percepción del espacio. Imprescindible.'),
    ('miren@sustraiapp.com', 'GPLC-010', 4, 'El Museo Euskal Herria de Durango explica muy bien la historia vasca. Poco masificado y muy bien conservado.'),
    ('gorka@sustraiapp.com', 'GPLC-011', 4, 'Torre Azkuna es el espacio cultural más original de Bilbao. La piscina con fondo de cristal no te la esperas.'),
    ('gorka@sustraiapp.com', 'GPLC-004', 4, 'El Aquarium de San Sebastián es perfecto para ir con niños o con quien no espera un acuario tan completo.')
) AS r(email, ext_id, puntuacion, texto) ON u.email = r.email
JOIN market_data.culture c ON c.external_id = r.ext_id
ON CONFLICT (user_id, culture_id) DO NOTHING;


-- =============================================================
-- user_data.favorites
-- =============================================================

INSERT INTO user_data.favorites (user_id, entidad_id, entidad_tipo)

-- Eventos favoritos
SELECT u.id_user, e.id, 'evento'
FROM user_data.users u, market_data.events e
WHERE
    (u.email = 'ane@sustraiapp.com'   AND e.external_id IN ('EVT-002', 'EVT-007'))
 OR (u.email = 'mikel@sustraiapp.com' AND e.external_id IN ('EVT-004', 'EVT-005', 'EVT-014'))
 OR (u.email = 'leire@sustraiapp.com' AND e.external_id IN ('EVT-003', 'EVT-010'))
 OR (u.email = 'jon@sustraiapp.com'   AND e.external_id IN ('EVT-002', 'EVT-012'))
 OR (u.email = 'miren@sustraiapp.com' AND e.external_id IN ('EVT-006', 'EVT-014'))
 OR (u.email = 'gorka@sustraiapp.com' AND e.external_id IN ('EVT-008', 'EVT-001'))

UNION ALL

-- Gastronomía favorita
SELECT u.id_user, g.id, 'gastronomia'
FROM user_data.users u, market_data.gastronomy g
WHERE
    (u.email = 'ane@sustraiapp.com'   AND g.external_id IN ('GOOG-gast-003', 'GOOG-gast-009'))
 OR (u.email = 'mikel@sustraiapp.com' AND g.external_id IN ('GOOG-gast-008', 'GOOG-gast-006', 'GOOG-gast-005'))
 OR (u.email = 'leire@sustraiapp.com' AND g.external_id IN ('GOOG-gast-011', 'GOOG-gast-004'))
 OR (u.email = 'jon@sustraiapp.com'   AND g.external_id IN ('GOOG-gast-004', 'GOOG-gast-003'))
 OR (u.email = 'miren@sustraiapp.com' AND g.external_id IN ('GOOG-gast-005', 'GOOG-gast-009'))
 OR (u.email = 'gorka@sustraiapp.com' AND g.external_id IN ('GOOG-gast-001', 'GOOG-gast-002', 'GOOG-gast-008'))

UNION ALL

-- Cultura favorita
SELECT u.id_user, c.id, 'cultura'
FROM user_data.users u, market_data.culture c
WHERE
    (u.email = 'ane@sustraiapp.com'   AND c.external_id IN ('GPLC-001', 'GPLC-007'))
 OR (u.email = 'mikel@sustraiapp.com' AND c.external_id IN ('OPDT-009', 'KTLK-003'))
 OR (u.email = 'leire@sustraiapp.com' AND c.external_id IN ('GPLC-006', 'KTLK-008'))
 OR (u.email = 'jon@sustraiapp.com'   AND c.external_id IN ('GPLC-007', 'OPDT-012'))
 OR (u.email = 'miren@sustraiapp.com' AND c.external_id IN ('KTLK-008', 'GPLC-002'))
 OR (u.email = 'gorka@sustraiapp.com' AND c.external_id IN ('GPLC-011', 'GPLC-001'))

ON CONFLICT (user_id, entidad_id, entidad_tipo) DO NOTHING;
