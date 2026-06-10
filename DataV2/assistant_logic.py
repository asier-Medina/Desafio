# assistant_logic.py
from pydantic import BaseModel
from typing import Optional, List
from models import db, Gastronomia, Cultura, Evento, UserInteres, Municipio

# ── Palabras clave de intención ───────────────────────────────────────────────

GASTRO_WORDS = [
    # Establecimientos
    'gastronomia', 'gastronomía', 'restaurante', 'sidreria', 'sidra',
    'asador', 'txoko', 'bodega', 'taberna', 'bar', 'cafeteria', 'cafetería',
    'hamburgueseria', 'hamburguesería', 'marisqueria', 'marisquería',
    'pasteleria', 'pastelería', 'panaderia', 'panadería', 'heladeria', 'heladería',
    # Platos / productos
    'pintxos', 'pintxo', 'pinchos', 'comida', 'cocina', 'michelin',
    'menu', 'menú', 'tapas', 'vermut', 'vermu', 'aperitivo',
    'poteo', 'txikiteo', 'pintxo pote', 'brunch',
    # Momentos del día
    'comer', 'cenar', 'cena', 'almorzar', 'almuerzo',
    'desayunar', 'desayuno', 'merendar', 'merienda',
    'tomar algo', 'tomar una caña', 'unas cañas', 'ir de vinos',
    # Formas de preguntar
    'que comer', 'qué comer', 'donde comer', 'dónde comer',
    'donde como', 'dónde como', 'que como', 'qué como',
    'para comer', 'a comer', 'quiero comer', 'para cenar', 'a cenar',
    'donde cenar', 'dónde cenar', 'sitio para comer', 'lugar para comer',
    'zona de restaurantes', 'zona de bares', 'zona de pintxos',
    # Preferencias
    'vegetariano', 'vegano', 'sin gluten', 'con terraza', 'con vistas',
    'economico', 'económico', 'barato', 'gourmet', 'con niños', 'familiar',
]
CULTURA_WORDS = [
    # Tipos de lugar
    'cultura', 'museo', 'patrimonio', 'arte', 'historia', 'monumento',
    'iglesia', 'castillo', 'ermita', 'palacio', 'basilica', 'basílica',
    'catedral', 'torre', 'ruinas', 'yacimiento',
    'exposicion', 'exposición', 'galeria', 'galería',
    'parque', 'jardines', 'jardin', 'jardín', 'mirador', 'playa',
    'casco historico', 'casco histórico', 'centro historico', 'centro histórico',
    # Actividades
    'visita', 'visitar', 'turismo', 'turistico', 'turístico',
    'arqueologico', 'arqueológico', 'arquitectura', 'patrimonio',
    'paseo', 'ruta', 'excursion', 'excursión', 'senderismo',
    # Formas de preguntar
    'que ver', 'qué ver', 'que visitar', 'qué visitar',
    'lugares', 'sitios', 'sitios bonitos', 'lugares con encanto',
    'donde ir', 'dónde ir', 'que hay que ver', 'qué hay que ver',
    'imprescindible', 'imprescindibles', 'no me puedo perder',
]
EVENTO_WORDS = [
    # Tipos de evento
    'evento', 'concierto', 'festival', 'feria', 'fiesta', 'teatro',
    'espectaculo', 'espectáculo', 'mercado', 'mercadillo',
    'musica', 'música', 'danza', 'baile', 'cine', 'circo',
    'deporte', 'deportivo', 'partido', 'carrera',
    'infantil', 'para niños', 'gratis', 'gratuito', 'entrada libre',
    # Tiempo
    'agenda', 'actividad', 'actividades',
    'hoy', 'esta noche', 'esta tarde', 'mañana',
    'fin de semana', 'finde', 'esta semana', 'este mes',
    'euskera', 'en euskera',
    # Formas de preguntar
    'que hay', 'qué hay', 'que pasa', 'qué pasa',
    'que hay hoy', 'qué hay hoy', 'que se puede hacer', 'qué se puede hacer',
    'que ver', 'qué ver', 'planes para', 'que hacer esta',
]
# Palabras que activan los TRES tipos a la vez (búsqueda general)
GENERAL_WORDS = [
    'que hago', 'qué hago', 'que hacer', 'qué hacer',
    'plan', 'planes', 'ocio', 'salir', 'escapada',
    'recomendacion', 'recomendación', 'recomendame', 'recomiéndame',
    'propuesta', 'sugerencia', 'idea', 'ideas',
    'aburrido', 'me aburro', 'no se que hacer', 'no sé qué hacer',
    'que me recomiendas', 'qué me recomiendas',
    'por donde empiezo', 'por dónde empiezo',
    'turista', 'primera vez', 'visita rapida', 'visita rápida',
]

# ── Landmarks → (provincia, término de búsqueda de municipio) ────────────────

LANDMARKS = {
    # Bilbao
    'moyua':              ('Bizkaia', 'Bilbao'),
    'guggenheim':         ('Bizkaia', 'Bilbao'),
    'san mamés':          ('Bizkaia', 'Bilbao'),
    'san mames':          ('Bizkaia', 'Bilbao'),
    'plaza nueva':        ('Bizkaia', 'Bilbao'),
    'mercado de la ribera': ('Bizkaia', 'Bilbao'),
    'indautxu':           ('Bizkaia', 'Bilbao'),
    'casco viejo':        ('Bizkaia', 'Bilbao'),
    'alde zaharra':       ('Bizkaia', 'Bilbao'),
    # Donostia
    'la concha':          ('Gipuzkoa', 'Donostia'),
    'playa de la concha': ('Gipuzkoa', 'Donostia'),
    'parte vieja':        ('Gipuzkoa', 'Donostia'),
    'zurriola':           ('Gipuzkoa', 'Donostia'),
    'kursaal':            ('Gipuzkoa', 'Donostia'),
    'ondarreta':          ('Gipuzkoa', 'Donostia'),
    'monte igueldo':      ('Gipuzkoa', 'Donostia'),
    'boulevard':          ('Gipuzkoa', 'Donostia'),
    # Vitoria-Gasteiz
    'plaza de la blanca': ('Araba', 'Vitoria'),
    'la blanca':          ('Araba', 'Vitoria'),
    'artium':             ('Araba', 'Vitoria'),
    'parque de la florida': ('Araba', 'Vitoria'),
    'catedral de vitoria': ('Araba', 'Vitoria'),
    'calle dato':         ('Araba', 'Vitoria'),
    'casco medieval':     ('Araba', 'Vitoria'),
}

# ── Ciudades principales → (provincia, término de búsqueda de municipio) ─────

CITIES = {
    # ── Capitales de provincia ────────────────────────────────────────────────
    # Bilbao (capital de Bizkaia)
    'bilbao':              ('Bizkaia',  'Bilbao'),
    'bilbo':               ('Bizkaia',  'Bilbao'),   # nombre en euskera
    'la villa':            ('Bizkaia',  'Bilbao'),   # apodo histórico
    'gran bilbao':         ('Bizkaia',  'Bilbao'),
    # Donostia-San Sebastián (capital de Gipuzkoa)
    'donostia':            ('Gipuzkoa', 'Donostia'),
    'donosti':             ('Gipuzkoa', 'Donostia'),
    'san sebastian':       ('Gipuzkoa', 'Donostia'),
    'san sebastián':       ('Gipuzkoa', 'Donostia'),
    'sanse':               ('Gipuzkoa', 'Donostia'),  # apodo coloquial
    'la bella easo':       ('Gipuzkoa', 'Donostia'),  # apodo poético
    # Vitoria-Gasteiz (capital de Araba y del País Vasco)
    'vitoria':             ('Araba',    'Vitoria'),
    'gasteiz':             ('Araba',    'Vitoria'),
    'vitoria gasteiz':     ('Araba',    'Vitoria'),
    'vitoria-gasteiz':     ('Araba',    'Vitoria'),
    # ── Provincias ───────────────────────────────────────────────────────────
    'bizkaia':             ('Bizkaia',  None),
    'vizcaya':             ('Bizkaia',  None),
    'gipuzkoa':            ('Gipuzkoa', None),
    'guipuzcoa':           ('Gipuzkoa', None),
    'guipúzcoa':           ('Gipuzkoa', None),
    'araba':               ('Araba',    None),
    'álava':               ('Araba',    None),
    'alava':               ('Araba',    None),
    # ── Municipios importantes de Bizkaia ────────────────────────────────────
    'getxo':               ('Bizkaia',  'Getxo'),
    'las arenas':          ('Bizkaia',  'Getxo'),     # barrio de Getxo
    'barakaldo':           ('Bizkaia',  'Barakaldo'),
    'basauri':             ('Bizkaia',  'Basauri'),
    'santurtzi':           ('Bizkaia',  'Santurtzi'),
    'santurce':            ('Bizkaia',  'Santurtzi'),
    'portugalete':         ('Bizkaia',  'Portugalete'),
    'durango':             ('Bizkaia',  'Durango'),
    'gernika':             ('Bizkaia',  'Gernika-Lumo'),
    'guernica':            ('Bizkaia',  'Gernika-Lumo'),
    'bermeo':              ('Bizkaia',  'Bermeo'),
    'mungia':              ('Bizkaia',  'Mungia'),
    'lekeitio':            ('Bizkaia',  'Lekeitio'),
    'ondarroa':            ('Bizkaia',  'Ondarroa'),
    'markina':             ('Bizkaia',  'Markina-Xemein'),
    # ── Municipios importantes de Gipuzkoa ───────────────────────────────────
    'irun':                ('Gipuzkoa', 'Irun'),
    'irún':                ('Gipuzkoa', 'Irun'),
    'errenteria':          ('Gipuzkoa', 'Errenteria'),
    'renteria':            ('Gipuzkoa', 'Errenteria'),
    'hernani':             ('Gipuzkoa', 'Hernani'),
    'zarautz':             ('Gipuzkoa', 'Zarautz'),
    'zarauz':              ('Gipuzkoa', 'Zarautz'),
    'zumaia':              ('Gipuzkoa', 'Zumaia'),
    'getaria':             ('Gipuzkoa', 'Getaria'),
    'getario':             ('Gipuzkoa', 'Getaria'),
    'eibar':               ('Gipuzkoa', 'Eibar'),
    'tolosa':              ('Gipuzkoa', 'Tolosa'),
    'arrasate':            ('Gipuzkoa', 'Arrasate'),
    'mondragon':           ('Gipuzkoa', 'Arrasate'),
    'mondragón':           ('Gipuzkoa', 'Arrasate'),
    'hondarribia':         ('Gipuzkoa', 'Hondarribia'),
    'fuenterrabia':        ('Gipuzkoa', 'Hondarribia'),
    'fuenterrabía':        ('Gipuzkoa', 'Hondarribia'),
    'azpeitia':            ('Gipuzkoa', 'Azpeitia'),
    'azkoitia':            ('Gipuzkoa', 'Azkoitia'),
    'bergara':             ('Gipuzkoa', 'Bergara'),
    'pasaia':              ('Gipuzkoa', 'Pasaia'),
    'pasajes':             ('Gipuzkoa', 'Pasaia'),
    # ── Municipios importantes de Araba ──────────────────────────────────────
    'laguardia':           ('Araba',    'Laguardia'),
    'rioja alavesa':       ('Araba',    'Laguardia'),
    'amurrio':             ('Araba',    'Amurrio'),
    'llodio':              ('Araba',    'Laudio'),
    'laudio':              ('Araba',    'Laudio'),
    'salvatierra':         ('Araba',    'Agurain'),
    'agurain':             ('Araba',    'Agurain'),
}


class Item(BaseModel):
    item_id: int
    nombre: str
    subtipo: str          # "gastro" | "cultura" | "evento"
    categoria: str
    provincia: str
    estrella_prevista: float


class ChatResponse(BaseModel):
    suggestion: str
    items: List[Item] = []
    aviso: Optional[str] = None


def get_user_interests_from_db(user_id: int) -> list[int]:
    if not user_id:
        return []
    intereses = db.session.query(UserInteres.id_interes).filter_by(id_user=user_id).all()
    return [i[0] for i in intereses]


def detectar_ubicacion(msg_lower: str):
    """Devuelve (provincia, municipio_like, nombre_lugar) según el mensaje."""
    # Primero landmarks (más específicos)
    for keyword, (provincia, municipio) in LANDMARKS.items():
        if keyword in msg_lower:
            return provincia, municipio, keyword.title()
    # Luego ciudades
    for keyword, (provincia, municipio) in CITIES.items():
        if keyword in msg_lower:
            return provincia, municipio, keyword.title()
    return None, None, None


def detectar_intencion(msg_lower: str):
    """Devuelve (es_gastro, es_cultura, es_evento)."""
    if any(w in msg_lower for w in GENERAL_WORDS):
        return True, True, True
    es_gastro  = any(w in msg_lower for w in GASTRO_WORDS)
    es_cultura = any(w in msg_lower for w in CULTURA_WORDS)
    es_evento  = any(w in msg_lower for w in EVENTO_WORDS)
    if not any([es_gastro, es_cultura, es_evento]):
        return True, True, True
    return es_gastro, es_cultura, es_evento


def _query_with_fallback(base_query, municipio_like: str, provincia: str, limit: int):
    """
    Intenta filtrar por municipio; si no hay resultados cae a provincia;
    si tampoco, devuelve sin filtro geográfico.
    """
    if municipio_like:
        items = (base_query.join(Municipio)
                 .filter(Municipio.nombre.ilike(f'%{municipio_like}%'))
                 .limit(limit).all())
        if items:
            return items
    if provincia:
        items = (base_query.join(Municipio)
                 .filter(Municipio.provincia == provincia)
                 .limit(limit).all())
        if items:
            return items
    return base_query.limit(limit).all()


def buscar_recomendaciones(provincia: str, municipio_like: str,
                           es_gastro: bool, es_cultura: bool, es_evento: bool,
                           top_n=6):
    resultados = []
    tipos_activos = sum([es_gastro, es_cultura, es_evento]) or 1
    por_tipo = max(2, top_n // tipos_activos)

    if es_gastro:
        q = Gastronomia.query.filter(Gastronomia.active == True).order_by(Gastronomia.valoracion.desc())
        for g in _query_with_fallback(q, municipio_like, provincia, por_tipo):
            resultados.append(Item(
                item_id=g.id,
                nombre=g.nombre,
                subtipo='gastro',
                categoria=g.tipo_comida or 'Gastronomía',
                provincia=g.municipio.provincia if g.municipio else (provincia or ''),
                estrella_prevista=float(g.valoracion or 4.0),
            ))

    if es_cultura:
        q = Cultura.query.filter(Cultura.active == True).order_by(Cultura.valoracion.desc())
        for c in _query_with_fallback(q, municipio_like, provincia, por_tipo):
            resultados.append(Item(
                item_id=c.id,
                nombre=c.nombre,
                subtipo='cultura',
                categoria=c.tipo_lugar or 'Cultura',
                provincia=c.municipio.provincia if c.municipio else (provincia or ''),
                estrella_prevista=float(c.valoracion or 4.0),
            ))

    if es_evento:
        q = Evento.query.filter(Evento.active == True).order_by(Evento.start_date.asc())
        for e in _query_with_fallback(q, municipio_like, provincia, por_tipo):
            resultados.append(Item(
                item_id=e.id,
                nombre=e.establishment or e.place or e.company or 'Evento',
                subtipo='evento',
                categoria=e.type or 'Evento',
                provincia=e.municipio.provincia if e.municipio else (provincia or ''),
                estrella_prevista=4.0,
            ))

    return resultados


def manejar_chat_flask(message: str, session_id: str, user_id: Optional[int] = None):
    msg_lower = message.lower()

    provincia, municipio_like, nombre_lugar = detectar_ubicacion(msg_lower)
    es_gastro, es_cultura, es_evento = detectar_intencion(msg_lower)

    items_db = buscar_recomendaciones(provincia, municipio_like, es_gastro, es_cultura, es_evento)

    # Texto de la sugerencia
    lugar_str = nombre_lugar or municipio_like or provincia or 'el País Vasco'
    tipos = []
    if es_gastro:  tipos.append('gastronomía')
    if es_cultura: tipos.append('cultura')
    if es_evento:  tipos.append('eventos')
    tipos_str = ' y '.join(tipos) if tipos else 'actividades'

    if items_db:
        suggestion = (
            f"Cerca de {lugar_str} te recomiendo estas opciones de {tipos_str}. "
            f"Haz clic en cualquiera para ver más detalles."
        )
    else:
        suggestion = f"No he encontrado resultados de {tipos_str} cerca de {lugar_str}."

    return ChatResponse(suggestion=suggestion, items=items_db, aviso=None)


# ═════════════════════════════════════════════════════════════════════════════
# BLOQUE DESCONECTADO — Recomendación por contenido (GradientBoosting)
# ─────────────────────────────────────────────────────────────────────────────
# Este bloque NO está conectado a nada. No se importa ni se llama desde ningún
# sitio. Está aquí para cuando se quiera activar el filtrado por contenido
# como alternativa o complemento al SVD colaborativo.
#
# PARA ACTIVAR:
#   1. Asegurar scikit-learn >= 1.8 (los .pkl se generaron con esa versión)
#   2. Descomentar este bloque
#   3. En buscar_recomendaciones(), sustituir el order_by(valoracion.desc())
#      por _rankear_por_contenido(items_df, categoria)
#   4. Opcionalmente pasar user_afines (intereses del usuario como dict de
#      columnas afin_*) para personalizar la predicción de eventos
#
# MODELOS DISPONIBLES EN ML/models/:
#   content_gastro.pkl      → Pipeline(SimpleImputer + GradientBoostingRegressor)
#   content_patrimonio.pkl  → ídem
#   scaler_gastro.pkl       → MinMaxScaler(feature_range=(1,5)) sobre 'valoracion'
#   scaler_valoracion.pkl   → MinMaxScaler(feature_range=(1,5)) sobre 'valoracion'
#   feature_cols_patrimonio.csv → columnas exactas que espera content_patrimonio.pkl
#
# NOTA: content_eventos.pkl y svd_eventos.pkl no están en este proyecto todavía.
# ─────────────────────────────────────────────────────────────────────────────

# import pickle, os, numpy as np, pandas as pd
#
# _MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ML", "models")
#
# def _cargar(nombre):
#     with open(os.path.join(_MODELS_DIR, nombre), "rb") as f:
#         return pickle.load(f)
#
# # Carga diferida — descomentar cuando se quiera activar
# # _model_content_gastro      = _cargar("content_gastro.pkl")
# # _model_content_patrimonio  = _cargar("content_patrimonio.pkl")
# # _scaler_gastro             = _cargar("scaler_gastro.pkl")
# # _scaler_valoracion         = _cargar("scaler_valoracion.pkl")
#
#
# # ── Features esperadas por cada modelo ───────────────────────────────────────
# # Gastro: 'Tipo de lugar' (Asador/Bodega/Bodega Txakoli/Restaurante/Sidreria/
# #         queseria), 'Nivel precio' (Caro/Moderado/Muy caro), 'Provincia'
# #         (Araba/Bizkaia/Gipuzkoa), 'Entorno' (Bilbao/Costa Vasca/
# #         Montes y Valles vascos/Rioja Alavesa/San Sebastián/Vitoria-Gasteiz),
# #         'Michelin', 'Euskal Baserri', 'Eusko Label', 'valoracion'
# #
# # Patrimonio: columnas exactas en ML/models/feature_cols_patrimonio.csv
# #             Incluye 'tipo_cultura_Patrimonio Cultural', 'Capacidad',
# #             'Visita Guiada', 'culture_id', 'valoracion'
#
#
# def _build_features_gastro(items_df: pd.DataFrame) -> pd.DataFrame:
#     """Construye el DataFrame de features para el modelo de gastronomía."""
#     df = items_df.copy()
#     df = pd.get_dummies(df, columns=["Tipo de lugar", "Nivel precio",
#                                      "Provincia", "Entorno"])
#     for col in ["Michelin", "Euskal Baserri", "Eusko Label"]:
#         if col not in df.columns:
#             df[col] = False
#     return df
#
#
# def _build_features_patrimonio(items_df: pd.DataFrame) -> pd.DataFrame:
#     """
#     Construye el DataFrame de features para el modelo de patrimonio.
#     Usa feature_cols_patrimonio.csv para garantizar el orden exacto de columnas.
#     """
#     df = items_df.copy()
#     cols_path = os.path.join(_MODELS_DIR, "feature_cols_patrimonio.csv")
#     expected_cols = pd.read_csv(cols_path).columns.tolist()
#     df["tipo_cultura_Patrimonio Cultural"] = (
#         df.get("tipo_lugar", pd.Series(dtype=str)) == "Patrimonio Cultural"
#     ).astype(int)
#     for col in ["Capacidad", "Visita Guiada"]:
#         if col not in df.columns:
#             df[col] = 0
#     for col in expected_cols:
#         if col not in df.columns:
#             df[col] = 0
#     return df[expected_cols]
#
#
# def _rankear_por_contenido(items_df: pd.DataFrame,
#                             categoria: str,
#                             top_n: int = 5) -> pd.DataFrame:
#     """
#     Puntúa y ordena items usando el modelo de contenido correspondiente.
#
#     Parámetros
#     ----------
#     items_df  : DataFrame con los ítems del catálogo (columnas de la BD)
#     categoria : 'gastro' | 'patrimonio'
#     top_n     : número de resultados a devolver
#
#     Devuelve
#     --------
#     DataFrame con columna 'score_contenido' añadida, ordenado desc.
#     Sustituye al order_by(valoracion.desc()) actual en buscar_recomendaciones().
#     """
#     if categoria == "gastro":
#         modelo   = _model_content_gastro
#         features = _build_features_gastro(items_df)
#     elif categoria == "patrimonio":
#         modelo   = _model_content_patrimonio
#         features = _build_features_patrimonio(items_df)
#     else:
#         raise ValueError(f"Categoría desconocida: {categoria}")
#
#     # Alinear columnas con las que espera el modelo
#     if hasattr(modelo, "feature_names_in_"):
#         for col in modelo.feature_names_in_:
#             if col not in features.columns:
#                 features[col] = 0
#         features = features.reindex(columns=modelo.feature_names_in_, fill_value=0)
#
#     items_df = items_df.copy()
#     items_df["score_contenido"] = modelo.predict(features)
#     return items_df.sort_values("score_contenido", ascending=False).head(top_n)
#
# ═════════════════════════════════════════════════════════════════════════════
