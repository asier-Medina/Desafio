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
    direccion               VARCHAR(255),
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
-- Reviews (Mantenemos estructura separada o única según prefieras, 
-- aquí dejo la versión única con CHECK constraint como en v2/v3)
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

CREATE INDEX IF NOT EXISTS idx_event_reviews_event   ON user_data.event_reviews (event_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_user    ON user_data.event_reviews (user_id);

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
-- SEED DATA — SUSTRAIAPP
-- País Vasco / Euskadi
-- =============================================================

-- =============================================================
-- shared.municipalities
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

-- IDs esperados (BD limpia): Bilbao=1, Getxo=2, Barakaldo=3, San Sebastián=4,
-- Vitoria-Gasteiz=5, Irún=6, Ermua=7, Durango=8, Leioa=9, Zarautz=10,
-- Hondarribia=11, Tolosa=12, Llodio=13, Amurrio=14, Bermeo=15


-- =============================================================
-- market_data.events (30 eventos)
-- =============================================================

INSERT INTO market_data.events
    (external_id, municipality_id, type, subtipo, start_date, end_date,
     publication_date, language, price_eur, is_free, is_sponsored,
     establishment, place, company, active)
VALUES
    -- Bilbao
    ('EVT-001', 1, 'Concierto',   'Rock',               '2026-06-14 20:00+02', '2026-06-14 23:00+02', '2026-05-01 10:00+02', 'es', 25.00, FALSE, FALSE, 'Bilbao Arena',          'Bilbao Arena, Bilbao',                  'Promotora Vasca SL',              TRUE),
    ('EVT-002', 1, 'Festival',    'Música',              '2026-07-04 17:00+02', '2026-07-06 02:00+02', '2026-05-10 10:00+02', 'es', 55.00, FALSE, TRUE,  'BBK Live Venue',        'Kobetamendi, Bilbao',                   'BBK Live SL',                     TRUE),
    ('EVT-003', 1, 'Exposición',  'Arte Contemporáneo',  '2026-06-01 10:00+02', '2026-08-31 20:00+02', '2026-05-15 10:00+02', 'es', 14.00, FALSE, FALSE, 'Museo Guggenheim',      'Abandoibarra 2, Bilbao',                'Guggenheim Bilbao Museoa',         TRUE),
    ('EVT-004', 1, 'Fiestas',     'Semana Grande',       '2026-08-15 12:00+02', '2026-08-22 23:59+02', '2026-06-01 10:00+02', 'es',  0.00, TRUE,  FALSE, NULL,                    'Casco Viejo, Bilbao',                   'Ayuntamiento de Bilbao',          TRUE),
    ('EVT-005', 1, 'Teatro',      'Ópera',               '2026-09-12 19:30+02', '2026-09-12 22:00+02', '2026-07-01 10:00+02', 'es', 35.00, FALSE, FALSE, 'Teatro Arriaga',        'Plaza Arriaga 1, Bilbao',               'ABAO Bilbao Opera',               TRUE),
    ('EVT-006', 1, 'Mercado',     'Artesanía',           '2026-06-20 10:00+02', '2026-06-22 20:00+02', '2026-05-25 10:00+02', 'es',  0.00, TRUE,  FALSE, 'Mercado de la Ribera',  'Erribera Kalea 22, Bilbao',             'Ayuntamiento de Bilbao',          TRUE),
    ('EVT-007', 1, 'Danza',       'Contemporánea',       '2026-07-15 20:00+02', '2026-07-15 21:30+02', '2026-06-01 10:00+02', 'eu', 18.00, FALSE, FALSE, 'Palacio Euskalduna',    'Abandoibarra 4, Bilbao',                'Dantzaz',                         TRUE),
    ('EVT-008', 1, 'Bertsolarismo','Txapelketa',         '2026-11-21 17:00+01', '2026-11-21 21:30+01', '2026-09-01 10:00+02', 'eu', 12.00, FALSE, FALSE, 'BEC Barakaldo',         'Ronda de Azkue 1, Barakaldo',           'Bertsozale Elkartea',             TRUE),
    -- San Sebastián
    ('EVT-009', 4, 'Festival',    'Cine',                '2026-09-18 10:00+02', '2026-09-27 23:00+02', '2026-06-01 10:00+02', 'es', 12.00, FALSE, TRUE,  'Kursaal',               'Av. Zurriola 1, Donostia',              'Festival Internacional de Cine',  TRUE),
    ('EVT-010', 4, 'Concierto',   'Jazz',                '2026-07-21 21:00+02', '2026-07-21 23:30+02', '2026-06-10 10:00+02', 'es',  0.00, TRUE,  FALSE, 'Jazzaldia',             'Paseo de la Concha, Donostia',          'Heineken Jazzaldia',              TRUE),
    ('EVT-011', 4, 'Feria',       'Gastronomía',         '2026-10-05 11:00+02', '2026-10-08 20:00+02', '2026-08-01 10:00+02', 'es',  0.00, TRUE,  FALSE, 'Mercado San Martín',    'San Martín Kalea, Donostia',            'Basque Culinary Center',          TRUE),
    ('EVT-012', 4, 'Bertsolarismo','Txapelketa Nagusia', '2026-11-08 17:00+01', '2026-11-08 21:00+01', '2026-09-01 10:00+02', 'eu', 15.00, FALSE, FALSE, 'Velódromo Anoeta',      'Anoeta, Donostia',                      'Bertsozale Elkartea',             TRUE),
    ('EVT-013', 4, 'Concierto',   'Pop Rock',            '2026-08-01 21:00+02', '2026-08-01 23:30+02', '2026-06-20 10:00+02', 'es', 30.00, FALSE, FALSE, 'Estadio Anoeta',        'Anoeta Zelaiak, Donostia',              'Live Nation Spain',               TRUE),
    ('EVT-014', 4, 'Fiestas',     'Semana Grande DSS',   '2026-08-11 12:00+02', '2026-08-17 23:59+02', '2026-06-01 10:00+02', 'es',  0.00, TRUE,  FALSE, NULL,                    'Boulevard, Donostia',                   'Ayuntamiento de Donostia',        TRUE),
    -- Vitoria-Gasteiz
    ('EVT-015', 5, 'Festival',    'Jazz',                '2026-07-14 20:00+02', '2026-07-19 23:59+02', '2026-05-25 10:00+02', 'es',  0.00, TRUE,  TRUE,  'Casco Medieval',        'Plaza Virgen Blanca, Vitoria',          'Festival de Jazz de Vitoria',     TRUE),
    ('EVT-016', 5, 'Feria',       'Agroalimentaria',     '2026-05-20 10:00+02', '2026-05-24 20:00+02', '2026-04-01 10:00+02', 'eu',  0.00, TRUE,  FALSE, 'Parque de la Florida',  'Paseo de la Florida, Vitoria',          'Ayuntamiento Vitoria-Gasteiz',    TRUE),
    ('EVT-017', 5, 'Teatro',      'Drama',               '2026-10-10 19:30+02', '2026-10-10 22:00+02', '2026-08-15 10:00+02', 'eu', 16.00, FALSE, FALSE, 'Teatro Principal',      'Correría 5, Vitoria',                   'Teatro Principal Vitoria',        TRUE),
    ('EVT-018', 5, 'Fiestas',     'Virgen Blanca',       '2026-08-04 12:00+02', '2026-08-09 23:59+02', '2026-06-01 10:00+02', 'es',  0.00, TRUE,  FALSE, NULL,                    'Plaza Virgen Blanca, Vitoria',          'Ayuntamiento Vitoria-Gasteiz',    TRUE),
    ('EVT-019', 5, 'Conferencia', 'Sostenibilidad',      '2026-06-25 09:00+02', '2026-06-25 18:00+02', '2026-05-30 10:00+02', 'es', 30.00, FALSE, FALSE, 'Palacio Europa',        'Avda. Gasteiz 85, Vitoria',             'Basque Ecodesign Center',         TRUE),
    -- Getxo
    ('EVT-020', 2, 'Concierto',   'Blues',               '2026-07-10 21:00+02', '2026-07-10 23:30+02', '2026-06-05 10:00+02', 'es',  0.00, TRUE,  FALSE, 'Getxo Blues',           'Puerto Viejo de Algorta, Getxo',        'Ayuntamiento de Getxo',           TRUE),
    ('EVT-021', 2, 'Deportes',    'Regatas',             '2026-08-22 10:00+02', '2026-08-22 17:00+02', '2026-07-01 10:00+02', 'eu',  0.00, TRUE,  FALSE, 'Puerto Getxo',          'Club Náutico Getxo',                    'Federación Vasca de Vela',        TRUE),
    -- Zarautz
    ('EVT-022', 10, 'Festival',   'Surf',                '2026-08-01 09:00+02', '2026-08-07 20:00+02', '2026-06-15 10:00+02', 'es',  0.00, TRUE,  FALSE, 'Playa de Zarautz',      'Playa de Zarautz',                      'Zarautz Surf Club',               TRUE),
    ('EVT-023', 10, 'Concierto',  'Pop',                 '2026-07-25 21:00+02', '2026-07-25 23:30+02', '2026-06-20 10:00+02', 'es', 20.00, FALSE, FALSE, 'Anfiteatro Zarautz',    'Paseo Marino, Zarautz',                 'Zarautz Udala',                   TRUE),
    -- Bermeo
    ('EVT-024', 15, 'Fiestas',    'San Pedro',           '2026-06-27 12:00+02', '2026-06-30 23:59+02', '2026-05-20 10:00+02', 'eu',  0.00, TRUE,  FALSE, NULL,                    'Puerto de Bermeo',                      'Ayuntamiento de Bermeo',          TRUE),
    -- Durango
    ('EVT-025', 8,  'Feria',      'Libro Vasco',         '2026-12-02 10:00+01', '2026-12-06 20:00+01', '2026-09-01 10:00+02', 'eu',  0.00, TRUE,  FALSE, 'Landako Gunea',         'Landako Gunea, Durango',                'Durangoko Azoka',                 TRUE),
    ('EVT-026', 8,  'Concierto',  'Metal',               '2026-09-05 21:00+02', '2026-09-05 23:30+02', '2026-07-15 10:00+02', 'es', 18.00, FALSE, FALSE, 'Landako Rock',          'Landako Gunea, Durango',                'Metal Events Bizkaia',            TRUE),
    -- Hondarribia
    ('EVT-027', 11, 'Fiestas',    'Alarde',              '2026-09-08 09:00+02', '2026-09-08 14:00+02', '2026-07-01 10:00+02', 'eu',  0.00, TRUE,  FALSE, NULL,                    'Casco Histórico, Hondarribia',          'Ayuntamiento de Hondarribia',     TRUE),
    -- Leioa
    ('EVT-028', 9,  'Deportes',   'Triatlón',            '2026-06-07 08:00+02', '2026-06-07 18:00+02', '2026-04-20 10:00+02', 'es', 60.00, FALSE, FALSE, 'Urduliz Triatlón',      'Playa de Arrigunaga, Getxo',            'Federación Vasca de Triatlón',    TRUE),
    -- Tolosa
    ('EVT-029', 12, 'Festival',   'Carnaval',            '2026-02-08 12:00+01', '2026-02-12 23:59+01', '2026-01-10 10:00+01', 'eu',  0.00, TRUE,  FALSE, NULL,                    'Casco Histórico, Tolosa',               'Ayuntamiento de Tolosa',          TRUE),
    -- Irún
    ('EVT-030', 6,  'Feria',      'Medieval',            '2026-07-04 11:00+02', '2026-07-06 22:00+02', '2026-05-15 10:00+02', 'es',  0.00, TRUE,  FALSE, NULL,                    'Casco Histórico, Irún',                 'Ayuntamiento de Irún',            TRUE)
ON CONFLICT (external_id) DO NOTHING;


-- =============================================================
-- market_data.gastronomy (30 establecimientos)
-- =============================================================

INSERT INTO market_data.gastronomy
    (external_id, nombre, descripcion, municipality_id, lat, lng,
     type, tipo_comida, entorno, email, web,
     categoria, calidad, url_imagen, valoracion, num_resenas,
     nivel_precio, national_phone_number, direccion, is_sponsored, active)
VALUES
    -- Bilbao
    ('GAST-001', 'Azurmendi',           'Restaurante de alta cocina vasca con tres estrellas Michelin. Cocina de autor con productos km0.',      1, 43.2712,-2.9511, 'Restaurante', 'Vasca',          'Rural',    'info@azurmendi.biz',           'https://www.azurmendi.biz',           'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/azurmendi.jpg',      4.9, 1240, 'alto',  '+34 944 558 866', 'Legina Auzoa 455, Larrabetzu, Bizkaia',             FALSE, TRUE),
    ('GAST-002', 'Nerua Guggenheim',    'Cocina vasca de vanguardia dentro del Museo Guggenheim. Una estrella Michelin.',                        1, 43.2688,-2.9340, 'Restaurante', 'Vasca Creativa', 'Urbano',   'nerua@guggenheim-bilbao.es',   'https://www.nerua.com',               'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/nerua.jpg',          4.7,  870, 'alto',  '+34 944 000 430', 'Abandoibarra Etorbidea 2, Bilbao',                  FALSE, TRUE),
    ('GAST-003', 'La Viña del Ensanche','Bar referente del Ensanche bilbaíno. Pintxos premiados en ambiente animado.',                          1, 43.2605,-2.9262, 'Bar',         'Pintxos',        'Urbano',   NULL,                           'https://lavinadelensanche.com',        'Bar de Pintxos',FALSE, 'https://img.sustraiapp.com/gast/lavina.jpg',         4.5, 2100, 'medio', '+34 944 155 615', 'Calle Diputación 10, Bilbao',                       FALSE, TRUE),
    ('GAST-004', 'Mina Restaurante',    'Cocina de mercado con producto del Cantábrico. Junto a la ría de Bilbao.',                             1, 43.2600,-2.9250, 'Restaurante', 'Vasca',          'Puerto',   'reservas@restaurantemina.es',  'https://www.restaurantemina.es',       'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/mina.jpg',           4.6,  580, 'alto',  '+34 944 795 938', 'Muelle Marzana, Bilbao',                            FALSE, TRUE),
    ('GAST-005', 'Café Iruña',          'Histórico café del siglo XIX en Bilbao. Ambiente clásico y cocina tradicional vasca.',                 1, 43.2625,-2.9349, 'Café',        'Tradicional',    'Histórico','cafeiruna@cafeiruna.com',      'https://www.cafeiruna.com',            'Casual',        FALSE, 'https://img.sustraiapp.com/gast/iruna.jpg',          4.1, 1100, 'bajo',  '+34 944 237 021', 'Jardines de Albia 1, Bilbao',                       FALSE, TRUE),
    ('GAST-006', 'Bascook',             'Restaurante en antigua fábrica rehabilitada. Cocina creativa vasca en entorno industrial.',            1, 43.2645,-2.9310, 'Restaurante', 'Vasca Creativa', 'Industrial','info@bascook.com',             'https://www.bascook.com',             'Gastrobar',     FALSE, 'https://img.sustraiapp.com/gast/bascook.jpg',        4.4,  340, 'medio', '+34 944 009 977', 'Barroeta Aldamar 8, Bilbao',                        FALSE, TRUE),
    ('GAST-007', 'Pintxos Ganbara',     'Pintxos de alta calidad en el Casco Viejo de Bilbao. Selección de temporada.',                        1, 43.2578,-2.9242, 'Bar',         'Pintxos',        'Histórico','ganbara@pintxos.eus',          NULL,                                  'Bar de Pintxos',FALSE, 'https://img.sustraiapp.com/gast/ganbara.jpg',        4.5, 1200, 'bajo',  '+34 944 157 399', 'San Lorenzo 12, Bilbao',                            FALSE, TRUE),
    ('GAST-008', 'Restaurante Yandiola','Alta cocina vasca en el Mercado de la Ribera. Cocina de autor con vistas a la ría.',                  1, 43.2590,-2.9200, 'Restaurante', 'Alta Cocina',    'Histórico','yandiola@yandiola.com',        'https://www.yandiola.com',            'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/yandiola.jpg',       4.8,  310, 'alto',  '+34 944 139 481', 'Erribera Kalea 22, Bilbao',                         FALSE, TRUE),
    -- San Sebastián
    ('GAST-009', 'Arzak',               'Tres estrellas Michelin. Juan Mari y Elena Arzak, pioneros de la Nueva Cocina Vasca.',                 4, 43.3059,-1.9692, 'Restaurante', 'Vasca Creativa', 'Urbano',   'arzak@arzak.es',               'https://www.arzak.es',                'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/arzak.jpg',          4.9, 3200, 'alto',  '+34 943 278 465', FALSE, TRUE),
    ('GAST-010', 'Mugaritz',            'Dos estrellas Michelin. Alta cocina experimental en las afueras de San Sebastián.',                    4, 43.2800,-1.9600, 'Restaurante', 'Alta Cocina',    'Rural',    'mugaritz@mugaritz.com',        'https://www.mugaritz.com',            'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/mugaritz.jpg',       4.8,  980, 'alto',  '+34 943 522 455', FALSE, TRUE),
    ('GAST-011', 'Bar La Viña SS',      'Famosa por la mejor tarta de queso del mundo. Pintxos clásicos en la Parte Vieja.',                   4, 43.3230,-1.9840, 'Bar',         'Pintxos',        'Histórico','lavina@lavinasansebastian.com', 'https://www.lavinasansebastian.com',  'Bar de Pintxos',FALSE, 'https://img.sustraiapp.com/gast/lavinass.jpg',       4.6, 2100, 'bajo',  '+34 943 427 495', FALSE, TRUE),
    ('GAST-012', 'Bar Nestor',          'Tortilla de patata legendaria y chuletón de vaca. Institución de la Parte Vieja.',                    4, 43.3238,-1.9766, 'Bar',         'Pintxos',        'Histórico',NULL,                           NULL,                                  'Bar de Pintxos',FALSE, 'https://img.sustraiapp.com/gast/nestor.jpg',         4.7, 4100, 'bajo',  '+34 943 422 873', FALSE, TRUE),
    ('GAST-013', 'Sidrería Petritegi',  'Sidrería tradicional con manzanos propios en Astigarraga. Menú completo con chuleta.',                4, 43.2900,-1.9411, 'Sidrería',    'Vasca',          'Rural',    'info@petritegi.com',           'https://www.petritegi.com',           'Sidrería',      FALSE, 'https://img.sustraiapp.com/gast/petritegi.jpg',      4.5, 1530, 'medio', '+34 943 457 188', FALSE, TRUE),
    ('GAST-014', 'Bar Gandarias',       'Pintxos creativos premiados y carta de temporada en la Parte Vieja de Donostia.',                     4, 43.3236,-1.9770, 'Bar',         'Pintxos',        'Histórico','info@bargandarias.com',        'https://www.bargandarias.com',        'Bar de Pintxos',FALSE, 'https://img.sustraiapp.com/gast/gandarias.jpg',      4.5, 3400, 'medio', '+34 943 426 362', FALSE, TRUE),
    ('GAST-015', 'Kokotxa',             'Una estrella Michelin. Cocina vasca de autor en la Parte Vieja de San Sebastián.',                    4, 43.3220,-1.9838, 'Restaurante', 'Vasca Creativa', 'Histórico','kokotxa@kokotxa.com',          'https://www.restaurantekokotxa.com',  'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/kokotxa.jpg',        4.6,  340, 'alto',  '+34 943 421 904', FALSE, TRUE),
    ('GAST-016', 'Rekondo',             'Bodega centenaria con cocina vasca de producto y carta de vinos excepcional.',                        4, 43.3100,-2.0000, 'Restaurante', 'Vasca',          'Urbano',   'rekondo@rekondo.com',          'https://www.rekondo.com',             'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/rekondo.jpg',        4.7,  420, 'alto',  '+34 943 212 907', FALSE, TRUE),
    -- Vitoria-Gasteiz
    ('GAST-017', 'El Clarete',          'Restaurante en bodega histórica del Casco Medieval de Vitoria. Una estrella Michelin.',               5, 42.8490,-2.6720, 'Restaurante', 'Vasca',          'Histórico','clarete@clarete.eus',          'https://www.elclarete.com',           'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/clarete.jpg',        4.7,  390, 'alto',  '+34 945 143 921', FALSE, TRUE),
    ('GAST-018', 'Zaldiaran',           'Dos estrellas Michelin en Vitoria. Cocina vasca contemporánea de alta precisión.',                    5, 42.8460,-2.6740, 'Restaurante', 'Alta Cocina',    'Urbano',   'zaldiaran@zaldiaran.eus',      'https://www.zaldiaran.com',           'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/zaldiaran.jpg',      4.9,  410, 'alto',  '+34 945 130 206', FALSE, TRUE),
    ('GAST-019', 'Bodega El Fabulista', 'Bodega histórica en el Casco Medieval. Txakoli y Rioja Alavesa en ambiente único.',                  5, 42.8502,-2.6715, 'Bar',         'Pintxos',        'Histórico','elfabulista@gmail.com',        'https://elfabulista.com',             'Bar de Pintxos',FALSE, 'https://img.sustraiapp.com/gast/fabulista.jpg',      4.3,  960, 'bajo',  '+34 945 162 213', FALSE, TRUE),
    ('GAST-020', 'Saburdi',             'Menú degustación con productos de la huerta alavesa. Sol Repsol.',                                    5, 42.8480,-2.6710, 'Restaurante', 'Alta Cocina',    'Urbano',   'saburdi@saburdi.eus',          NULL,                                  'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/saburdi.jpg',        4.6,  230, 'alto',  '+34 945 132 934', FALSE, TRUE),
    -- Getxo
    ('GAST-021', 'Andra Mari',          'Cocina vasca clásica en caserío del siglo XVII. Una estrella Michelin.',                              2, 43.3400,-3.0100, 'Restaurante', 'Vasca',          'Rural',    'andramari@andramari.com',      'https://www.andramari.com',           'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/andramari.jpg',      4.8,  450, 'alto',  '+34 944 630 052', FALSE, TRUE),
    ('GAST-022', 'Restaurante Portuondo','Pescados y mariscos con vistas al puerto deportivo de Getxo.',                                       2, 43.3600,-3.0200, 'Restaurante', 'Pescados y Mariscos','Puerto', 'info@portuondo.eus',          'https://www.portuondo.eus',           'Alta Cocina',   FALSE, 'https://img.sustraiapp.com/gast/portuondo.jpg',      4.6,  320, 'alto',  '+34 944 910 279', FALSE, TRUE),
    -- Durango
    ('GAST-023', 'Asador Etxebarri',    'El mejor asador del mundo según The World''s 50 Best. Victor Arguinzoniz y el fuego.',               8, 43.1750,-2.6211, 'Asador',      'Vasca',          'Rural',    'info@asadoretxebarri.com',     'https://www.asadoretxebarri.com',     'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/etxebarri.jpg',      4.9, 2700, 'alto',  '+34 946 583 042', TRUE,  TRUE),
    ('GAST-024', 'Kurutziaga Jatetxea', 'Cocina vasca en el histórico palacio de Kurutziaga de Durango.',                                     8, 43.1710,-2.6320, 'Restaurante', 'Vasca',          'Histórico','kurutziaga@durango.eus',       NULL,                                  'Restaurante',   TRUE,  'https://img.sustraiapp.com/gast/kurutziaga.jpg',     4.5,  200, 'medio', '+34 946 810 100', FALSE, TRUE),
    -- Bermeo
    ('GAST-025', 'Txakoli Itsasmendi',  'Bodega con viñedos en altura en Bermeo. D.O. Bizkaiko Txakolina con vistas al Cantábrico.',          15, 43.4180,-2.7130, 'Bodega',     'Vasca',          'Rural',    'itsasmendi@itsasmendi.com',    'https://www.itsasmendi.com',          'Bodega',        FALSE, 'https://img.sustraiapp.com/gast/itsasmendi.jpg',     4.6,  540, 'medio', '+34 946 884 314', FALSE, TRUE),
    -- Zarautz
    ('GAST-026', 'Karlos Arguiñano',    'Restaurante del célebre cocinero con vistas al mar de Zarautz.',                                    10, 43.2837,-2.1700, 'Restaurante', 'Vasca',          'Costero',  'info@hotelka.com',             'https://www.hotelka.com',             'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/arguinano.jpg',      4.8, 1100, 'alto',  '+34 943 130 000', FALSE, TRUE),
    -- Hondarribia
    ('GAST-027', 'Alameda Restaurante', 'Una estrella Michelin en Hondarribia. Cocina vasca creativa con vistas a la bahía.',                 11, 43.3711,-1.7950, 'Restaurante', 'Vasca Creativa', 'Histórico','alameda@rsalameda.com',        'https://www.rsalameda.com',           'Alta Cocina',   TRUE,  'https://img.sustraiapp.com/gast/alameda.jpg',        4.8,  670, 'alto',  '+34 943 642 789', FALSE, TRUE),
    -- Leioa
    ('GAST-028', 'Etxe Zaharra Leioa',  'Cocina vasca familiar en Leioa. Menú del día y carta de temporada.',                                9, 43.3280,-2.9880, 'Restaurante', 'Vasca',          'Urbano',   'etxezaharra@leioa.eus',        NULL,                                  'Restaurante',   FALSE, 'https://img.sustraiapp.com/gast/etxezaharra.jpg',    4.2,  180, 'medio', '+34 944 634 500', FALSE, TRUE),
    -- Tolosa
    ('GAST-029', 'Frontón Tolosa',      'Carnes y verduras de temporada. Famoso por sus judías toloseñas.',                                  12, 43.1365,-2.0782, 'Restaurante', 'Vasca',          'Urbano',   'fronton@tolosa.eus',           NULL,                                  'Restaurante',   FALSE, 'https://img.sustraiapp.com/gast/frontontolosa.jpg',  4.4,  300, 'medio', '+34 943 650 123', 'Rondilla 2, Tolosa',                                FALSE, TRUE),
    -- Barakaldo
    ('GAST-030', 'Sidrería Rekalde',    'Auténtica sidrería vasca con sidra natural de temporada en Barakaldo.',                             3, 43.2940,-2.9930, 'Sidrería',    'Vasca',          'Urbano',   'rekalde@sidra.eus',            NULL,                                  'Sidrería',      FALSE, 'https://img.sustraiapp.com/gast/rekalde.jpg',        4.2,  260, 'bajo',  '+34 944 188 400', 'Autonomía 49, Barakaldo',                           FALSE, TRUE)
ON CONFLICT (external_id) DO NOTHING;


-- =============================================================
-- market_data.gastronomy_qualifications
-- =============================================================

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE
    (g.external_id = 'GAST-001' AND q.codigo IN ('michelin_estrella','repsol_sol','euskolabel'))
 OR (g.external_id = 'GAST-002' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-004' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-008' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-009' AND q.codigo IN ('michelin_estrella','repsol_sol','q_calidad'))
 OR (g.external_id = 'GAST-010' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-013' AND q.codigo IN ('denominacion_origen','euskolabel'))
 OR (g.external_id = 'GAST-015' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-016' AND q.codigo IN ('repsol_sol'))
 OR (g.external_id = 'GAST-017' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-018' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-020' AND q.codigo IN ('repsol_sol'))
 OR (g.external_id = 'GAST-021' AND q.codigo IN ('michelin_estrella','repsol_sol'))
 OR (g.external_id = 'GAST-023' AND q.codigo IN ('michelin_estrella','repsol_sol','q_calidad'))
 OR (g.external_id = 'GAST-025' AND q.codigo IN ('denominacion_origen','euskolabel'))
 OR (g.external_id = 'GAST-026' AND q.codigo IN ('repsol_sol'))
 OR (g.external_id = 'GAST-027' AND q.codigo IN ('michelin_estrella','repsol_sol'))
ON CONFLICT (gastronomy_id, qualification_id) DO NOTHING;


-- =============================================================
-- market_data.culture (25 lugares)
-- =============================================================

INSERT INTO market_data.culture
    (external_id, fuente, nombre, tipo_lugar, tipo_cultura, descripcion,
     precio, horario, telefono, email, web, web_amigable, imagen_url,
     municipality_id, direccion, codigo_postal, visita_guiada, capacidad, tienda,
     lat, lng, valoracion, numero_valoraciones, is_sponsored, active)
VALUES
    ('CULT-001','Google Places','Museo Guggenheim Bilbao','Museo','Arte Contemporáneo',
     'Museo de arte contemporáneo diseñado por Frank O. Gehry. Icono mundial de Bilbao.',
     '18€ / 9€ reducida','{"lunes":"cerrado","ma_do":"10:00-20:00"}',
     '+34 944 359 080','info@guggenheim-bilbao.eus','https://www.guggenheim-bilbao.eus',
     'guggenheim-bilbao.eus','https://img.sustraiapp.com/cult/guggenheim.jpg',
     1,'Abandoibarra Etorb. 2','48009',TRUE,2000,TRUE,43.2688,-2.9341,4.8,18500,TRUE,TRUE),

    ('CULT-002','Google Places','Museo de Bellas Artes de Bilbao','Museo','Bellas Artes',
     'Uno de los museos de bellas artes más importantes de España.',
     '10€ / gratis ma. menores 26','{"lunes":"cerrado","ma_do":"10:00-20:00"}',
     '+34 944 396 060','info@museobilbao.com','https://www.museobilbao.com',
     'museobilbao.com','https://img.sustraiapp.com/cult/bbaa.jpg',
     1,'Museoa Plaza 2','48009',TRUE,1500,TRUE,43.2668,-2.9270,4.6,7400,FALSE,TRUE),

    ('CULT-003','Open Data','Puente Colgante de Bizkaia','Monumento','Patrimonio Cultural',
     'Primer puente transbordador del mundo. Patrimonio Mundial UNESCO desde 2006.',
     '9€ pasarela / 0.45€ góndola','{"lu_do":"10:00-14:00,16:00-20:00"}',
     '+34 944 801 012','info@puente-colgante.com','https://www.puente-colgante.com',
     'puente-colgante.com','https://img.sustraiapp.com/cult/puentecolgante.jpg',
     2,'Av. de Repélaga 1','48993',TRUE,NULL,TRUE,43.3233,-3.0173,4.8,12000,TRUE,TRUE),

    ('CULT-004','Google Places','Torre Azkuna Centro','Centro Cultural','Arquitectura',
     'Centro cultural en bodega modernista de 1909 rehabilitada por Philippe Starck.',
     'Gratis','{"lu_do":"07:00-23:00"}',
     '+34 944 012 014','info@torreazkunazentroa.eus','https://www.torreazkunazentroa.eus',
     'torreazkunazentroa.eus','https://img.sustraiapp.com/cult/torrearzkuna.jpg',
     1,'Arriquibar pl. 4','48010',FALSE,1200,FALSE,43.2625,-2.9344,4.6,6700,FALSE,TRUE),

    ('CULT-005','Open Data','Casco Viejo de Bilbao – Siete Calles','Casco Histórico','Patrimonio Cultural',
     'Núcleo histórico medieval de Bilbao con las famosas Siete Calles del s.XIV.',
     'Gratis','{}',NULL,NULL,NULL,
     NULL,'https://img.sustraiapp.com/cult/cascoviejobilbao.jpg',
     1,'Casco Viejo','48005',TRUE,NULL,FALSE,43.2576,-2.9234,4.7,12000,FALSE,TRUE),

    ('CULT-006','Kulturklik','Teatro Arriaga','Teatro','Artes Escénicas',
     'Imponente teatro neobarroco de 1890 a orillas del Nervión. Referente cultural de Bilbao.',
     'Variable según función','{"visitas_sa_do":"12:30"}',
     '+34 944 163 333','info@teatroarriaga.eus','https://www.teatroarriaga.eus',
     'teatroarriaga.eus','https://img.sustraiapp.com/cult/arriaga.jpg',
     1,'Arriaga pl. 1','48005',TRUE,1000,FALSE,43.2594,-2.9249,4.7,5100,FALSE,TRUE),

    ('CULT-007','Google Places','Museo Marítimo Ría de Bilbao','Museo','Marítimo',
     'Historia marítima del País Vasco a través de barcos, maquetas y exposiciones interactivas.',
     '8€ / 4€ reducida','{"ma_do":"10:00-19:00"}',
     '+34 946 081 000','info@museomaritimobilbao.org','https://www.museomaritimobilbao.org',
     'museomaritimobilbao.org','https://img.sustraiapp.com/cult/maritimo.jpg',
     1,'Muelle Ramón de la Sota 1','48013',TRUE,500,TRUE,43.2600,-2.9280,4.4,3800,FALSE,TRUE),

    -- San Sebastián
    ('CULT-008','Google Places','Palacio Kursaal','Sala de Eventos','Arquitectura',
     'Palacio de congresos y auditorio diseñado por Rafael Moneo. Sede del Festival de Cine.',
     'Variable según evento','{"lu_do":"según programación"}',
     '+34 943 003 000','info@kursaal.eus','https://www.kursaal.eus',
     'kursaal.eus','https://img.sustraiapp.com/cult/kursaal.jpg',
     4,'Av. de Zurriola 1','20002',TRUE,1800,FALSE,43.3220,-1.9766,4.6,5200,FALSE,TRUE),

    ('CULT-009','Google Places','Aquarium de San Sebastián','Museo','Ciencias Naturales',
     'Acuario oceanográfico con peces del Cantábrico, tiburones y galería submarina.',
     '15€ / 8€ niños','{"lu_do":"10:00-19:00"}',
     '+34 943 440 099','info@aquariumss.com','https://www.aquariumss.com',
     'aquariumss.com','https://img.sustraiapp.com/cult/aquarium.jpg',
     4,'Pl. Carlos Blasco de Imaz 1','20003',TRUE,800,TRUE,43.3193,-1.9900,4.4,9300,FALSE,TRUE),

    ('CULT-010','Google Places','Museo San Telmo','Museo','Historia y Etnografía',
     'Museo de sociedad y ciudadanía vasca en convento del s.XVI. Referente en San Sebastián.',
     '6€ / gratis los martes','{"lunes":"cerrado","ma_do":"10:00-20:00"}',
     '+34 943 481 580','info@santelmomuseoa.eus','https://www.santelmomuseoa.eus',
     'santelmomuseoa.eus','https://img.sustraiapp.com/cult/santelmo.jpg',
     4,'Plaza Zuloaga 1','20003',TRUE,600,TRUE,43.3244,-1.9826,4.5,5400,FALSE,TRUE),

    ('CULT-011','Kulturklik','Museo Chillida-Leku','Museo','Escultura',
     'Museo-jardín de Eduardo Chillida. Esculturas monumentales en caserío del s.XVI.',
     '14€ / 7€ reducida','{"ma_do":"10:00-15:00","lunes":"cerrado"}',
     '+34 943 336 006','info@museochillidaleku.com','https://www.museochillidaleku.com',
     'museochillidaleku.com','https://img.sustraiapp.com/cult/chillidaleku.jpg',
     4,'Jáuregui 66, Hernani','20120',TRUE,300,TRUE,43.2530,-1.9880,4.9,4800,FALSE,TRUE),

    ('CULT-012','Open Data','Playa de La Concha','Playa','Patrimonio Natural',
     'La playa urbana más bonita de Europa según múltiples rankings internacionales.',
     'Gratis','{}',NULL,NULL,NULL,
     NULL,'https://img.sustraiapp.com/cult/laconcha.jpg',
     4,'Paseo de La Concha','20007',FALSE,NULL,FALSE,43.3180,-2.0040,4.9,45000,FALSE,TRUE),

    ('CULT-013','Open Data','Parte Vieja de San Sebastián','Casco Histórico','Patrimonio Cultural',
     'Barrio histórico de pintxos, bares y cultura vasca en el corazón de Donostia.',
     'Gratis','{}',NULL,NULL,NULL,
     NULL,'https://img.sustraiapp.com/cult/parteviejass.jpg',
     4,'Parte Vieja','20003',TRUE,NULL,FALSE,43.3232,-1.9840,4.8,18000,FALSE,TRUE),

    -- Vitoria-Gasteiz
    ('CULT-014','Open Data','Catedral de Santa María de Vitoria','Patrimonio','Patrimonio Cultural',
     'Catedral gótica del s.XIV en el casco medieval. La "catedral viva" en restauración visible.',
     '5€ / 3€ reducida','{"ma_do":"11:00-14:00,17:00-19:30"}',
     '+34 945 255 135','visitas@catedralvitoria.com','https://www.catedralvitoria.com',
     'catedralvitoria.com','https://img.sustraiapp.com/cult/catedral_vitoria.jpg',
     5,'Cuchillería 95','01001',TRUE,500,TRUE,42.8517,-2.6729,4.8,3100,FALSE,TRUE),

    ('CULT-015','Google Places','Artium – Museo Vasco de Arte Contemporáneo','Museo','Arte Contemporáneo',
     'Centro-museo de arte contemporáneo con énfasis en artistas vascos. Colección en expansión.',
     '8€ / gratis menores 18','{"ma_vi":"11:00-14:00,17:00-21:00","sa_do":"11:00-21:00"}',
     '+34 945 209 020','artium@artium.eus','https://www.artium.eus',
     'artium.eus','https://img.sustraiapp.com/cult/artium.jpg',
     5,'Francia 24','01002',TRUE,600,TRUE,42.8480,-2.6731,4.4,2700,FALSE,TRUE),

    ('CULT-016','Open Data','Parque de La Florida','Parque','Patrimonio Natural',
     'Jardín histórico del s.XIX, pulmón verde del centro de Vitoria-Gasteiz.',
     'Gratis','{}',NULL,NULL,NULL,
     NULL,'https://img.sustraiapp.com/cult/florida.jpg',
     5,'Paseo de la Senda','01005',FALSE,NULL,FALSE,42.8477,-2.6752,4.5,5200,FALSE,TRUE),

    -- Bermeo
    ('CULT-017','Open Data','San Juan de Gaztelugatxe','Monumento','Patrimonio Natural',
     'Islote volcánico con ermita unido a tierra por puente de 241 escalones. Paisaje único del litoral vizcaíno.',
     'Gratis (reserva obligatoria en verano)','{"lu_do":"09:00-20:00"}',
     NULL,NULL,'https://www.gaztelugatxe.eus',
     'gaztelugatxe.eus','https://img.sustraiapp.com/cult/gaztelugatxe.jpg',
     15,'Camino Gaztelugatxe, Bermeo','48370',FALSE,NULL,FALSE,43.4459,-2.7726,4.9,21000,FALSE,TRUE),

    -- Getxo
    ('CULT-018','Google Places','Puerto Viejo de Algorta','Casco Histórico','Patrimonio Cultural',
     'Puerto pesquero histórico de Getxo con ambiente marinero y restaurantes.',
     'Gratis','{}',NULL,'turismo@getxo.eus',NULL,
     NULL,'https://img.sustraiapp.com/cult/puertoviejogetxo.jpg',
     2,'Puerto Viejo de Algorta','48992',FALSE,NULL,FALSE,43.3608,-3.0218,4.5,4200,FALSE,TRUE),

    -- Hondarribia
    ('CULT-019','Open Data','Casco Viejo de Hondarribia','Casco Histórico','Patrimonio Cultural',
     'Conjunto medieval amurallado. Palacios renacentistas y calles empedradas. Monumento Nacional.',
     'Gratis','{"lu_do":"00:00-23:59"}',NULL,'turismo@hondarribia.eus',NULL,
     NULL,'https://img.sustraiapp.com/cult/hondarribia.jpg',
     11,'Casco Histórico','20280',TRUE,NULL,FALSE,43.3693,-1.7962,4.8,8900,FALSE,TRUE),

    -- Durango
    ('CULT-020','Google Places','Museo Euskal Herria Durango','Museo','Historia y Etnografía',
     'Museo de historia vasca en palacio barroco del s.XVII. Etnografía y vida tradicional vasca.',
     '3€ / gratis domingos','{"ma_sa":"10:00-14:00,16:00-19:30","do":"10:30-13:30"}',
     '+34 946 255 451','museoa@bizkaia.eus',NULL,
     NULL,'https://img.sustraiapp.com/cult/euskalherria.jpg',
     8,'Josef Maria Arizmendiarrietaren pl. 1','48200',TRUE,400,FALSE,43.1703,-2.6331,4.2,1100,FALSE,TRUE),

    -- Zarautz
    ('CULT-021','Open Data','Playa de Zarautz','Playa','Patrimonio Natural',
     'La playa más larga de Gipuzkoa. Paraíso del surf con ambiente joven y activo.',
     'Gratis','{}',NULL,NULL,NULL,
     NULL,'https://img.sustraiapp.com/cult/zarautz.jpg',
     10,'Paseo Marino','20800',FALSE,NULL,FALSE,43.2837,-2.1700,4.7,8500,FALSE,TRUE),

    -- Barakaldo
    ('CULT-022','Google Places','Bilbao Exhibition Centre (BEC)','Centro de Eventos','Cultura Urbana',
     'Centro de exposiciones y congresos más importante de Bizkaia.',
     'Variable','{}',
     '+34 944 040 000','info@bilbaoexhibitioncentre.com','https://www.bilbaoexhibitioncentre.com',
     'bilbaoexhibitioncentre.com','https://img.sustraiapp.com/cult/bec.jpg',
     3,'Ronda de Azkue 1','48902',FALSE,5000,FALSE,43.3020,-2.9940,4.3,2800,FALSE,TRUE),

    -- Irún
    ('CULT-023','Google Places','Museo Romano Oiasso','Museo','Arqueología',
     'Museo sobre la ciudad romana de Oiasso. El asentamiento romano más importante del País Vasco.',
     '5€ / gratis menores 12','{"ma_sa":"10:00-14:00,16:00-19:00","do":"10:00-14:00"}',
     '+34 943 639 353','oiasso@irun.org','https://www.oiasso.com',
     'oiasso.com','https://img.sustraiapp.com/cult/oiasso.jpg',
     6,'Eskoleta 1','20302',TRUE,300,TRUE,43.3389,-1.7882,4.5,2300,FALSE,TRUE),

    -- Tolosa
    ('CULT-024','Google Places','Museo del Carnaval de Tolosa','Museo','Folklore',
     'Único museo dedicado al carnaval vasco y sus tradiciones. Tolosa, capital del carnaval.',
     '3€ / 1.5€ niños','{"ma_sa":"10:00-14:00,16:00-19:00","do":"10:00-14:00"}',
     '+34 943 650 000',NULL,NULL,
     NULL,'https://img.sustraiapp.com/cult/carnavaltolosa.jpg',
     12,'Plaza Euskal Herria 1','20400',TRUE,200,FALSE,43.1368,-2.0785,4.3,800,FALSE,TRUE),

    -- Ermua
    ('CULT-025','Open Data','Santuario de Urkiola','Patrimonio','Patrimonio Cultural',
     'Santuario dedicado a los santos Antón y Urbizi en el puerto de montaña de Urkiola.',
     'Gratis','{"lu_do":"09:00-19:00"}',
     '+34 946 817 000',NULL,NULL,
     NULL,'https://img.sustraiapp.com/cult/urkiola.jpg',
     7,'Puerto de Urkiola, s/n','48211',TRUE,1000,FALSE,43.0790,-2.6310,4.5,3100,FALSE,TRUE)
ON CONFLICT (external_id) DO NOTHING;


-- =============================================================
-- user_data.users (10 usuarios — password: '12345678')
-- =============================================================

INSERT INTO user_data.users
    (nombre, apellido, email, password_hash, tlf, municipality_id, sexo, age, role)
VALUES
    ('Test',   'Usuario',    'test@sustraiapp.com',   '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', NULL,            1, 'otro',   30, 'user'),
    ('Admin',  'Sistema',    'admin@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', NULL,            1, 'otro',   30, 'admin'),
    ('Ane',    'Goikoetxea', 'ane@sustraiapp.com',    '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34600111222', 1, 'mujer',  27, 'user'),
    ('Mikel',  'Zabala',     'mikel@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34600333444', 4, 'hombre', 34, 'user'),
    ('Leire',  'Txurruka',   'leire@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34600555666', 5, 'mujer',  22, 'user'),
    ('Jon',    'Etxeberria', 'jon@sustraiapp.com',    '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34600777888', 2, 'hombre', 41, 'user'),
    ('Miren',  'Larrañaga',  'miren@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', NULL,            8, 'mujer',  29, 'user'),
    ('Gorka',  'Urrutia',    'gorka@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34600999000', 1, 'hombre', 38, 'user'),
    ('Amaia',  'Olabarria',  'amaia@sustraiapp.com',  '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34601111222', 4, 'mujer',  25, 'user'),
    ('Unai',   'Arrieta',    'unai@sustraiapp.com',   '$2b$12$riH7pyY17fBN23Nxle/Yt.omQur2pv13JOT/XXaYTijq8M8ssQPJG', '+34601333444', 5, 'hombre', 32, 'user')
ON CONFLICT (email) DO NOTHING;


-- =============================================================
-- user_data.interests
-- =============================================================

-- Raíces (level 0)
INSERT INTO user_data.interests (nombre, father_id, level) VALUES
    ('Eventos',           NULL, 0),
    ('Gastronomía',       NULL, 0),
    ('Puntos de Interés', NULL, 0)
ON CONFLICT DO NOTHING;

-- Eventos — level 1
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT t.nombre, (SELECT id_interes FROM user_data.interests WHERE nombre='Eventos' AND level=0), 1
FROM (VALUES ('Concierto'),('Festival'),('Fiestas'),('Feria'),('Teatro'),('Danza'),
             ('Bertsolarismo'),('Deportes'),('Exposición'),('Mercado'),('Cine')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Gastronomía — level 1
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT t.nombre, (SELECT id_interes FROM user_data.interests WHERE nombre='Gastronomía' AND level=0), 1
FROM (VALUES ('Restaurantes'),('Bodegas'),('Sidrerías'),('Gourmet'),('Pintxos')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Restaurantes — level 2
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT t.nombre, (SELECT id_interes FROM user_data.interests WHERE nombre='Restaurantes' AND level=1), 2
FROM (VALUES ('Alta Cocina'),('Asador'),('Cocina Vasca')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Gourmet — level 2
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT t.nombre, (SELECT id_interes FROM user_data.interests WHERE nombre='Gourmet' AND level=1), 2
FROM (VALUES ('Michelin'),('Repsol'),('Eusko Label'),('Denominación de Origen')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Puntos de Interés — level 1
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT t.nombre, (SELECT id_interes FROM user_data.interests WHERE nombre='Puntos de Interés' AND level=0), 1
FROM (VALUES ('Museos'),('Patrimonio'),('Playas'),('Naturaleza'),('Arquitectura')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- Museos — level 2
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT t.nombre, (SELECT id_interes FROM user_data.interests WHERE nombre='Museos' AND level=1), 2
FROM (VALUES ('Arte'),('Historia'),('Ciencia'),('Etnografía')) AS t(nombre)
ON CONFLICT DO NOTHING;


-- =============================================================
-- user_data.user_interests
-- =============================================================

INSERT INTO user_data.user_interests (id_user, id_interes)
SELECT u.id_user, i.id_interes FROM user_data.users u, user_data.interests i
WHERE
    (u.email='ane@sustraiapp.com'   AND i.nombre IN ('Concierto','Festival','Gastronomía','Restaurantes','Alta Cocina','Museos','Arte'))
 OR (u.email='mikel@sustraiapp.com' AND i.nombre IN ('Bertsolarismo','Fiestas','Restaurantes','Asador','Pintxos','Patrimonio'))
 OR (u.email='leire@sustraiapp.com' AND i.nombre IN ('Exposición','Teatro','Danza','Gourmet','Eusko Label','Sidrerías'))
 OR (u.email='jon@sustraiapp.com'   AND i.nombre IN ('Festival','Concierto','Sidrerías','Patrimonio','Naturaleza'))
 OR (u.email='miren@sustraiapp.com' AND i.nombre IN ('Museos','Historia','Cine','Bodegas','Denominación de Origen'))
 OR (u.email='gorka@sustraiapp.com' AND i.nombre IN ('Feria','Gastronomía','Restaurantes','Alta Cocina','Museos'))
 OR (u.email='amaia@sustraiapp.com' AND i.nombre IN ('Concierto','Festival','Pintxos','Restaurantes','Patrimonio','Playas'))
 OR (u.email='unai@sustraiapp.com'  AND i.nombre IN ('Deportes','Fiestas','Asador','Naturaleza','Playas'))
ON CONFLICT DO NOTHING;


-- =============================================================
-- user_data.preferences
-- =============================================================

INSERT INTO user_data.preferences (user_id, rango_precio, movilidad_reducida, municipios_interes)
SELECT u.id_user, p.rango, p.mov, p.munis
FROM user_data.users u
JOIN (VALUES
    ('ane@sustraiapp.com',   'medio', FALSE, ARRAY[1,4,2]::INTEGER[]),
    ('mikel@sustraiapp.com', 'alto',  FALSE, ARRAY[4,1,10]::INTEGER[]),
    ('leire@sustraiapp.com', 'bajo',  FALSE, ARRAY[5,1,8]::INTEGER[]),
    ('jon@sustraiapp.com',   'medio', FALSE, ARRAY[2,1,15]::INTEGER[]),
    ('miren@sustraiapp.com', 'medio', TRUE,  ARRAY[8,1,5]::INTEGER[]),
    ('gorka@sustraiapp.com', 'alto',  FALSE, ARRAY[1,4,2]::INTEGER[]),
    ('amaia@sustraiapp.com', 'bajo',  FALSE, ARRAY[4,10,11]::INTEGER[]),
    ('unai@sustraiapp.com',  'medio', FALSE, ARRAY[5,1,15]::INTEGER[])
) AS p(email, rango, mov, munis) ON u.email = p.email
ON CONFLICT (user_id) DO NOTHING;


-- =============================================================
-- user_data.gastronomy_reviews
-- (requiere que event_reviews esté corregido para ejecutarse)
-- =============================================================

INSERT INTO user_data.gastronomy_reviews (user_id, gastro_id, puntuacion, texto)
SELECT u.id_user, g.id, r.puntuacion, r.texto
FROM user_data.users u
JOIN (VALUES
    ('ane@sustraiapp.com',   'GAST-003', 5, 'La Viña del Ensanche es insuperable. Pintxos de nivel altísimo y ambiente inmejorable.'),
    ('ane@sustraiapp.com',   'GAST-001', 5, 'Azurmendi: una experiencia que te marca para siempre. Cada plato es una obra de arte.'),
    ('ane@sustraiapp.com',   'GAST-013', 4, 'Petritegi es el ritual vasco por excelencia. La sidra natural y la chuleta, espectacular.'),
    ('mikel@sustraiapp.com', 'GAST-023', 5, 'Etxebarri es el mejor restaurante del mundo sin discusión. Las brasas de Victor son mágicas.'),
    ('mikel@sustraiapp.com', 'GAST-012', 5, 'Bar Nestor: la tortilla más famosa de la historia. Hay que reservar o esperar en la cola.'),
    ('mikel@sustraiapp.com', 'GAST-009', 5, 'Arzak es la cima de la cocina vasca. Elena y Juan Mari siguen siendo únicos e irrepetibles.'),
    ('leire@sustraiapp.com', 'GAST-019', 4, 'El Fabulista en el Casco Medieval de Vitoria es especial. Pintxos y txakoli de calidad.'),
    ('leire@sustraiapp.com', 'GAST-018', 5, 'Zaldiaran merecía más reconocimiento. Cocina técnica y producto de primera en Vitoria.'),
    ('leire@sustraiapp.com', 'GAST-025', 4, 'Itsasmendi con vistas al Cantábrico es irresistible. El txakoli en las alturas de Bermeo.'),
    ('jon@sustraiapp.com',   'GAST-013', 5, 'Petritegi es la esencia de Euskadi. El espeto de sidra, la chuleta y la txistorra.'),
    ('jon@sustraiapp.com',   'GAST-021', 4, 'Andra Mari en un caserío del XVII. Cocina vasca de libro con producto excepcional.'),
    ('jon@sustraiapp.com',   'GAST-022', 4, 'Portuondo en Getxo: pescado fresquísimo con vistas al puerto deportivo.'),
    ('miren@sustraiapp.com', 'GAST-010', 5, 'Mugaritz es una experiencia filosófica además de gastronómica. No se puede describir.'),
    ('miren@sustraiapp.com', 'GAST-011', 4, 'La tarta de queso de La Viña es la mejor del mundo. Punto final y sin discusión posible.'),
    ('miren@sustraiapp.com', 'GAST-015', 5, 'Kokotxa en la Parte Vieja es una sorpresa constante. Muy recomendable para amantes del buen comer.'),
    ('gorka@sustraiapp.com', 'GAST-001', 5, 'Azurmendi: el menú degustación más completo y emocionante que he probado en mi vida.'),
    ('gorka@sustraiapp.com', 'GAST-002', 4, 'Nerua dentro del Guggenheim: gastronomía y arte en un mismo espacio imposible de superar.'),
    ('gorka@sustraiapp.com', 'GAST-023', 5, 'Etxebarri es el templo del fuego. Imprescindible para cualquier amante de la carne.'),
    ('amaia@sustraiapp.com', 'GAST-014', 5, 'Bar Gandarias en la Parte Vieja: pintxos creativos y ambiente donostiarra inmejorable.'),
    ('amaia@sustraiapp.com', 'GAST-012', 4, 'Nestor es una institución. La tortilla se acaba rápido, hay que madrugar o reservar.'),
    ('amaia@sustraiapp.com', 'GAST-026', 5, 'Arguiñano en Zarautz: comida con vistas al Cantábrico. Una experiencia completa y especial.'),
    ('unai@sustraiapp.com',  'GAST-005', 4, 'Café Iruña es historia viva de Bilbao. El ambiente de otra época es parte de la experiencia.'),
    ('unai@sustraiapp.com',  'GAST-006', 4, 'Bascook en una fábrica rehabilitada. Cocina creativa en entorno industrial muy bien aprovechado.'),
    ('unai@sustraiapp.com',  'GAST-030', 3, 'La sidrería Rekalde es correcta. No sorprende pero cumple con el ritual de la sidrería vasca.'),
    ('test@sustraiapp.com',  'GAST-007', 4, 'Ganbara en el Casco Viejo bilbaíno, uno de los mejores bares de pintxos de Bilbao.')
) AS r(email, ext_id, puntuacion, texto) ON u.email = r.email
JOIN market_data.gastronomy g ON g.external_id = r.ext_id
ON CONFLICT (user_id, gastro_id) DO NOTHING;


-- =============================================================
-- user_data.culture_reviews
-- (requiere que event_reviews esté corregido para ejecutarse)
-- =============================================================

INSERT INTO user_data.culture_reviews (user_id, culture_id, puntuacion, texto)
SELECT u.id_user, c.id, r.puntuacion, r.texto
FROM user_data.users u
JOIN (VALUES
    ('ane@sustraiapp.com',   'CULT-001', 5, 'El Guggenheim nunca decepciona. La colección permanente y las temporales son increíbles.'),
    ('ane@sustraiapp.com',   'CULT-003', 5, 'El Puente Colgante desde la pasarela superior es una experiencia única. UNESCO con razón.'),
    ('mikel@sustraiapp.com', 'CULT-017', 5, 'Gaztelugatxe es uno de los lugares más especiales del mundo. Los 241 escalones merecen cada paso.'),
    ('mikel@sustraiapp.com', 'CULT-002', 4, 'El Museo de Bellas Artes sorprende por la calidad de su colección. Los martes gratis es una ganga.'),
    ('mikel@sustraiapp.com', 'CULT-013', 5, 'La Parte Vieja de Donostia es el paraíso del pintxo. Horas y horas recorriendo sus bares.'),
    ('leire@sustraiapp.com', 'CULT-015', 4, 'Artium hace una labor importante para el arte vasco. Programación dinámica y muy accesible.'),
    ('leire@sustraiapp.com', 'CULT-014', 5, 'La Catedral de Vitoria en obras es fascinante. Ver la historia en capas estratigráficas es único.'),
    ('leire@sustraiapp.com', 'CULT-011', 5, 'Chillida-Leku es una experiencia que cambia tu percepción del espacio y la materia.'),
    ('jon@sustraiapp.com',   'CULT-003', 5, 'El Puente Colgante es impresionante. Cruzarlo por arriba cambia la perspectiva de toda la ría.'),
    ('jon@sustraiapp.com',   'CULT-019', 4, 'Hondarribia es un pueblo para perderse. El casco amurallado al atardecer es precioso.'),
    ('jon@sustraiapp.com',   'CULT-021', 5, 'La playa de Zarautz es perfecta para surfear. Olas constantes y ambiente joven y relajado.'),
    ('miren@sustraiapp.com', 'CULT-011', 5, 'Chillida-Leku es el museo más especial que he visitado. Las esculturas y el jardín se fusionan.'),
    ('miren@sustraiapp.com', 'CULT-020', 4, 'El Museo Euskal Herria de Durango tiene información muy completa sobre la historia vasca.'),
    ('miren@sustraiapp.com', 'CULT-010', 4, 'San Telmo es imprescindible para entender la cultura vasca. Muy bien organizado y señalizado.'),
    ('gorka@sustraiapp.com', 'CULT-004', 4, 'Torre Azkuna es el espacio cultural más original de Bilbao. La piscina transparente te deja sin palabras.'),
    ('gorka@sustraiapp.com', 'CULT-001', 5, 'El Guggenheim sigue siendo espectacular con los años. La arquitectura de Gehry es una obra de arte.'),
    ('gorka@sustraiapp.com', 'CULT-006', 4, 'Teatro Arriaga impresiona desde fuera. El interior neobarroco al completo es increíble.'),
    ('amaia@sustraiapp.com', 'CULT-012', 5, 'La Concha es la playa perfecta. Agua tranquila, arena fina y las vistas de la bahía son únicas.'),
    ('amaia@sustraiapp.com', 'CULT-008', 4, 'El Kursaal es un edificio que da carácter a Donostia. Las "rocas varadas" son un símbolo.'),
    ('amaia@sustraiapp.com', 'CULT-009', 4, 'El Aquarium de San Sebastián tiene un túnel submarino espectacular. Perfecto con niños.'),
    ('unai@sustraiapp.com',  'CULT-017', 5, 'Gaztelugatxe es el lugar más fotogénico de toda Euskadi. Imprescindible en cualquier visita al PV.'),
    ('unai@sustraiapp.com',  'CULT-016', 4, 'El Parque de La Florida de Vitoria es un oasis en el centro. Muy tranquilo y bien cuidado.'),
    ('unai@sustraiapp.com',  'CULT-018', 4, 'Puerto Viejo de Algorta tiene una personalidad única. Restaurantes con vistas al mar fantásticas.'),
    ('test@sustraiapp.com',  'CULT-025', 4, 'El Santuario de Urkiola en las montañas es un lugar de paz. El paisaje que le rodea es espectacular.'),
    ('test@sustraiapp.com',  'CULT-007', 4, 'El Museo Marítimo de Bilbao es interesante y poco masificado. La historia naval vasca bien contada.')
) AS r(email, ext_id, puntuacion, texto) ON u.email = r.email
JOIN market_data.culture c ON c.external_id = r.ext_id
ON CONFLICT (user_id, culture_id) DO NOTHING;


-- =============================================================
-- user_data.favorites
-- (requiere que event_reviews esté corregido para ejecutarse)
-- =============================================================

INSERT INTO user_data.favorites (user_id, entidad_id, entidad_tipo)

SELECT u.id_user, e.id, 'evento'
FROM user_data.users u, market_data.events e
WHERE
    (u.email='ane@sustraiapp.com'   AND e.external_id IN ('EVT-002','EVT-010','EVT-007'))
 OR (u.email='mikel@sustraiapp.com' AND e.external_id IN ('EVT-004','EVT-012','EVT-025'))
 OR (u.email='leire@sustraiapp.com' AND e.external_id IN ('EVT-003','EVT-017','EVT-005'))
 OR (u.email='jon@sustraiapp.com'   AND e.external_id IN ('EVT-002','EVT-022','EVT-024'))
 OR (u.email='miren@sustraiapp.com' AND e.external_id IN ('EVT-009','EVT-025','EVT-003'))
 OR (u.email='gorka@sustraiapp.com' AND e.external_id IN ('EVT-020','EVT-001','EVT-016'))
 OR (u.email='amaia@sustraiapp.com' AND e.external_id IN ('EVT-010','EVT-013','EVT-022'))
 OR (u.email='unai@sustraiapp.com'  AND e.external_id IN ('EVT-021','EVT-018','EVT-028'))

UNION ALL

SELECT u.id_user, g.id, 'gastronomia'
FROM user_data.users u, market_data.gastronomy g
WHERE
    (u.email='ane@sustraiapp.com'   AND g.external_id IN ('GAST-001','GAST-003','GAST-011'))
 OR (u.email='mikel@sustraiapp.com' AND g.external_id IN ('GAST-023','GAST-009','GAST-012'))
 OR (u.email='leire@sustraiapp.com' AND g.external_id IN ('GAST-018','GAST-025','GAST-013'))
 OR (u.email='jon@sustraiapp.com'   AND g.external_id IN ('GAST-013','GAST-021','GAST-003'))
 OR (u.email='miren@sustraiapp.com' AND g.external_id IN ('GAST-010','GAST-015','GAST-025'))
 OR (u.email='gorka@sustraiapp.com' AND g.external_id IN ('GAST-001','GAST-002','GAST-023'))
 OR (u.email='amaia@sustraiapp.com' AND g.external_id IN ('GAST-014','GAST-026','GAST-011'))
 OR (u.email='unai@sustraiapp.com'  AND g.external_id IN ('GAST-023','GAST-030','GAST-005'))

UNION ALL

SELECT u.id_user, c.id, 'cultura'
FROM user_data.users u, market_data.culture c
WHERE
    (u.email='ane@sustraiapp.com'   AND c.external_id IN ('CULT-001','CULT-003','CULT-006'))
 OR (u.email='mikel@sustraiapp.com' AND c.external_id IN ('CULT-017','CULT-013','CULT-002'))
 OR (u.email='leire@sustraiapp.com' AND c.external_id IN ('CULT-011','CULT-014','CULT-015'))
 OR (u.email='jon@sustraiapp.com'   AND c.external_id IN ('CULT-003','CULT-019','CULT-021'))
 OR (u.email='miren@sustraiapp.com' AND c.external_id IN ('CULT-011','CULT-010','CULT-020'))
 OR (u.email='gorka@sustraiapp.com' AND c.external_id IN ('CULT-004','CULT-001','CULT-017'))
 OR (u.email='amaia@sustraiapp.com' AND c.external_id IN ('CULT-012','CULT-008','CULT-019'))
 OR (u.email='unai@sustraiapp.com'  AND c.external_id IN ('CULT-017','CULT-021','CULT-016'))

ON CONFLICT (user_id, entidad_id, entidad_tipo) DO NOTHING;

