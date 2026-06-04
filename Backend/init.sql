-- =============================================================
-- SUSTRAIAPP — Esquema v4 (Simplificado + Cualificaciones)
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
    external_id         VARCHAR(100) UNIQUE, -- Opcional: para ID externo si hace falta
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
    external_id             VARCHAR(100) UNIQUE, -- Opcional
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
    -- Eliminados michelin y repsol -> ahora van en gastronomy_qualifications
    is_sponsored            BOOLEAN DEFAULT FALSE,
    active                  BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gastro_municipality_active
    ON market_data.gastronomy (municipality_id, active);

-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS market_data.culture (
    id                  SERIAL PRIMARY KEY,
    external_id         VARCHAR(100) UNIQUE, -- Opcional
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
);

CREATE INDEX IF NOT EXISTS idx_culture_municipality ON market_data.culture (municipality_id);
CREATE INDEX IF NOT EXISTS idx_culture_active       ON market_data.culture (active);
CREATE INDEX IF NOT EXISTS idx_culture_tipo_lugar   ON market_data.culture (tipo_lugar);

-- -------------------------------------------------------------------
-- Cualificaciones (Simplificado)
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS market_data.qualifications (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50)  UNIQUE, -- Opcional, útil para filtros internos
    nombre      VARCHAR(100) NOT NULL
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

-- Tabla de relación (Simplificada: sin fechas ni notas)
CREATE TABLE IF NOT EXISTS market_data.gastronomy_qualifications (
    id                  SERIAL PRIMARY KEY,
    gastronomy_id       INTEGER NOT NULL REFERENCES market_data.gastronomy(id)      ON DELETE CASCADE,
    qualification_id    INTEGER NOT NULL REFERENCES market_data.qualifications(id)  ON DELETE RESTRICT,
    UNIQUE (gastronomy_id, qualification_id)
);

CREATE INDEX IF NOT EXISTS idx_gastro_qualif_gastronomy
    ON market_data.gastronomy_qualifications (gastronomy_id);
CREATE INDEX IF NOT EXISTS idx_gastro_qualif_qualification
    ON market_data.gastronomy_qualifications (qualification_id);

-- Vista actualizada
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

CREATE TABLE IF NOT EXISTS user_data.reviews (
    id          SERIAL  PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES user_data.users(id_user)   ON DELETE CASCADE,
    event_id    INTEGER          REFERENCES market_data.events(id)     ON DELETE CASCADE,
    gastro_id   INTEGER          REFERENCES market_data.gastronomy(id) ON DELETE CASCADE,
    culture_id  INTEGER          REFERENCES market_data.culture(id)    ON DELETE CASCADE,
    puntuacion  INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    texto       TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_single_entity CHECK (
        (event_id   IS NOT NULL)::int +
        (gastro_id  IS NOT NULL)::int +
        (culture_id IS NOT NULL)::int = 1
    )
);

CREATE INDEX IF NOT EXISTS idx_reviews_event   ON user_data.reviews (event_id)   WHERE event_id   IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_gastro  ON user_data.reviews (gastro_id)  WHERE gastro_id  IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_culture ON user_data.reviews (culture_id) WHERE culture_id IS NOT NULL;

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
-- SEED DATA (Municipios e Intereses básicos)
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

-- Raíces Intereses
INSERT INTO user_data.interests (nombre, father_id, level) VALUES
    ('Eventos',            NULL, 0),
    ('Gastronomía',        NULL, 0),
    ('Puntos de Interés',  NULL, 0)
ON CONFLICT DO NOTHING;

-- Eventos Level 1
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Eventos' AND level = 0), 1
FROM (VALUES
    ('Concierto'), ('Festival'), ('Fiestas'), ('Feria'), ('Teatro'),
    ('Danza'), ('Conferencia'), ('Cine'), ('Exposición')
) AS t(nombre) ON CONFLICT DO NOTHING;

-- Gastronomía Level 1
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Gastronomía' AND level = 0), 1
FROM (VALUES
    ('Restaurantes'), ('Bodegas'), ('Gourmet')
) AS t(nombre) ON CONFLICT DO NOTHING;

-- Puntos de Interés Level 1
INSERT INTO user_data.interests (nombre, father_id, level)
SELECT nombre, (SELECT id_interes FROM user_data.interests WHERE nombre = 'Puntos de Interés' AND level = 0), 1
FROM (VALUES ('Museos'), ('Patrimonio Cultural')) AS t(nombre)
ON CONFLICT DO NOTHING;

-- =============================================================
-- SUSTRAIAPP — Seed data v4 (esquema con qualifications)
-- Gastronomía (70), Cultura (65), Eventos (100)
-- País Vasco — datos ficticios para desarrollo
-- =============================================================

-- =============================================================
-- GASTRONOMÍA (70 registros)
-- Cubre: mejor-valorados (num_resenas>=10, valoracion alta),
--        entorno-especial, cerca-de-ti (8 municipios),
--        michelin/repsol via gastronomy_qualifications, todos
-- =============================================================

INSERT INTO market_data.gastronomy
  (nombre, descripcion, municipality_id, lat, lng, type, tipo_comida, entorno,
   email, web, categoria, calidad, url_imagen, valoracion, num_resenas,
   nivel_precio, national_phone_number, is_sponsored, active)
VALUES
-- ── Bilbao (municipality_id=1) ──────────────────────────────
('Azurmendi',         'Restaurante de alta cocina vasca con tres estrellas Michelin',    1, 43.2720, -2.9100, 'Restaurante', 'Alta Cocina',    'Montaña',  'info@azurmendi.biz',       'https://azurmendi.biz',           'Gourmet',  TRUE, 'https://example.com/img/azurmendi.jpg',  5.0, 840, 'alto',  '+34 944 558 866', FALSE, TRUE),
('Nerua Guggenheim',  'Cocina de autor con vistas al Guggenheim Bilbao',                 1, 43.2685, -2.9340, 'Restaurante', 'Cocina Vasca',   'Urbano',   'nerua@guggenheim.eus',     'https://nerua.com',               'Gourmet',  TRUE, 'https://example.com/img/nerua.jpg',      4.8, 620, 'alto',  '+34 944 000 430', FALSE, TRUE),
('Etxanobe Atelier',  'Propuesta creativa en el corazón de Bilbao',                     1, 43.2640, -2.9240, 'Restaurante', 'Cocina Vasca',   'Urbano',   'etxanobe@etxanobe.com',    'https://etxanobe.com',            'Gourmet',  TRUE, 'https://example.com/img/etxanobe.jpg',   4.7, 510, 'alto',  '+34 944 421 071', FALSE, TRUE),
('Mina Restaurante',  'Cocina de mercado junto a la ría de Bilbao',                     1, 43.2600, -2.9250, 'Restaurante', 'Cocina Vasca',   'Puerto',   'reservas@minarestaurante.com','https://minarestaurante.com',    'Gourmet',  TRUE, 'https://example.com/img/mina.jpg',       4.9, 380, 'alto',  '+34 944 795 938', FALSE, TRUE),
('Bar Gure Toki',     'Pintxos tradicionales en el Casco Viejo de Bilbao',              1, 43.2574, -2.9237, 'Bar',         'Pintxos',        'Histórico','info@guretoki.com',         'https://guretoki.com',            'Casual',   FALSE,'https://example.com/img/guretoki.jpg',   4.4, 950, 'bajo',  '+34 944 158 037', FALSE, TRUE),
('La Viña del Ensanche','Taberna de vinos y tapas en el ensanche bilbaíno',             1, 43.2630, -2.9360, 'Bar',         'Tapas',          'Urbano',   'laviña@ensanche.com',      NULL,                              'Casual',   FALSE,'https://example.com/img/lavina.jpg',     4.3, 760, 'bajo',  '+34 944 154 278', FALSE, TRUE),
('Restaurante Zortziko','Alta gastronomía vasca de autor',                              1, 43.2618, -2.9255, 'Restaurante', 'Alta Cocina',    'Urbano',   'zortziko@zortziko.com',    'https://zortziko.com',            'Gourmet',  TRUE, 'https://example.com/img/zortziko.jpg',   4.6, 290, 'alto',  '+34 944 239 743', FALSE, TRUE),
('El Perro Chico',    'Cocina de fusión en la orilla izquierda',                        1, 43.2550, -2.9200, 'Restaurante', 'Fusión',         'Urbano',   'elprrochico@gmail.com',    NULL,                              'Gastrobar', FALSE,'https://example.com/img/perrochico.jpg',4.2, 430, 'medio', '+34 944 150 119', FALSE, TRUE),
('Bascook',           'Restaurante en antigua fábrica, cocina creativa vasca',           1, 43.2645, -2.9310, 'Restaurante', 'Cocina Vasca',   'Industrial','info@bascook.com',         'https://bascook.com',             'Gourmet',  TRUE, 'https://example.com/img/bascook.jpg',    4.5, 340, 'medio', '+34 944 009 977', FALSE, TRUE),
('Café Iruña',        'Histórico café restaurante del siglo XIX en Bilbao',             1, 43.2625, -2.9349, 'Café',        'Tradicional',    'Histórico','cafeiruna@cafeiruna.com',  'https://cafeiruna.com',           'Casual',   FALSE,'https://example.com/img/iruna.jpg',      4.1, 1100,'bajo',  '+34 944 237 021', FALSE, TRUE),

-- ── Getxo (municipality_id=2) ───────────────────────────────
('Andra Mari',        'Cocina vasca clásica en caserío del siglo XVII en Getxo',        2, 43.3400, -3.0100, 'Restaurante', 'Cocina Vasca',   'Rural',    'andramari@andramari.com',  'https://andramari.com',           'Gourmet',  TRUE, 'https://example.com/img/andramari.jpg',  4.8, 450, 'alto',  '+34 944 630 052', FALSE, TRUE),
('Portuondo',         'Pescados y mariscos con vistas al puerto deportivo de Getxo',    2, 43.3600, -3.0200, 'Restaurante', 'Pescados',       'Puerto',   'info@portuondo.eus',       'https://portuondo.eus',           'Gourmet',  TRUE, 'https://example.com/img/portuondo.jpg',  4.7, 320, 'alto',  '+34 944 910 279', FALSE, TRUE),
('El Embarcadero Getxo','Mariscos y pintxos junto al muelle de Getxo',                 2, 43.3580, -3.0190, 'Bar',         'Mariscos',       'Puerto',   'embarcadero@getxo.eus',    NULL,                              'Casual',   FALSE,'https://example.com/img/embarcadero.jpg',4.3, 280, 'medio', '+34 944 910 100', FALSE, TRUE),
('Restaurante Las Arenas','Cocina tradicional con vistas al mar en Las Arenas',         2, 43.3520, -3.0050, 'Restaurante', 'Cocina Vasca',   'Costa',    'lasarenas@eus.com',        NULL,                              'Gastrobar', FALSE,'https://example.com/img/lasarenas.jpg',  4.2, 190, 'medio', '+34 944 910 200', FALSE, TRUE),
('Txomin Getxo',      'Sidrería con menú de temporada y panorámicas del Abra',         2, 43.3450, -3.0080, 'Sidrería',    'Tradicional',    'Costa',    'txomin@getxo.com',         NULL,                              'Casual',   FALSE,'https://example.com/img/txomin.jpg',     4.0, 210, 'bajo',  '+34 944 910 300', FALSE, TRUE),

-- ── Barakaldo (municipality_id=3) ───────────────────────────
('Barakaldo Gastro',  'Cocina de autor en el corazón industrial de Barakaldo',          3, 43.2950, -2.9950, 'Restaurante', 'Cocina Vasca',   'Urbano',   'info@barakaldogastro.com', NULL,                              'Gastrobar', FALSE,'https://example.com/img/barakaldogastro.jpg',4.3,220,'medio','+34 944 188 000', FALSE, TRUE),
('La Bodega de Ugarte','Vinos de Rioja Alavesa y pintxos en Barakaldo',                3, 43.2970, -2.9920, 'Bar',         'Pintxos',        'Urbano',   'ugarte@bodega.com',        NULL,                              'Casual',   FALSE,'https://example.com/img/ugarte.jpg',     4.1, 310, 'bajo',  '+34 944 188 100', FALSE, TRUE),
('Txakoli Barakaldo', 'Cocina vasca acompañada de txakoli artesano',                   3, 43.2980, -2.9900, 'Restaurante', 'Cocina Vasca',   'Urbano',   'txakoli@barakaldo.eus',    NULL,                              'Casual',   FALSE,'https://example.com/img/txakolibar.jpg', 4.0, 180, 'medio', '+34 944 188 200', FALSE, TRUE),
('Restaurante Zaballa','Menú del día y cocina casera vasca',                            3, 43.2960, -2.9960, 'Restaurante', 'Tradicional',    'Urbano',   'zaballa@restaurante.com',  NULL,                              'Casual',   FALSE,'https://example.com/img/zaballa.jpg',    3.9, 150, 'bajo',  '+34 944 188 300', FALSE, TRUE),
('Sidrería Rekalde',  'Auténtica sidrería vasca con sidra natural de temporada',        3, 43.2940, -2.9930, 'Sidrería',    'Tradicional',    'Urbano',   'rekalde@sidra.eus',        NULL,                              'Casual',   FALSE,'https://example.com/img/rekalde.jpg',    4.2, 260, 'bajo',  '+34 944 188 400', FALSE, TRUE),

-- ── San Sebastián (municipality_id=4) ───────────────────────
('Arzak',             'Tres estrellas Michelin, icono de la nueva cocina vasca',        4, 43.3050, -1.9750, 'Restaurante', 'Alta Cocina',    'Urbano',   'arzak@arzak.es',           'https://arzak.es',                'Gourmet',  TRUE, 'https://example.com/img/arzak.jpg',      5.0, 1200,'alto',  '+34 943 278 465', FALSE, TRUE),
('Mugaritz',          'Alta cocina experimental en las afueras de San Sebastián',       4, 43.2800, -1.9600, 'Restaurante', 'Alta Cocina',    'Rural',    'mugaritz@mugaritz.com',    'https://mugaritz.com',            'Gourmet',  TRUE, 'https://example.com/img/mugaritz.jpg',   4.9, 780, 'alto',  '+34 943 522 455', FALSE, TRUE),
('Martín Berasategui','Once estrellas Michelin, el chef más laureado de España',        4, 43.2900, -1.9700, 'Restaurante', 'Alta Cocina',    'Rural',    'info@martinberasategui.com','https://martinberasategui.com',   'Gourmet',  TRUE, 'https://example.com/img/berasategui.jpg',5.0, 950, 'alto',  '+34 943 366 471', FALSE, TRUE),
('La Viña',           'La mejor tarta de queso del mundo, en el centro de Donostia',   4, 43.3230, -1.9840, 'Bar',         'Pintxos',        'Histórico','lavina@lavina.com',         'https://lavinasansebastian.com',  'Casual',   FALSE,'https://example.com/img/lavinadss.jpg',  4.6, 2100,'bajo',  '+34 943 427 495', FALSE, TRUE),
('Bar Txepetxa',      'El mejor bar de anchoas del mundo, en la Parte Vieja',          4, 43.3232, -1.9842, 'Bar',         'Pintxos',        'Histórico','txepetxa@txepetxa.com',    NULL,                              'Casual',   FALSE,'https://example.com/img/txepetxa.jpg',   4.5, 1450,'bajo',  '+34 943 422 227', FALSE, TRUE),
('Gandarias',         'Pintxos premiados y carne a la plancha en la Parte Vieja',       4, 43.3228, -1.9839, 'Bar',         'Pintxos',        'Histórico','gandarias@gandarias.com',  'https://restaurantegandarias.com','Gastrobar', FALSE,'https://example.com/img/gandarias.jpg',  4.4, 1800,'medio', '+34 943 426 362', FALSE, TRUE),
('Rekondo',           'Bodega centenaria con cocina vasca de producto',                 4, 43.3100, -2.0000, 'Restaurante', 'Cocina Vasca',   'Urbano',   'rekondo@rekondo.com',      'https://rekondo.com',             'Gourmet',  TRUE, 'https://example.com/img/rekondo.jpg',    4.7, 420, 'alto',  '+34 943 212 907', FALSE, TRUE),
('Casa Nicolasa',     'Cocina donostiarra clásica con recetas de temporada',            4, 43.3210, -1.9820, 'Restaurante', 'Cocina Vasca',   'Histórico','casanicolasa@eus.com',     'https://casanicolasa.com',        'Gourmet',  TRUE, 'https://example.com/img/casanicolasa.jpg',4.6,360,'alto',  '+34 943 421 762', FALSE, TRUE),
('Bodegón Alejandro', 'Bistrot vasco con sidra y cocina de mercado',                   4, 43.3218, -1.9831, 'Restaurante', 'Cocina Vasca',   'Histórico','bodegon@alejandro.eus',    NULL,                              'Gastrobar', FALSE,'https://example.com/img/bodegalejandro.jpg',4.3,530,'medio','+34 943 427 158', FALSE, TRUE),

-- ── Vitoria-Gasteiz (municipality_id=5) ─────────────────────
('El Clarete',        'Restaurante en bodega histórica del Casco Medieval de Vitoria',  5, 42.8490, -2.6720, 'Restaurante', 'Cocina Vasca',   'Histórico','clarete@clarete.eus',      'https://elclarete.com',           'Gourmet',  TRUE, 'https://example.com/img/clarete.jpg',    4.7, 390, 'alto',  '+34 945 143 921', FALSE, TRUE),
('Ikea Restaurante',  'Cocina alavesa de producto en el centro de la ciudad',           5, 42.8470, -2.6730, 'Restaurante', 'Cocina Vasca',   'Urbano',   'ikea@ikea.eus',            'https://restauranteikea.com',     'Gourmet',  TRUE, 'https://example.com/img/ikea.jpg',       4.8, 280, 'alto',  '+34 945 144 747', FALSE, TRUE),
('Saburdi',           'Menú degustación con productos de la huerta alavesa',            5, 42.8480, -2.6710, 'Restaurante', 'Alta Cocina',    'Urbano',   'saburdi@saburdi.eus',      NULL,                              'Gourmet',  TRUE, 'https://example.com/img/saburdi.jpg',    4.6, 230, 'alto',  '+34 945 132 934', FALSE, TRUE),
('Zaldiaran',         'Dos estrellas Michelin, cocina vasca contemporánea',             5, 42.8460, -2.6740, 'Restaurante', 'Alta Cocina',    'Urbano',   'zaldiaran@zaldiaran.eus',  'https://zaldiaran.com',           'Gourmet',  TRUE, 'https://example.com/img/zaldiaran.jpg',  4.9, 410, 'alto',  '+34 945 130 206', FALSE, TRUE),
('Bar Deportivo Gasteiz','Pintxos y ambiente deportivo en el corazón de Vitoria',      5, 42.8465, -2.6725, 'Bar',         'Pintxos',        'Urbano',   'deportivo@gasteiz.eus',    NULL,                              'Casual',   FALSE,'https://example.com/img/deportivo.jpg',  4.0, 540, 'bajo',  '+34 945 130 300', FALSE, TRUE),
('Taberna Txagorritxu','Taberna alavesa con menú de temporada y vinos de Rioja',       5, 42.8500, -2.6700, 'Bar',         'Tapas',          'Urbano',   'txagorritxu@taberna.eus',  NULL,                              'Casual',   FALSE,'https://example.com/img/txagorritxu.jpg',4.2,420,'bajo',  '+34 945 130 400', FALSE, TRUE),
('Cámara Restaurante','Cocina vasca en la antigua Cámara de Comercio de Vitoria',      5, 43.2490, -2.6690, 'Restaurante', 'Cocina Vasca',   'Histórico','camara@restaurante.eus',   NULL,                              'Gourmet',  TRUE, 'https://example.com/img/camara.jpg',     4.5, 300, 'medio', '+34 945 130 500', FALSE, TRUE),

-- ── Irún (municipality_id=6) ─────────────────────────────────
('Ama Lau',           'Restaurante fronterizo con cocina vasca-francesa',               6, 43.3390, -1.7880, 'Restaurante', 'Cocina Vasca',   'Urbano',   'amalau@iru.eus',           NULL,                              'Gastrobar', FALSE,'https://example.com/img/amalau.jpg',     4.3, 220, 'medio', '+34 943 620 100', FALSE, TRUE),
('Txoko Irun',        'Pintxos y bocadillos tradicionales en Irún',                    6, 43.3400, -1.7870, 'Bar',         'Pintxos',        'Urbano',   'txoko@irun.eus',           NULL,                              'Casual',   FALSE,'https://example.com/img/txokoirun.jpg',  4.1, 330, 'bajo',  '+34 943 620 200', FALSE, TRUE),
('Sidrería Borda',    'Sidrería con menú tradicional y sidra de manzana vasca',        6, 43.3350, -1.7900, 'Sidrería',    'Tradicional',    'Rural',    'borda@sidra.eus',          NULL,                              'Casual',   FALSE,'https://example.com/img/borda.jpg',      4.2, 180, 'bajo',  '+34 943 620 300', FALSE, TRUE),
('Mariscos Bidasoa',  'Pescados y mariscos frescos a orillas del Bidasoa',             6, 43.3420, -1.7850, 'Restaurante', 'Pescados',       'Costa',    'bidasoa@mariscos.eus',     NULL,                              'Gastrobar', FALSE,'https://example.com/img/bidasoa.jpg',    4.4, 260, 'medio', '+34 943 620 400', FALSE, TRUE),
('Asador Jaizubia',   'Asador con carnes y pescados a la brasa en entorno natural',    6, 43.3310, -1.7950, 'Asador',      'Carnes',         'Montaña',  'jaizubia@asador.eus',      NULL,                              'Gastrobar', FALSE,'https://example.com/img/jaizubia.jpg',   4.5, 200, 'medio', '+34 943 620 500', FALSE, TRUE),

-- ── Ermua (municipality_id=7) ────────────────────────────────
('Asador Ermua',      'Carnes y pescados a la brasa en pleno Ermua',                   7, 43.1900, -2.5010, 'Asador',      'Carnes',         'Urbano',   'asador@ermua.eus',         NULL,                              'Gastrobar', FALSE,'https://example.com/img/asadorermua.jpg',4.3,170,'medio','+34 943 170 100', FALSE, TRUE),
('Bar Elkano Ermua',  'Pintxos y sidra en el centro de Ermua',                         7, 43.1910, -2.5000, 'Bar',         'Pintxos',        'Urbano',   'elkano@ermua.eus',         NULL,                              'Casual',   FALSE,'https://example.com/img/elkanoermua.jpg',4.0,240,'bajo', '+34 943 170 200', FALSE, TRUE),
('Taberna Otxarkoaga','Cocina casera vasca y menús económicos',                        7, 43.1880, -2.5020, 'Restaurante', 'Tradicional',    'Urbano',   'otxarkoaga@taberna.eus',   NULL,                              'Casual',   FALSE,'https://example.com/img/otxarkoaga.jpg', 3.9, 130, 'bajo',  '+34 943 170 300', FALSE, TRUE),

-- ── Durango (municipality_id=8) ──────────────────────────────
('Kurutziaga Jatetxea','Cocina vasca en el histórico palacio de Kurutziaga',           8, 43.1710, -2.6320, 'Restaurante', 'Cocina Vasca',   'Histórico','kurutziaga@durango.eus',   NULL,                              'Gourmet',  TRUE, 'https://example.com/img/kurutziaga.jpg', 4.6, 200, 'alto',  '+34 946 810 100', FALSE, TRUE),
('Bar Txakoli Durango','Txakoli y pintxos en el centro de Durango',                   8, 43.1720, -2.6310, 'Bar',         'Pintxos',        'Urbano',   'txakoli@durango.eus',      NULL,                              'Casual',   FALSE,'https://example.com/img/txakolidur.jpg', 4.1, 310, 'bajo',  '+34 946 810 200', FALSE, TRUE),
('Sidrería Urkiola',  'Sidrería en la falda del monte Urkiola con vistas espectaculares',8,43.1650,-2.6400,'Sidrería',   'Tradicional',    'Montaña',  'urkiola@sidra.eus',        NULL,                              'Casual',   FALSE,'https://example.com/img/urkiola.jpg',    4.4, 280, 'bajo',  '+34 946 810 300', FALSE, TRUE),
('Asador Iurreta',    'Cordero y bacalao al horno de piedra en Durango',               8, 43.1730, -2.6290, 'Asador',      'Carnes',         'Urbano',   'iurreta@asador.eus',       NULL,                              'Gastrobar', FALSE,'https://example.com/img/iurreta.jpg',    4.3, 190, 'medio', '+34 946 810 400', FALSE, TRUE),
('Restaurante Goiko', 'Menú de temporada con productos del mercado de Durango',        8, 43.1700, -2.6330, 'Restaurante', 'Cocina Vasca',   'Urbano',   'goiko@restaurante.eus',    NULL,                              'Gastrobar', FALSE,'https://example.com/img/goiko.jpg',      4.2, 170, 'medio', '+34 946 810 500', FALSE, TRUE),

-- ── Extra Bilbao — más variedad ─────────────────────────────
('Restaurante Kaia Kaipe','Cocina marinera con vistas a la ría de Bilbao',             1, 43.2610, -2.9300, 'Restaurante', 'Pescados',       'Puerto',   'kaiakaipe@eus.com',        NULL,                              'Gourmet',  TRUE, 'https://example.com/img/kaiakaipe.jpg',  4.6, 280, 'alto',  '+34 944 201 800', FALSE, TRUE),
('Taberna Tximista',  'Vinos naturales y tapas creativas en Bilbao',                   1, 43.2620, -2.9320, 'Bar',         'Tapas',          'Urbano',   'tximista@taberna.eus',     NULL,                              'Gastrobar', FALSE,'https://example.com/img/tximista.jpg',   4.3, 380, 'medio', '+34 944 201 900', FALSE, TRUE),
('Restaurante Yandiola','Cocina vasca de alta gama en el Mercado de la Ribera',        1, 43.2590, -2.9200, 'Restaurante', 'Alta Cocina',    'Histórico','yandiola@yandiola.com',    'https://yandiola.com',            'Gourmet',  TRUE, 'https://example.com/img/yandiola.jpg',   4.8, 310, 'alto',  '+34 944 139 481', FALSE, TRUE),
('Pintxos Ganbara',   'Pintxos de alta calidad en el Casco Viejo bilbaíno',            1, 43.2578, -2.9242, 'Bar',         'Pintxos',        'Histórico','ganbara@pintxos.eus',      NULL,                              'Casual',   FALSE,'https://example.com/img/ganbara.jpg',    4.5, 1200,'bajo',  '+34 944 157 399', FALSE, TRUE),
('Bermeo Restaurante','Especialistas en bacalao y cocina marinera vizcaína',           1, 43.2600, -2.9280, 'Restaurante', 'Pescados',       'Puerto',   'bermeo@restaurante.eus',   NULL,                              'Gastrobar', FALSE,'https://example.com/img/bermeo.jpg',     4.4, 460, 'medio', '+34 944 120 000', FALSE, TRUE),
('Cantina Bilbaina',  'Delicias caseras y ambiente de siempre en Bilbao la Vieja',     1, 43.2555, -2.9188, 'Restaurante', 'Tradicional',    'Histórico','cantina@bilbaina.eus',     NULL,                              'Casual',   FALSE,'https://example.com/img/cantina.jpg',    4.0, 550, 'bajo',  '+34 944 120 100', FALSE, TRUE),

-- ── Extra San Sebastián ─────────────────────────────────────
('Kokotxa',           'Cocina vasca de autor en plena Parte Vieja de San Sebastián',   4, 43.3220, -1.9838, 'Restaurante', 'Cocina Vasca',   'Histórico','kokotxa@kokotxa.com',      'https://restaurantekokotxa.com',  'Gourmet',  TRUE, 'https://example.com/img/kokotxa.jpg',    4.7, 340, 'alto',  '+34 943 421 904', FALSE, TRUE),
('Narru',             'Cocina vasca contemporánea con menú degustación',               4, 43.3212, -1.9820, 'Restaurante', 'Alta Cocina',    'Urbano',   'narru@narru.eus',          'https://narru.eus',               'Gourmet',  TRUE, 'https://example.com/img/narru.jpg',      4.6, 290, 'alto',  '+34 943 423 099', FALSE, TRUE),
('Bar Bergara',       'Pintxos creativos premiados en la Gros de San Sebastián',       4, 43.3248, -1.9760, 'Bar',         'Pintxos',        'Urbano',   'bergara@bergara.eus',      NULL,                              'Casual',   FALSE,'https://example.com/img/bergara.jpg',    4.5, 1600,'bajo',  '+34 943 275 026', FALSE, TRUE),
('Bodega Donostiarra','Sidrería y taberna vasca en la periferia de San Sebastián',     4, 43.3080, -1.9900, 'Sidrería',    'Tradicional',    'Rural',    'donostiarra@bodega.eus',   NULL,                              'Casual',   FALSE,'https://example.com/img/donostiarra.jpg',4.2,390,'bajo', '+34 943 311 500', FALSE, TRUE),

-- ── Entornos especiales adicionales ─────────────────────────
('Asador Etxebarri',  'El mejor asador del mundo según The World\'s 50 Best',          8, 43.1500, -2.6500, 'Asador',      'Carnes',         'Montaña',  'etxebarri@asador.eus',     'https://asadorestetxebarri.com',  'Gourmet',  TRUE, 'https://example.com/img/etxebarri.jpg',  5.0, 730, 'alto',  '+34 946 583 042', FALSE, TRUE),
('Txoko de la Costa', 'Mariscos y vistas al Cantábrico en primera línea de playa',     2, 43.3700, -3.0300, 'Restaurante', 'Mariscos',       'Costa',    'costa@txoko.eus',          NULL,                              'Gastrobar', FALSE,'https://example.com/img/txokocosta.jpg', 4.4, 310, 'medio', '+34 944 910 600', FALSE, TRUE),
('Venta Malkorra',    'Cocina tradicional en caserío del siglo XVIII en Durango',      8, 43.1600, -2.6400, 'Restaurante', 'Tradicional',    'Rural',    'malkorra@venta.eus',       NULL,                              'Casual',   FALSE,'https://example.com/img/malkorra.jpg',   4.3, 220, 'bajo',  '+34 946 810 600', FALSE, TRUE),
('Restaurante Zuberoa','Una estrella Michelin con cocina franco-vasca en Oiartzun',    4, 43.2750, -1.9550, 'Restaurante', 'Alta Cocina',    'Rural',    'zuberoa@zuberoa.com',      'https://zuberoa.com',             'Gourmet',  TRUE, 'https://example.com/img/zuberoa.jpg',    4.9, 400, 'alto',  '+34 943 491 228', FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- =============================================================
-- QUALIFICATIONS — asignar a restaurantes concretos
-- (michelin_estrella=2, repsol_sol=1 según catálogo inicial)
-- =============================================================

-- Primero insertar usando subconsultas por nombre de restaurante
INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id
FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Azurmendi' AND q.codigo = 'michelin_estrella'
ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Azurmendi' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Nerua Guggenheim' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Etxanobe Atelier' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Mina Restaurante' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Mina Restaurante' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Restaurante Zortziko' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Bascook' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Andra Mari' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Andra Mari' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Portuondo' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Arzak' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Arzak' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Mugaritz' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Martín Berasategui' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Martín Berasategui' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'El Clarete' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Ikea Restaurante' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Zaldiaran' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Zaldiaran' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Kurutziaga Jatetxea' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Restaurante Yandiola' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Restaurante Yandiola' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Kokotxa' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Rekondo' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Asador Etxebarri' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Asador Etxebarri' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Restaurante Zuberoa' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Narru' AND q.codigo = 'michelin_estrella' ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre = 'Saburdi' AND q.codigo = 'repsol_sol' ON CONFLICT DO NOTHING;

-- Qualificaciones adicionales (Q calidad, eusko label, etc.)
INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre IN ('Azurmendi','Arzak','Martín Berasategui','Asador Etxebarri') AND q.codigo = 'q_calidad'
ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre IN ('Azurmendi','Sidrería Urkiola','Sidrería Borda','Sidrería Rekalde') AND q.codigo = 'euskolabel'
ON CONFLICT DO NOTHING;

INSERT INTO market_data.gastronomy_qualifications (gastronomy_id, qualification_id)
SELECT g.id, q.id FROM market_data.gastronomy g, market_data.qualifications q
WHERE g.nombre IN ('Venta Malkorra','Txakoli Barakaldo','Bar Txakoli Durango') AND q.codigo = 'euskal_baserri'
ON CONFLICT DO NOTHING;

-- =============================================================
-- CULTURA (65 registros)
-- Cubre: museos, patrimonio cultural, visita_guiada=true,
--        cerca-de-ti (8 municipios), todos
-- =============================================================

INSERT INTO market_data.culture
  (fuente, nombre, tipo_lugar, tipo_cultura, descripcion, precio, horario,
   telefono, email, web, imagen_url, municipality_id, direccion, codigo_postal,
   visita_guiada, capacidad, tienda, lat, lng, valoracion, numero_valoraciones,
   is_sponsored, active)
VALUES
-- ── Bilbao — Museos ─────────────────────────────────────────
('Manual','Museo Guggenheim Bilbao',              'Museo',               'Arte Contemporáneo','Museo de arte contemporáneo diseñado por Frank Gehry, icono de Bilbao y referente mundial', '18€',   '{"lu":"cerrado","ma-do":"10:00-20:00"}','944 359 080','info@guggenheim-bilbao.eus','https://guggenheim-bilbao.eus', 'https://example.com/img/guggenheim.jpg',  1,'Abandoibarra Etorb., 2',      '48001',TRUE, 2000,TRUE, 43.2688,-2.9340, 4.9,18500,TRUE, TRUE),
('Manual','Museo de Bellas Artes de Bilbao',      'Museo',               'Arte',             'Destacada colección de pintura vasca, española y europea del siglo XII al XXI',          '10€',   '{"lu":"cerrado","ma-do":"10:00-20:00"}','944 396 060','info@museobilbao.com',      'https://museobilbao.com',       'https://example.com/img/museobbaa.jpg',   1,'Museo Plaza, 2',              '48009',TRUE, 800, TRUE, 43.2668,-2.9424, 4.7, 7200,FALSE,TRUE),
('Manual','Museo Marítimo Ría de Bilbao',         'Museo',               'Marítimo',         'Historia marítima del País Vasco a través de barcos, maquetas y exposiciones interactivas','8€',   '{"ma-do":"10:00-19:00"}',               '946 081 000','info@museomaritimobilbao.org','https://museomaritimobilbao.org','https://example.com/img/maritimo.jpg',   1,'Muelle Ramón de la Sota, 1',  '48013',TRUE, 500, TRUE, 43.2600,-2.9280, 4.5, 3800,FALSE,TRUE),
('Manual','Euskal Museoa – Museo Vasco',          'Museo',               'Etnografía',       'El mayor museo de historia y etnografía vasca, en el Casco Viejo de Bilbao',             '6€',    '{"lu":"cerrado","ma-sa":"11:00-17:00","do":"11:00-14:00"}','944 155 423','info@euskalmuseoa.eus','https://euskalmuseoa.eus', 'https://example.com/img/euskalmuseoa.jpg',1,'Miguel de Unamuno Pl., 4',    '48006',TRUE, 400, TRUE, 43.2574,-2.9232, 4.4, 4100,FALSE,TRUE),
('Manual','Alhóndiga Bilbao – Azkuna Zentroa',    'Museo',               'Cultura Urbana',   'Centro cultural en antigua bodega del s.XIX con piscina, cine y exposiciones',            'Gratis','{"lu-do":"07:00-23:00"}',               '944 014 014','info@azkunazentroa.eus',    'https://azkunazentroa.eus',     'https://example.com/img/azkuna.jpg',      1,'Arriquíbar Pl., 4',           '48010',FALSE,3000,FALSE,43.2629,-2.9380, 4.6, 9200,FALSE,TRUE),
('Manual','BilbaoArte Fundazioa',                 'Museo',               'Arte Contemporáneo','Espacio de creación contemporánea con residencias artísticas y exposiciones temporales',  'Gratis','{"ma-sa":"10:00-14:00,16:00-20:00"}',   '944 156 766','info@bilbaoarte.org',       'https://bilbaoarte.org',        'https://example.com/img/bilbaoarte.jpg',  1,'Urazurrutia, 32',             '48003',TRUE, 200, FALSE,43.2551,-2.9197, 4.2, 1200,FALSE,TRUE),

-- ── Bilbao — Patrimonio ─────────────────────────────────────
('Manual','Catedral de Santiago de Bilbao',       'Patrimonio Cultural',  'Religioso',       'Catedral gótica del siglo XIV, punto de inicio del Camino del Norte',                    'Gratis','{"ma-do":"10:00-13:00,17:00-19:30"}', '944 150 627','catedral@bilbao.eus',       NULL,                            'https://example.com/img/catedral.jpg',    1,'Plaza Santiago, 1',           '48005',TRUE, 600, FALSE,43.2573,-2.9231, 4.5, 6300,FALSE,TRUE),
('Manual','Puente Colgante de Bizkaia',           'Patrimonio Cultural',  'Ingeniería',      'Patrimonio Mundial UNESCO, el puente transbordador más antiguo del mundo (1893)',         '9€',    '{"lu-do":"10:00-21:00"}',               '944 801 012','info@puente-colgante.com',  'https://puente-colgante.com',   'https://example.com/img/puente.jpg',      1,'Calle Dos de Mayo',           '48930',TRUE, 300, TRUE, 43.3250,-3.0150, 4.8, 8900,FALSE,TRUE),
('Manual','Teatro Arriaga',                       'Patrimonio Cultural',  'Arquitectura',    'Imponente teatro neobarroco de 1890 a orillas del Nervión, corazón cultural de Bilbao',   'Variable','{"visitas":"sa-do 12:30"}',          '944 163 333','info@teatroarriaga.eus',    'https://teatroarriaga.eus',     'https://example.com/img/arriaga.jpg',     1,'Arriaga Pl., 1',              '48005',TRUE, 1000,FALSE,43.2594,-2.9249, 4.7, 5100,FALSE,TRUE),
('Manual','Casco Viejo – Siete Calles',           'Patrimonio Cultural',  'Histórico',       'Núcleo histórico medieval de Bilbao con las famosas Siete Calles del siglo XIV',          'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/cascovic.jpg',    1,'Casco Viejo',                 '48005',TRUE, 5000,FALSE,43.2576,-2.9234, 4.6,12000,FALSE,TRUE),

-- ── Getxo ───────────────────────────────────────────────────
('Manual','Getxo Aquarium',                       'Museo',               'Natural',          'Acuario con más de 5.000 ejemplares marinos del Cantábrico',                              '12€',   '{"ma-do":"10:00-18:00"}',               '944 910 700','info@getxoaquarium.eus',    NULL,                            'https://example.com/img/acuario.jpg',     2,'Puerto Viejo, s/n',           '48992',TRUE, 600, TRUE, 43.3605,-3.0210, 4.3, 2100,FALSE,TRUE),
('Manual','Museo Arquitectura y Urbanismo Getxo', 'Museo',               'Arquitectura',     'Colección sobre la arquitectura modernista y los palacios de Las Arenas',                 '5€',    '{"ma-sa":"10:00-14:00,16:00-19:00"}',   '944 910 800','museo@getxo.eus',           NULL,                            'https://example.com/img/museogetxo.jpg',  2,'Avda. Zugatzarte, 22',        '48992',TRUE, 200, FALSE,43.3560,-3.0070, 4.1,  900,FALSE,TRUE),
('Manual','Muelle de Arriluze – Puerto Viejo',    'Patrimonio Cultural',  'Marítimo',        'Histórico Puerto Viejo de Algorta con restaurantes, bares y ambiente marinero',           'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/puertoviejogetxo.jpg',2,'Puerto Viejo de Algorta','48992',FALSE,2000,FALSE,43.3608,-3.0218, 4.5, 4200,FALSE,TRUE),
('Manual','Villa Miramar – Palacio Lezama-Leguizamón','Patrimonio Cultural','Arquitectura', 'Palacio modernista con jardines al estilo inglés, joyas de la arquitectura de Las Arenas', 'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/miramar.jpg',     2,'Avda. Zugazarte, s/n',        '48930',TRUE, 150, FALSE,43.3540,-3.0060, 4.2,  700,FALSE,TRUE),

-- ── Barakaldo ───────────────────────────────────────────────
('Manual','Bilbao Exhibition Centre (BEC)',       'Museo',               'Cultura Urbana',   'Centro de exposiciones y congresos, referente en eventos culturales de Bizkaia',          'Variable','{}',                              '944 040 000','info@bilbaoexhibition.com', 'https://bilbaoexhibition.com',  'https://example.com/img/bec.jpg',         3,'Ronda de Azkue, 1',           '48902',FALSE,5000,FALSE,43.3020,-2.9940, 4.3, 2800,FALSE,TRUE),
('Manual','Sagrado Corazón de Barakaldo',         'Patrimonio Cultural',  'Religioso',       'Iglesia neo-gótica del siglo XX, hito arquitectónico de Barakaldo',                      'Gratis','{"lu-do":"9:00-12:00,18:00-20:00"}',   '944 180 000','sagrado@barakaldo.eus',     NULL,                            'https://example.com/img/sagradocorazon.jpg',3,'Plaza de los Fueros, 1',    '48901',TRUE, 400, FALSE,43.2965,-2.9940, 4.0, 1100,FALSE,TRUE),
('Manual','Parque Doña Casilda de Iturrizar',     'Patrimonio Cultural',  'Parques',         'El jardín más hermoso de Bilbao, escenario de conciertos y actividades culturales',       'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/casilda.jpg',     1,'Don Diego López Haroko Kale Nagusia','48013',FALSE,10000,FALSE,43.2665,-2.9395,4.7,9800,FALSE,TRUE),

-- ── San Sebastián ───────────────────────────────────────────
('Manual','Museo San Telmo',                      'Museo',               'Etnografía',       'Museo de sociedad y ciudadanía vasca en convento del siglo XVI, San Sebastián',           '6€',    '{"lu":"cerrado","ma-do":"10:00-20:00"}','943 481 580','info@santelmomuseoa.eus',   'https://santelmomuseoa.eus',    'https://example.com/img/santelmo.jpg',    4,'Plaza Zuloaga, 1',            '20003',TRUE, 600, TRUE, 43.3244,-1.9826, 4.6, 5400,FALSE,TRUE),
('Manual','Aquarium San Sebastián',               'Museo',               'Natural',          'Acuario en el Palacio del Mar con colecciones de la Historia Natural del País Vasco',     '13€',   '{"ma-do":"10:00-20:00"}',               '943 440 099','aquarium@aquariumss.com',   'https://aquariumss.com',        'https://example.com/img/aquariumss.jpg',  4,'Plaza Carlos Blasco de Imaz, 1','20003',TRUE,700, TRUE, 43.3237,-1.9829, 4.5, 6800,FALSE,TRUE),
('Manual','Museo Naval de San Sebastián',         'Museo',               'Marítimo',         'Colección sobre la historia naval vasca y las tradiciones marineras del Cantábrico',      '3€',    '{"ma-sa":"10:00-13:30,16:00-19:30","do":"11:00-14:00"}','943 430 051','museonautical@gipuzkoa.eus',NULL,  'https://example.com/img/museonaval.jpg',  4,'Paseo del Muelle, 24',        '20003',TRUE, 300, FALSE,43.3230,-1.9828, 4.3, 2900,FALSE,TRUE),
('Manual','Castillo de la Mota',                  'Patrimonio Cultural',  'Militar',         'Fortaleza medieval del siglo XII en lo alto del Monte Urgull, vistas panorámicas de la bahía','Gratis','{"ma-do":"10:00-20:00"}',        '943 481 166','castillo@donostia.eus',     NULL,                            'https://example.com/img/urgull.jpg',      4,'Monte Urgull, s/n',           '20003',TRUE, 200, FALSE,43.3257,-1.9822, 4.6, 5600,FALSE,TRUE),
('Manual','Palacio de Miramar',                   'Patrimonio Cultural',  'Arquitectura',    'Palacio de veraneo de la familia real española, con jardines sobre la bahía de La Concha', '3€',   '{"ma-do":"10:00-19:00"}',               '943 219 022','miramar@donostia.eus',      'https://www.donostia.eus/miramar','https://example.com/img/miramarss.jpg', 4,'Mirakontxa Pasealekua, 48',   '20007',TRUE, 500, FALSE,43.3136,-2.0038, 4.4, 3200,FALSE,TRUE),
('Manual','Parte Vieja de San Sebastián',         'Patrimonio Cultural',  'Histórico',       'Barrio histórico de bares, pintxos y cultura vasca en el corazón de Donostia',           'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/parteviejass.jpg',4,'Parte Vieja',                 '20003',TRUE,10000,FALSE,43.3232,-1.9840, 4.8,18000,FALSE,TRUE),
('Manual','Monte Igueldo – Parque de Atracciones','Patrimonio Cultural',  'Histórico',       'Monte con vistas a La Concha y parque de atracciones histórico de 1912',                 '4€',    '{"sa-do":"11:00-21:00"}',               '943 210 064','monteigneldo@eus.com',      'https://monteigueldo.es',       'https://example.com/img/igueldo.jpg',     4,'Paseo del Faro, 25',          '20008',TRUE,1000, TRUE, 43.3107,-2.0166, 4.5, 7100,FALSE,TRUE),

-- ── Vitoria-Gasteiz ─────────────────────────────────────────
('Manual','Bibat Museo de Arqueología y Naipes',  'Museo',               'Arqueología',      'Doble museo con arqueología medieval de Álava y colección de naipes española única en el mundo','4€','{"ma-sa":"10:00-14:00,16:00-18:30","do":"10:00-14:00"}','945 203 700','bibat@alava.eus',NULL, 'https://example.com/img/bibat.jpg',       5,'Cuchillería, 54',             '01001',TRUE, 300, TRUE, 43.8470,-2.6720, 4.4, 2100,FALSE,TRUE),
('Manual','Museo de Bellas Artes de Álava',       'Museo',               'Arte',             'Colección de arte alavesa y española del siglo XV al XX en el palacio de Augustín',      '3€',    '{"ma-sa":"10:00-14:00,16:00-18:30"}',   '945 181 918','museobba@alava.eus',        'https://museodebbaa.com',       'https://example.com/img/museobbalavita.jpg',5,'Palacio de los Álava-Esquível, Francia s/n','01002',TRUE,400,TRUE,42.8452,-2.6741,4.3,1800,FALSE,TRUE),
('Manual','Catedral de Santa María de Vitoria',   'Patrimonio Cultural',  'Religioso',       'Catedral gótica del siglo XIV, en plena restauración visible desde dentro — "la catedral viva"','5€','{"ma-do":"11:00-14:00,17:00-19:30"}','945 255 135','catedralvitoria@diocesis.eus',NULL, 'https://example.com/img/catedral_vitoria.jpg',5,'Fray Zacarías Martínez, 3','01001',TRUE,600,FALSE,43.8483,-2.6711,4.6,4300,FALSE,TRUE),
('Manual','Torre de Doña Ochanda',                'Patrimonio Cultural',  'Arquitectura',    'Torre medieval del siglo XIV, testigo de la historia de Vitoria-Gasteiz',                'Gratis','{"ma-vi":"9:00-14:00"}',                '945 161 598','ochanda@vitoriagasteiz.org',NULL,                            'https://example.com/img/ochanda.jpg',     5,'Torre de Doña Ochanda',       '01001',TRUE, 100, FALSE,43.8493,-2.6706, 4.1,  900,FALSE,TRUE),
('Manual','Parque de la Florida',                 'Patrimonio Cultural',  'Parques',         'Jardín histórico del siglo XIX, pulmón verde del centro de Vitoria-Gasteiz',              'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/florida.jpg',     5,'Paseo de la Senda, s/n',      '01005',FALSE,8000,FALSE,43.2477,-2.6752,4.5,5200,FALSE,TRUE),
('Manual','Museo Heráldico de Álava',             'Museo',               'Heráldica',        'Singular colección de escudos y heráldica de los linajes vascos',                        '2€',    '{"ma-vi":"10:00-14:00"}',               '945 161 500','heraldica@alava.eus',       NULL,                            'https://example.com/img/heraldica.jpg',   5,'Cuchillería, 58',             '01001',TRUE, 100, FALSE,43.8470,-2.6715, 3.9,  550,FALSE,TRUE),

-- ── Irún ────────────────────────────────────────────────────
('Manual','Museo Romano Oiasso',                  'Museo',               'Arqueología',      'Museo sobre la ciudad romana de Oiasso, el asentamiento romano más importante del País Vasco','5€','{"ma-sa":"10:00-14:00,16:00-19:00","do":"10:00-14:00"}','943 639 353','oiasso@irun.org','https://oiasso.com', 'https://example.com/img/oiasso.jpg',      6,'Eskoleta, 1',                 '20302',TRUE, 300, TRUE, 43.3389,-1.7882, 4.5, 2300,FALSE,TRUE),
('Manual','Ermita de Santa Elena',                'Patrimonio Cultural',  'Religioso',       'Ermita medieval con yacimiento arqueológico romano en su subsuelo',                      'Gratis','{"visitas":"fin de semana"}',           '943 639 353','oiasso@irun.org',           NULL,                            'https://example.com/img/santaelena.jpg',  6,'San Marcial, s/n',            '20302',TRUE, 100, FALSE,43.3390,-1.7870, 4.0, 1100,FALSE,TRUE),
('Manual','Parque Amute',                         'Patrimonio Cultural',  'Parques',         'Gran parque urbano con áreas deportivas y naturales a orillas del Bidasoa',              'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/amute.jpg',       6,'Parque Amute, s/n',           '20301',FALSE,5000,FALSE,43.3400,-1.7900, 4.2, 1800,FALSE,TRUE),

-- ── Ermua ───────────────────────────────────────────────────
('Manual','Museo de la Industria Armera',         'Museo',               'Industrial',       'Historia de la fabricación de armas en Eibar y el alto Deba, tradición artesanal centenaria','4€','{"ma-vi":"10:00-14:00,16:00-18:00","sa":"10:00-14:00"}','943 703 900','armeria@ermua.eus',NULL, 'https://example.com/img/armeria.jpg',     7,'Zeharkalea, s/n',             '20600',TRUE, 200, TRUE, 43.1890,-2.5005, 4.2, 1200,FALSE,TRUE),
('Manual','Iglesia de San Pedro de Ermua',        'Patrimonio Cultural',  'Religioso',       'Iglesia renacentista del siglo XVI, referente arquitectónico del Alto Deba',              'Gratis','{"ma-do":"10:00-13:00"}',               NULL,         NULL,                        NULL,                            'https://example.com/img/sanpedroermua.jpg',7,'San Pedro Pl., 1',           '20700',TRUE, 200, FALSE,43.1897,-2.5012, 3.9,  600,FALSE,TRUE),
('Manual','Parque Natural de Urkiola',            'Patrimonio Cultural',  'Natural',         'Parque natural entre Bizkaia y Gipuzkoa, ideal para senderismo y avistamiento de aves',  'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/urkiolapark.jpg', 7,'Urkiola, s/n',                '48211',TRUE,50000,FALSE,43.0500,-2.6100, 4.7, 4800,FALSE,TRUE),

-- ── Durango ─────────────────────────────────────────────────
('Manual','Museo de Arte e Historia de Durango',  'Museo',               'Arte',             'Colección local de historia y arte durangués en el palacio Etxezarreta',                 '3€',    '{"ma-sa":"10:00-13:30,16:00-19:00","do":"10:00-13:30"}','946 818 000','museo@durango.eus',NULL, 'https://example.com/img/museodurango.jpg',8,'San Agustinalde Enp., s/n',   '48200',TRUE, 250, FALSE,43.1710,-2.6320, 4.0, 1400,FALSE,TRUE),
('Manual','Arco de Elorza – Casco Histórico',     'Patrimonio Cultural',  'Histórico',       'Acceso monumental al casco histórico de Durango, siglo XVII',                            'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/arcoelorza.jpg',  8,'Arco de Elorza',              '48200',FALSE,2000,FALSE,43.1713,-2.6315, 4.1, 1800,FALSE,TRUE),
('Manual','Santuario de Urkiola',                 'Patrimonio Cultural',  'Religioso',       'Santuario dedicado a los santos Antón y Urbizi en el puerto de montaña de Urkiola',     'Gratis','{"lu-do":"9:00-19:00"}',                '946 817 000','urkiola@santuario.eus',    NULL,                            'https://example.com/img/santuariourkiola.jpg',8,'Puerto de Urkiola, s/n','48210',TRUE,1000,FALSE,43.0790,-2.6310,4.5,3100,FALSE,TRUE),
('Manual','Torre de San Pedro de Tavira',         'Patrimonio Cultural',  'Arquitectura',    'Torre de la iglesia gótica de San Pedro, símbolo de Durango',                            'Gratis','{"visitas":"sa 12:00"}',                '946 818 000','sanpedro@durango.eus',      NULL,                            'https://example.com/img/sanpedrotavira.jpg',8,'San Agustinalde Enp., 4',    '48200',TRUE, 100, FALSE,43.1708,-2.6325, 4.0,  900,FALSE,TRUE),

-- ── Extra museos y patrimonio ────────────────────────────────
('Manual','Torre Madariaga – Centro de la Reserva de la Biosfera','Museo','Natural',         'Centro de interpretación de la Reserva de la Biosfera de Urdaibai en torre medieval',   '4€',    '{"ma-do":"10:00-19:00"}',               '946 258 800','urdaibai@biscay.eus',       'https://urdaibai.biscay.eus',   'https://example.com/img/urdaibai.jpg',    2,'Bo Busturia, s/n',            '48314',TRUE, 150, FALSE,43.3900,-2.8200, 4.5, 1300,FALSE,TRUE),
('Manual','Museo Chillida-Leku',                  'Museo',               'Escultura',        'Esculturas monumentales de Eduardo Chillida en un caserío del siglo XVI con jardines',   '14€',   '{"mi-lu":"10:30-15:00"}',               '943 336 006','info@museochillidaleku.eus','https://museochillidaleku.eus', 'https://example.com/img/chillidaleku.jpg',4,'Jauregi Baserria, Hernani',   '20120',TRUE, 400, TRUE, 43.2540,-1.9770, 4.8, 4200,FALSE,TRUE),
('Manual','Santuario de Arantzazu',               'Patrimonio Cultural',  'Religioso',       'Santuario del siglo XX en lo alto de la montaña, con arte de Oteiza y Chillida',         'Gratis','{"lu-do":"8:00-21:00"}',                '943 781 313','info@arantzazu.eus',        'https://arantzazu.eus',         'https://example.com/img/arantzazu.jpg',   5,'Arantzazu, s/n',              '20567',TRUE,2000,FALSE,43.0460,-2.4080, 4.7, 8100,FALSE,TRUE),
('Manual','Gaztelugatxe',                         'Patrimonio Cultural',  'Natural',         'Islote volcánico con ermita unido a tierra por puente, escenario de Juego de Tronos',    'Gratis','{"lu-do":"10:00-20:00"}',               NULL,         NULL,                        NULL,                            'https://example.com/img/gaztelugatxe.jpg',2,'Bakio, s/n',                  '48130',TRUE,1000,FALSE,43.4403,-2.7916, 4.9,25000,FALSE,TRUE),
('Manual','Vitoria-Gasteiz – Centro de Arte y Naturaleza','Museo','Arte Contemporáneo',      'CGAC, espacio de arte contemporáneo en la antigua Caja de Ahorros Municipal',            '4€',    '{"ma-vi":"11:00-14:00,17:00-20:00","sa":"11:00-14:00"}','945 161 636','artium@artium.org','https://artium.org', 'https://example.com/img/artium.jpg',      5,'Francia, 24',                 '01002',TRUE, 400, TRUE, 43.2467,-2.6741, 4.5, 2900,FALSE,TRUE),
('Manual','Artium – Museo Vasco de Arte Contemporáneo','Museo','Arte Contemporáneo',        'El mayor museo de arte contemporáneo vasco, en el centro de Vitoria-Gasteiz',            '7€',    '{"ma-vi":"11:00-14:00,17:00-20:00","sa-do":"11:00-20:00"}','945 209 020','artium@artium.org','https://artium.org','https://example.com/img/artium2.jpg',     5,'Francia, 24',                 '01002',TRUE, 500, TRUE, 43.2472,-2.6738, 4.6, 3500,FALSE,TRUE),
('Manual','Museo Zumalacárregui',                 'Museo',               'Historia',         'Museo dedicado al general carlista Tomás de Zumalacárregui en Ormaiztegi',               '3€',    '{"ma-sa":"10:00-14:00,16:00-18:00"}',   '943 888 283','zumalac@gipuzkoa.eus',      NULL,                            'https://example.com/img/zumalac.jpg',     4,'Ormaiztegi, s/n',             '20214',TRUE, 150, FALSE,43.0290,-2.3060, 4.0,  700,FALSE,TRUE),
('Manual','Museo de la Industria Petroquímica',   'Museo',               'Industrial',       'Historia de la industria petroquímica en el Valle del Nervión y su impacto en Bizkaia',  '4€',    '{"ma-vi":"10:00-14:00,16:00-18:00"}',   '944 188 500','petroquimica@barakaldo.eus',NULL,                            'https://example.com/img/petroquimica.jpg',3,'Pol. Ind. Ansio, s/n',        '48902',TRUE, 300, FALSE,43.3010,-2.9950, 3.8,  600,FALSE,TRUE),
('Manual','Ermita de San Millán de Añes',         'Patrimonio Cultural',  'Religioso',       'Pequeña ermita románica del siglo XII en el valle alavés, tranquilidad absoluta',        'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/sanmillan.jpg',   5,'Añes, s/n',                  '01192',FALSE, 50, FALSE,43.9280,-2.7510, 4.2,  400,FALSE,TRUE),
('Manual','Playa de La Concha',                   'Patrimonio Cultural',  'Natural',         'La playa urbana más bonita de Europa según múltiples rankings internacionales',           'Gratis','{}',                                 NULL,         NULL,                        NULL,                            'https://example.com/img/laconcha.jpg',    4,'Paseo de La Concha, s/n',    '20007',FALSE,30000,FALSE,43.3180,-2.0040, 4.9,45000,FALSE,TRUE),
('Manual','Reserva de la Biosfera de Urdaibai',   'Patrimonio Cultural',  'Natural',         'Reserva de la Biosfera declarada por la UNESCO, humedales y bosques atlánticos de Bizkaia','Gratis','{}',                              NULL,         NULL,                        NULL,                            'https://example.com/img/urdaibaipark.jpg',2,'Urdaibai, s/n',               '48300',TRUE,50000,FALSE,43.3800,-2.7800, 4.8,12000,FALSE,TRUE),
('Manual','Museo Balenciaga',                     'Museo',               'Moda',             'Museo dedicado al diseñador Cristóbal Balenciaga, hijo de Getaria, en su palacio natal',  '12€',  '{"ma-do":"10:00-19:00"}',               '943 008 840','info@cristobalbalenciagamuseoa.com','https://cristobalbalenciagamuseoa.com','https://example.com/img/balenciaga.jpg',4,'Aldamar Parkea, 6',          '20808',TRUE, 300, TRUE, 43.3042,-2.1955, 4.7, 3800,FALSE,TRUE)
ON CONFLICT DO NOTHING;

-- =============================================================
-- EVENTOS (100 registros)
-- Cubre: esta-semana, fin-de-semana, en-euskera (language='EU'),
--        cerca-de-ti (8 municipios), todos los tipos
-- =============================================================

INSERT INTO market_data.events
  (municipality_id, type, subtipo, start_date, end_date, language,
   is_free, price_eur, establishment, place, company, active)
VALUES

-- ── ESTA SEMANA — lunes a viernes (NOW()..fin de semana) ────
(1,'Concierto',   'Pop Rock',       NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day 3 hours',  'ES', FALSE,25.0, 'Bilborock',              'Sala Bilborock, Bilbao',             'Promotores Bilbao SL',   TRUE),
(1,'Teatro',      'Drama',          NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day 2 hours',  'ES', FALSE,18.0, 'Teatro Arriaga',         'Teatro Arriaga, Bilbao',             'Compañía Nacional Teatro',TRUE),
(1,'Exposición',  'Arte Contemporáneo',NOW() + INTERVAL '1 day',NOW() + INTERVAL '14 days',       'ES', TRUE, 0.0, 'Guggenheim Bilbao',     'Museo Guggenheim, Bilbao',           'Guggenheim Foundation',  TRUE),
(1,'Conferencia', 'Tecnología',     NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 4 hours', 'ES', FALSE,35.0, 'BEC Barakaldo',          'Bilbao Exhibition Centre',           'Tech Bilbao SL',         TRUE),
(4,'Concierto',   'Jazz',           NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day 2 hours',  'ES', FALSE,20.0, 'Club Jazz Donostia',     'Victoria Eugenia Teatro, DSS',       'Jazz Donostia',          TRUE),
(4,'Danza',       'Contemporánea',  NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'ES', FALSE,15.0, 'Kursaal Donostia',       'Auditorio Kursaal, San Sebastián',   'Danza Vasca SL',         TRUE),
(5,'Conferencia', 'Medio Ambiente', NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day 3 hours',  'ES', TRUE, 0.0, 'Ayuntamiento Vitoria',   'Palacio de Congresos, Vitoria',      'Agenda Verde Vitoria',   TRUE),
(5,'Cine',        'Documental',     NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'EU', TRUE, 0.0, 'Cine Palafox Gasteiz',   'Sala Palafox, Vitoria-Gasteiz',      'Zinema Gasteiz',         TRUE),
(2,'Exposición',  'Fotografía',     NOW() + INTERVAL '1 day',  NOW() + INTERVAL '21 days',        'ES', TRUE, 0.0, 'Sala Azkuna Getxo',      'Centro Cultural Getxo',              'Getxo Foto',             TRUE),
(6,'Feria',       'Artesanía',      NOW() + INTERVAL '1 day',  NOW() + INTERVAL '3 days',         'EU', TRUE, 0.0, 'Casco Histórico Irún',   'Plaza San Juan, Irún',               'Irún Merkatua',          TRUE),
(3,'Concierto',   'Clásica',        NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'ES', FALSE,12.0, 'Casa de Cultura Barakaldo','Auditorio Barakaldo',               'Orquesta Bilbao BBK',    TRUE),
(7,'Teatro',      'Infantil',       NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 1 hour',  'ES', FALSE,8.0,  'Centro Cívico Ermua',    'Teatro Municipal Ermua',             'Títeres Vascos',         TRUE),
(8,'Exposición',  'Pintura',        NOW() + INTERVAL '1 day',  NOW() + INTERVAL '30 days',        'ES', TRUE, 0.0, 'Museo Durango',          'Museo Arte e Historia, Durango',     'Arte Durango',           TRUE),

-- ── ESTA SEMANA — en euskera ─────────────────────────────────
(1,'Bertsolarismo','Txapelketa',    NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 'EU', FALSE,10.0,'Antzokia Bilbao',        'Bilbao Antzokia',                    'Bertsozale Elkartea',    TRUE),
(4,'Danza',       'Folklore Vasco', NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day 2 hours',  'EU', TRUE, 0.0, 'Gaztelupe Donostia',     'Gaztelupe, San Sebastián',           'Euskal Dantzariak',      TRUE),
(5,'Teatro',      'Bertsolaritza',  NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'EU', FALSE,8.0, 'Gazteszena Vitoria',     'Sala Gazteszena, Vitoria',           'Euskal Antzerkia',       TRUE),
(8,'Concierto',   'Folk Vasco',     NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'EU', FALSE,12.0,'Herriko Plaza Durango',  'Plaza Mayor, Durango',               'Euskal Musika Taldea',   TRUE),

-- ── FIN DE SEMANA — sábado y domingo ─────────────────────────
-- Próximo sábado
(1,'Festival',    'Música Electrónica',DATE_TRUNC('week',NOW())+INTERVAL '5 days 20 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 4 hours','ES',FALSE,45.0,'BBK Live Venue','Kobetamendi, Bilbao','BBK Live SL',TRUE),
(1,'Concierto',   'Rock',           DATE_TRUNC('week',NOW())+INTERVAL '5 days 21 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 1 hour', 'ES', FALSE,30.0,'Sala Santana 27',        'Bilbao',                             'Kontzertua SL',          TRUE),
(1,'Mercado',     'Artesanía',      DATE_TRUNC('week',NOW())+INTERVAL '5 days 10 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 20 hours','ES',TRUE,0.0,'Plaza Nueva Bilbao',     'Plaza Nueva, Bilbao',                'Mercado Artesanos',      TRUE),
(4,'Festival',    'Cine',           DATE_TRUNC('week',NOW())+INTERVAL '5 days 18 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 23 hours','ES',FALSE,12.0,'Zinemaldia Donostia',   'Kursaal, San Sebastián',             'Zinemaldia Organisation',TRUE),
(4,'Danza',       'Ballet',         DATE_TRUNC('week',NOW())+INTERVAL '5 days 20 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 22 hours','ES',FALSE,22.0,'Victoria Eugenia Teatro','Victoria Eugenia, San Sebastián',    'Ballet Vasco',           TRUE),
(5,'Feria',       'Gastronomía',    DATE_TRUNC('week',NOW())+INTERVAL '5 days 11 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 21 hours','ES',TRUE,0.0,'Mercado Medieval Vitoria','Plaza Virgen Blanca, Vitoria',        'Vitoria Gastronomika',   TRUE),
(5,'Concierto',   'Pop',            DATE_TRUNC('week',NOW())+INTERVAL '5 days 22 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 1 hour', 'EU', FALSE,20.0,'Sala Dallas Vitoria',   'Sala Dallas, Vitoria',               'Pop Gasteiz',            TRUE),
(2,'Concierto',   'Blues',          DATE_TRUNC('week',NOW())+INTERVAL '5 days 20 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 22 hours','ES',FALSE,15.0,'Getxo Antzokia',        'Auditorio Getxo',                    'Getxo Blues',            TRUE),
(2,'Deportes',    'Regatas',        DATE_TRUNC('week',NOW())+INTERVAL '5 days 10 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 14 hours','EU',TRUE,0.0,'Puerto Getxo',           'Club Náutico Getxo',                 'Federación Remo Euskadi',TRUE),
(6,'Festival',    'Folk',           DATE_TRUNC('week',NOW())+INTERVAL '5 days 18 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 22 hours','EU',FALSE,8.0,'Parque Amute Irún',      'Parque Amute, Irún',                 'Irún Festibala',         TRUE),
(3,'Concierto',   'Metal',          DATE_TRUNC('week',NOW())+INTERVAL '5 days 21 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 1 hour', 'ES', FALSE,18.0,'La Noche Barakaldo',    'Sala La Noche, Barakaldo',           'Heavy Bizkaia',          TRUE),
(7,'Feria',       'Gastronómica',   DATE_TRUNC('week',NOW())+INTERVAL '5 days 11 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 21 hours','ES',TRUE,0.0,'Plaza Ermua',            'Plaza Udal, Ermua',                  'Txoko Ermua',            TRUE),
(8,'Teatro',      'Comedia',        DATE_TRUNC('week',NOW())+INTERVAL '5 days 20 hours',DATE_TRUNC('week',NOW())+INTERVAL '5 days 22 hours','ES',FALSE,12.0,'Teatro Durango',        'Teatro Lehendakari Agirre, Durango', 'Komedia Taldea',         TRUE),
-- Próximo domingo
(1,'Concierto',   'Clásica',        DATE_TRUNC('week',NOW())+INTERVAL '6 days 12 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 14 hours','ES',FALSE,15.0,'Palacio Euskalduna',    'Euskalduna Bilbao',                  'Orquesta Sinfónica Bilbao',TRUE),
(1,'Maratón',     'Running',        DATE_TRUNC('week',NOW())+INTERVAL '6 days 9 hours', DATE_TRUNC('week',NOW())+INTERVAL '6 days 13 hours','ES',FALSE,30.0,'Ayuntamiento Bilbao',   'Salida Arenal, Bilbao',              'Bilbao Night Marathon',  TRUE),
(1,'Mercado',     'Antigüedades',   DATE_TRUNC('week',NOW())+INTERVAL '6 days 9 hours', DATE_TRUNC('week',NOW())+INTERVAL '6 days 15 hours','ES',TRUE,0.0,'Mercado del Ensanche',   'Plaza Moyua, Bilbao',                'Anticuarios Bilbao',     TRUE),
(4,'Concierto',   'Jazz',           DATE_TRUNC('week',NOW())+INTERVAL '6 days 12 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 14 hours','EU',FALSE,18.0,'Jazz Donostia',         'Palacio Miramar, DSS',               'Donostia Jazz Festival', TRUE),
(4,'Surf',        'Competición',    DATE_TRUNC('week',NOW())+INTERVAL '6 days 9 hours', DATE_TRUNC('week',NOW())+INTERVAL '6 days 17 hours','ES',TRUE,0.0,'Playa Zurriola',         'Playa Zurriola, San Sebastián',      'Euskadi Surf Elkartea',  TRUE),
(5,'Feria',       'Libro',          DATE_TRUNC('week',NOW())+INTERVAL '6 days 10 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 20 hours','ES',TRUE,0.0,'Parque Florida Vitoria', 'Parque de la Florida, Vitoria',      'Libros Gasteiz',         TRUE),
(2,'Deporte',     'Ciclismo',       DATE_TRUNC('week',NOW())+INTERVAL '6 days 9 hours', DATE_TRUNC('week',NOW())+INTERVAL '6 days 13 hours','ES',TRUE,0.0,'Puerto Getxo',           'Circuito Gran Premio Bizkaia',       'Federación Ciclismo EUS',TRUE),
(6,'Bertsolarismo','Jaialdia',      DATE_TRUNC('week',NOW())+INTERVAL '6 days 17 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 20 hours','EU',FALSE,6.0,'Herriko Plaza Irún',    'Plaza San Juan, Irún',               'Bertsozale Elkartea',    TRUE),
(3,'Feria',       'Agroalimentaria',DATE_TRUNC('week',NOW())+INTERVAL '6 days 10 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 18 hours','ES',TRUE,0.0,'Parque Lasesarre',       'Parque Lasesarre, Barakaldo',        'Barakaldo Bio Merkatua', TRUE),
(7,'Concierto',   'Pop Vasco',      DATE_TRUNC('week',NOW())+INTERVAL '6 days 19 hours',DATE_TRUNC('week',NOW())+INTERVAL '6 days 21 hours','EU',FALSE,10.0,'Herriko Plaza Ermua',  'Plaza Udal, Ermua',                  'Euskal Pop Taldea',      TRUE),
(8,'Feria',       'Medieval',       DATE_TRUNC('week',NOW())+INTERVAL '6 days 10 hours',DATE_TRUNC('week',NOW())+INTERVAL '7 days',        'ES', FALSE,5.0, 'Casco Histórico Durango','Plaza San Agustín, Durango',         'Merkatariak Durango',    TRUE),

-- ── EN EUSKERA — varios días (mezcla esta semana y próximas) ─
(1,'Bertsolarismo','Finala',        NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 4 hours', 'EU', FALSE,15.0,'Euskalduna Bilbao',      'Palacio Euskalduna, Bilbao',         'Bertsozale Elkartea',    TRUE),
(1,'Teatro',      'Antzerkia',      NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 2 hours', 'EU', FALSE,10.0,'Antzokia Bilbao',        'Bilbao Antzokia',                    'Euskal Antzerkia',       TRUE),
(4,'Musika',      'Euskal Musika',  NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'EU', TRUE, 0.0, 'Plaza Constitución DSS', 'Plaza Constitución, San Sebastián',  'Donostiako Musika',      TRUE),
(4,'Zinema',      'Euskarazko Film',NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days 2 hours', 'EU', FALSE,8.0, 'Tabakalera Donostia',    'Tabakalera, San Sebastián',           'Zinema Euskaraz',        TRUE),
(5,'Konferentzia','Euskara Eguna',  NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 'EU', TRUE, 0.0, 'Ayuntamiento Vitoria',   'Palacio Congresos, Vitoria-Gasteiz', 'Euskaltzaindia',         TRUE),
(5,'Dantza',      'Folklore',       NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 2 hours', 'EU', TRUE, 0.0, 'Herriko Plaza Vitoria',  'Plaza Virgen Blanca, Vitoria',       'Vitoriako Dantzariak',   TRUE),
(8,'Bertso Afaria','Gau Afaria',    NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 4 hours', 'EU', FALSE,25.0,'Herriko Taberna Durango','Taberna Herriko, Durango',            'Durangoko Bertsolariak', TRUE),
(6,'Antzerkia',   'Komedia',        NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 2 hours', 'EU', FALSE,8.0, 'Irun Teatro',            'Teatro Amaia, Irún',                  'Irungo Antzerkia',       TRUE),
(2,'Musika',      'Kantu Saioa',    NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'EU', TRUE, 0.0, 'Centro Cultural Getxo',  'Areeta Kultur Etxea, Getxo',          'Getxoko Musikariak',     TRUE),
(3,'Hitzaldia',   'Zientzia',       NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day 2 hours',  'EU', TRUE, 0.0, 'Biblioteca Barakaldo',   'Udal Liburutegia, Barakaldo',         'Zientzia Elkartea',      TRUE),
(7,'Kirola',      'Txirrindularitza',NOW()+ INTERVAL '6 days', NOW() + INTERVAL '6 days 4 hours', 'EU', TRUE, 0.0, 'Herriko Plaza Ermua',    'Plaza Udal, Ermua',                   'Debagoiena Kirola',      TRUE),

-- ── PRÓXIMAS SEMANAS — eventos variados todo el año ──────────
(1,'Festival',    'BBK Live',       NOW() + INTERVAL '10 days',NOW() + INTERVAL '13 days',        'ES', FALSE,80.0,'Kobetamendi',            'Monte Kobetamendi, Bilbao',           'Promoters International',TRUE),
(1,'Concierto',   'Pop Internacional',NOW()+INTERVAL '8 days', NOW() + INTERVAL '8 days 2 hours', 'ES', FALSE,50.0,'San Mamés',              'Estadio San Mamés, Bilbao',           'Live Nation Spain',      TRUE),
(1,'Feria',       'Libro',          NOW() + INTERVAL '7 days', NOW() + INTERVAL '10 days',        'ES', TRUE, 0.0, 'Parque Doña Casilda',    'Parque Doña Casilda, Bilbao',         'Feria del Libro Bilbao', TRUE),
(1,'Exposición',  'Historia',       NOW() + INTERVAL '7 days', NOW() + INTERVAL '60 days',        'ES', FALSE,8.0, 'Museo Vasco',            'Euskal Museoa, Bilbao',               'Museo Vasco',            TRUE),
(1,'Conferencia', 'Startup',        NOW() + INTERVAL '9 days', NOW() + INTERVAL '9 days 8 hours', 'ES', FALSE,40.0,'BEC',                    'BEC Barakaldo',                       'Basque Startup',         TRUE),
(4,'Festival',    'Jazz',           NOW() + INTERVAL '15 days',NOW() + INTERVAL '18 days',        'ES', FALSE,25.0,'Jazzaldia Donostia',     'Plaza de la Trinidad, DSS',           'Donostia Kultura',       TRUE),
(4,'Concierto',   'Clásica',        NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days 2 hours', 'ES', FALSE,20.0,'Auditorio Kursaal',      'Auditorio Kursaal, San Sebastián',    'Musika Klasikoa',        TRUE),
(4,'Deportes',    'Triatlón',       NOW() + INTERVAL '12 days',NOW() + INTERVAL '12 days 6 hours','ES', FALSE,60.0,'Playa La Concha',        'Playa La Concha, San Sebastián',      'Ironman Donostia',       TRUE),
(4,'Festival',    'Gastronomía',    NOW() + INTERVAL '20 days',NOW() + INTERVAL '22 days',        'ES', FALSE,30.0,'Basque Culinary Center', 'Basque Culinary Center, DSS',         'BCC Gastronomika',       TRUE),
(5,'Concierto',   'Rock Clásico',   NOW() + INTERVAL '10 days',NOW() + INTERVAL '10 days 2 hours','ES', FALSE,35.0,'Sala Principal Vitoria', 'Sala Principal, Vitoria',             'Rock Gasteiz',           TRUE),
(5,'Feria',       'Día del Comercio',NOW()+INTERVAL '8 days',  NOW() + INTERVAL '9 days',         'ES', TRUE, 0.0, 'Casco Medieval Vitoria', 'Casco Medieval, Vitoria',             'Vitoria Comercio',       TRUE),
(5,'Conferencia', 'Smart City',     NOW() + INTERVAL '14 days',NOW() + INTERVAL '14 days 6 hours','ES', FALSE,45.0,'Palacio Congresos',      'Palacio Congresos, Vitoria',          'Smart Vitoria',          TRUE),
(5,'Festival',    'Verde',          NOW() + INTERVAL '25 days',NOW() + INTERVAL '27 days',        'EU', TRUE, 0.0, 'Parque Florida Vitoria', 'Parque Florida, Vitoria',             'Natura Gasteiz',         TRUE),
(2,'Deportes',    'Golf',           NOW() + INTERVAL '9 days', NOW() + INTERVAL '9 days 6 hours', 'ES', FALSE,25.0,'Golf La Galea Getxo',    'Club Golf La Galea, Getxo',           'Golf Bizkaia',           TRUE),
(2,'Concierto',   'Pop Nacional',   NOW() + INTERVAL '11 days',NOW() + INTERVAL '11 days 2 hours','ES', FALSE,22.0,'Kafe Antzokia Getxo',   'Centro Cultural, Getxo',              'Getxo Pop Concerts',     TRUE),
(6,'Feria',       'Mercado Medieval',NOW()+INTERVAL '8 days',  NOW() + INTERVAL '10 days',        'ES', TRUE, 0.0, 'Casco Histórico Irún',   'Casco Histórico, Irún',               'Irun Medieval',          TRUE),
(6,'Concierto',   'Pop-Rock',       NOW() + INTERVAL '14 days',NOW() + INTERVAL '14 days 2 hours','EU',FALSE,15.0,'Amaia Antzokia Irún',    'Teatro Amaia, Irún',                  'Irungo Musika',          TRUE),
(3,'Festival',    'Electrónica',    NOW() + INTERVAL '9 days', NOW() + INTERVAL '10 days',        'ES', FALSE,35.0,'Puerto Deportivo Getxo', 'Puerto Getxo, Barakaldo Area',        'Electronic Bizkaia',     TRUE),
(3,'Feria',       'Empleo',         NOW() + INTERVAL '7 days', NOW() + INTERVAL '8 days',         'ES', TRUE, 0.0, 'BEC Barakaldo',          'BEC Barakaldo',                       'Lanbide Barakaldo',      TRUE),
(7,'Deportes',    'Pelota Vasca',   NOW() + INTERVAL '8 days', NOW() + INTERVAL '8 days 3 hours', 'EU', FALSE,8.0, 'Frontón Ermua',          'Frontón Municipal, Ermua',            'Pelota Euskadi',         TRUE),
(8,'Feria',       'Durangoko Azoka',NOW() + INTERVAL '20 days',NOW() + INTERVAL '25 days',        'EU', FALSE,5.0, 'Landako Gunea',          'Landako Gunea, Durango',              'Durangoko Azoka',        TRUE),
(8,'Concierto',   'Metal',          NOW() + INTERVAL '10 days',NOW() + INTERVAL '10 days 3 hours','ES', FALSE,15.0,'La Noche Durango',       'Sala La Noche, Durango',              'Heavy Durango',          TRUE),

-- ── GRATUITOS — acceso libre ─────────────────────────────────
(1,'Concierto',   'Al Aire Libre',  NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'ES', TRUE, 0.0, 'Bilbao Musika',          'Plaza del Arenal, Bilbao',            'Ayuntamiento Bilbao',    TRUE),
(1,'Feria',       'Gastronomía',    NOW() + INTERVAL '6 days', NOW() + INTERVAL '8 days',         'ES', TRUE, 0.0, 'Mercado de La Ribera',   'Mercado La Ribera, Bilbao',           'Bilbao Gastronomika',    TRUE),
(4,'Concierto',   'Gratuito',       NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 2 hours', 'EU', TRUE, 0.0, 'Donostiako Udala',       'Boulevard Paseo, San Sebastián',      'Donostiako Udala',       TRUE),
(5,'Feria',       'Día de la Bici', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 6 hours', 'ES', TRUE, 0.0, 'Ayuntamiento Vitoria',   'Circuito Vitoria',                    'Vitoria Ciclociudad',    TRUE),
(5,'Concierto',   'Bandas Jóvenes', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 4 hours', 'EU', TRUE, 0.0, 'Gazteszena Vitoria',     'Sala Gazteszena, Vitoria',            'Gazte Musikariak',       TRUE),
(2,'Feria',       'Solidaria',      NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 8 hours', 'ES', TRUE, 0.0, 'Centro Cívico Getxo',    'Centro Cívico Romo, Getxo',           'ONGs Bizkaia',           TRUE),
(6,'Exposición',  'Fotografía',     NOW() + INTERVAL '2 days', NOW() + INTERVAL '30 days',        'EU', TRUE, 0.0, 'Museo Oiasso',           'Museo Romano Oiasso, Irún',           'Irun Argazki',           TRUE),
(3,'Concierto',   'Bandas Locales', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours', 'ES', TRUE, 0.0, 'Plaza Bide Onera',       'Plaza Bide Onera, Barakaldo',         'Barakaldo Musika',       TRUE),
(7,'Deporte',     'Carrera Popular',NOW() + INTERVAL '6 days', NOW() + INTERVAL '6 days 2 hours', 'ES', TRUE, 0.0, 'Ayuntamiento Ermua',     'Circuito Ermua',                      'Atletismo Ermua',        TRUE),
(8,'Exposición',  'Arte Local',     NOW() + INTERVAL '3 days', NOW() + INTERVAL '21 days',        'EU', TRUE, 0.0, 'Casa de Cultura Durango','Durango Kultura Etxea',               'Arte Durango',           TRUE),

-- ── EVENTOS PASADOS (para histórico) ─────────────────────────
(1,'Concierto',   'Pop Rock',       NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days 21 hours','ES',FALSE,25.0,'Bilborock',              'Sala Bilborock, Bilbao',              'Promotores Bilbao SL',   TRUE),
(1,'Festival',    'Folklore',       NOW() - INTERVAL '14 days',NOW() - INTERVAL '11 days',        'EU', TRUE, 0.0, 'Aste Nagusia Bilbao',    'Plaza del Arenal, Bilbao',            'Semana Grande Bilbao',   TRUE),
(4,'Festival',    'Cine',           NOW() - INTERVAL '10 days',NOW() - INTERVAL '3 days',         'ES', FALSE,50.0,'Zinemaldia',             'Kursaal, San Sebastián',              'Festival Cine DSS',      TRUE),
(5,'Feria',       'Agroalimentaria',NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days',         'EU', TRUE, 0.0, 'Parque Florida',         'Parque Florida, Vitoria',             'Vitoria Nekazaritza',    TRUE),

-- ── EVENTOS ONLINE ────────────────────────────────────────────
(1,'Conferencia', 'Online',         NOW() + INTERVAL '1 day',  NOW() + INTERVAL '1 day 2 hours',  'ES', TRUE, 0.0, 'Basque Innovation Agency','Online / Zoom',                      'Innobasque',             TRUE),
(4,'Formación',   'Online Euskera', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 3 hours', 'EU', TRUE, 0.0, 'HABE',                   'Online / Teams',                      'HABE Euskara',           TRUE),
(5,'Webinar',     'Sostenibilidad', NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', 'ES', TRUE, 0.0, 'Agencia Ambiental',      'Online / Google Meet',                'Ihobe Basque',           TRUE),

-- ── PATROCINADOS ─────────────────────────────────────────────
(1,'Festival',    'Patrocinado',    NOW() + INTERVAL '5 days', NOW() + INTERVAL '7 days',         'ES', FALSE,60.0,'Euskalduna Bilbao',      'Palacio Euskalduna, Bilbao',          'BBK Foundation',         TRUE),
(4,'Exposición',  'Temporal VIP',   NOW() + INTERVAL '1 day',  NOW() + INTERVAL '45 days',        'ES', FALSE,20.0,'Tabakalera DSS',         'Tabakalera, San Sebastián',           'Diputación Gipuzkoa',    TRUE)
ON CONFLICT DO NOTHING;
