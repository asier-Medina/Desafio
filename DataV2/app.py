from flask import Flask, jsonify, request
from config import Config
from models import (db, Municipio, Usuario, Preferencia, Interes,
                    UserInteres, Resena, Evento, Gastronomia, Cultura,
                    Qualification, GastronomyQualification)
from assistant_logic import manejar_chat_flask
from flask_cors import CORS
from sqlalchemy import text
from datetime import datetime
import logging
import os

logging.basicConfig(level=logging.INFO)


def paginate(query):
    limit  = request.args.get('limit',  20,  type=int)
    offset = request.args.get('offset', 0,   type=int)
    total  = query.count()
    items  = query.limit(limit).offset(offset).all()
    return items, {'total': total, 'limit': limit, 'offset': offset}


def ok(data, meta=None, status=200):
    body = {'data': data}
    if meta:
        body['meta'] = meta
    return jsonify(body), status


def err(msg, status=400):
    return jsonify({'error': msg}), status


def get_municipality_id_from_request():
    user_id = request.headers.get('X-User-Id', type=int)
    if not user_id:
        return None
    user = Usuario.query.get(user_id)
    return user.municipality_id if user else None


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    db.init_app(app)

    # =========================================================================
    # HEALTH
    # =========================================================================

    @app.route('/', methods=['GET'])
    def home():
        return ok({'message': 'Bienvenidos a la API SustraiApp (DataV2)'})

    # =========================================================================
    # AUTENTICACIÓN
    # =========================================================================

    @app.route('/registro', methods=['POST'])
    def registrar_usuario():
        data = request.get_json()
        required = ['nombre', 'email', 'password', 'municipality_id', 'sexo', 'age']
        if not all(f in data for f in required):
            return err("Faltan campos obligatorios")
        if Usuario.query.filter_by(email=data['email']).first():
            return err("El email ya está registrado", 409)
        if not Municipio.query.get(data['municipality_id']):
            return err("municipality_id no válido")
        try:
            u = Usuario(
                nombre=data['nombre'], apellido=data.get('apellido'),
                email=data['email'],   tlf=data.get('tlf'),
                municipality_id=int(data['municipality_id']),
                sexo=data['sexo'],     age=int(data['age']), role='user'
            )
            u.set_password(data['password'])
            db.session.add(u)
            db.session.flush()
            db.session.add(Preferencia(user_id=u.id_user))
            db.session.commit()
            return ok({'mensaje': 'Usuario creado', 'usuario': u.to_dict()}, status=201)
        except Exception as e:
            db.session.rollback()
            return err(str(e), 500)

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return err("Email y password requeridos")
        u = Usuario.query.filter_by(email=data['email']).first()
        if u and u.check_password(data['password']):
            return ok({'mensaje': 'Login exitoso', 'user_id': u.id_user, 'role': u.role})
        return err("Credenciales inválidas", 401)

    # =========================================================================
    # MUNICIPIOS
    # =========================================================================

    @app.route('/api/municipios', methods=['GET'])
    def listar_municipios():
        municipios = Municipio.query.order_by(Municipio.nombre).all()
        return ok([m.to_dict() for m in municipios])

    # =========================================================================
    # EVENTOS
    # =========================================================================

    @app.route('/api/eventos/esta-semana', methods=['GET'])
    def eventos_esta_semana():
        q = (Evento.query
             .filter(Evento.active == True)
             .filter(text("""
                 start_date >= date_trunc('week', NOW() AT TIME ZONE 'Europe/Madrid')
                             AT TIME ZONE 'Europe/Madrid'
                 AND start_date <= date_trunc('week', NOW() AT TIME ZONE 'Europe/Madrid')
                             AT TIME ZONE 'Europe/Madrid' + interval '6 days 23:59:59'
             """))
             .order_by(Evento.start_date.asc()))
        items, meta = paginate(q)
        return ok([e.to_dict() for e in items], meta)

    @app.route('/api/eventos/fin-de-semana', methods=['GET'])
    def eventos_fin_de_semana():
        q = (Evento.query
             .filter(Evento.active == True)
             .filter(text("""
                 EXTRACT(DOW FROM start_date AT TIME ZONE 'Europe/Madrid') IN (0, 6)
                 AND start_date >= NOW()
                 AND start_date <= NOW() + interval '7 days'
             """))
             .order_by(Evento.start_date.asc()))
        items, meta = paginate(q)
        return ok([e.to_dict() for e in items], meta)

    @app.route('/api/eventos/cerca-de-ti', methods=['GET'])
    def eventos_cerca_de_ti():
        mun_id = (request.args.get('municipality_id', type=int)
                  or get_municipality_id_from_request())
        if not mun_id:
            return err("Usuario no autenticado o sin municipio", 401)
        q = (Evento.query
             .filter(Evento.active == True)
             .filter(Evento.municipality_id == mun_id)
             .order_by(Evento.start_date.asc()))
        items, meta = paginate(q)
        return ok([e.to_dict() for e in items], meta)

    @app.route('/api/eventos/en-euskera', methods=['GET'])
    def eventos_en_euskera():
        q = (Evento.query
             .filter(Evento.active == True)
             .filter(Evento.language == 'eu')
             .order_by(Evento.start_date.asc()))
        items, meta = paginate(q)
        return ok([e.to_dict() for e in items], meta)

    @app.route('/api/eventos', methods=['GET'])
    def eventos_todos():
        q = Evento.query.filter(Evento.active == True)
        if request.args.get('municipality_id'):
            q = q.filter(Evento.municipality_id == request.args.get('municipality_id', type=int))
        if request.args.get('is_free'):
            q = q.filter(Evento.is_free == (request.args.get('is_free') == 'true'))
        if request.args.get('type'):
            q = q.filter(Evento.type == request.args.get('type'))
        q = q.order_by(Evento.start_date.asc())
        items, meta = paginate(q)
        return ok([e.to_dict() for e in items], meta)

    # =========================================================================
    # GASTRONOMÍA
    # =========================================================================

    @app.route('/api/gastronomia/<int:gastro_id>/cualificaciones', methods=['GET'])
    def obtener_cualificaciones_gastronomia(gastro_id):
        gastro = Gastronomia.query.get(gastro_id)
        if not gastro:
            return err("Establecimiento no encontrado", 404)
        return ok({
            'id':               gastro.id,
            'nombre':           gastro.nombre,
            'cualificaciones':  [gq.qualification.to_dict()
                                 for gq in gastro.cualificaciones
                                 if gq.qualification],
        })

    @app.route('/api/gastronomia/mejor-valorados', methods=['GET'])
    def gastro_mejor_valorados():
        q = (Gastronomia.query
             .filter(Gastronomia.active == True)
             .filter(Gastronomia.num_resenas >= 10)
             .order_by(Gastronomia.valoracion.desc(),
                       Gastronomia.num_resenas.desc()))
        items, meta = paginate(q)
        return ok([g.to_dict() for g in items], meta)

    @app.route('/api/gastronomia/michelin-repsol', methods=['GET'])
    def gastro_michelin_repsol():
        """Establecimientos con distinción Michelin o Repsol."""
        ids_con_distincion = (
            db.session.query(GastronomyQualification.gastronomy_id)
            .join(Qualification)
            .filter(Qualification.codigo.in_(['michelin_estrella', 'repsol_sol']))
            .subquery()
        )
        q = (Gastronomia.query
             .filter(Gastronomia.active == True)
             .filter(Gastronomia.id.in_(ids_con_distincion))
             .order_by(Gastronomia.valoracion.desc().nullslast()))
        items, meta = paginate(q)
        return ok([g.to_dict() for g in items], meta)

    @app.route('/api/gastronomia/entorno-especial', methods=['GET'])
    def gastro_entorno_especial():
        q = (Gastronomia.query
             .filter(Gastronomia.active == True)
             .filter(Gastronomia.entorno.isnot(None))
             .filter(Gastronomia.entorno != '')
             .order_by(Gastronomia.valoracion.desc().nullslast()))
        items, meta = paginate(q)
        return ok([g.to_dict() for g in items], meta)

    @app.route('/api/gastronomia/cerca-de-ti', methods=['GET'])
    def gastro_cerca_de_ti():
        mun_id = (request.args.get('municipality_id', type=int)
                  or get_municipality_id_from_request())
        if not mun_id:
            return err("Usuario no autenticado o sin municipio", 401)
        q = (Gastronomia.query
             .filter(Gastronomia.active == True)
             .filter(Gastronomia.municipality_id == mun_id)
             .order_by(Gastronomia.valoracion.desc().nullslast()))
        items, meta = paginate(q)
        return ok([g.to_dict() for g in items], meta)

    @app.route('/api/gastronomia', methods=['GET'])
    def gastro_todos():
        q = Gastronomia.query.filter(Gastronomia.active == True)
        if request.args.get('municipality_id'):
            q = q.filter(Gastronomia.municipality_id == request.args.get('municipality_id', type=int))
        if request.args.get('tipo_comida'):
            q = q.filter(Gastronomia.tipo_comida == request.args.get('tipo_comida'))
        q = q.order_by(Gastronomia.valoracion.desc().nullslast())
        items, meta = paginate(q)
        return ok([g.to_dict() for g in items], meta)

    # =========================================================================
    # CULTURA
    # =========================================================================

    @app.route('/api/cultura/museos', methods=['GET'])
    def cultura_museos():
        q = (Cultura.query
             .filter(Cultura.active == True)
             .filter(Cultura.tipo_lugar.ilike('museo'))
             .order_by(Cultura.valoracion.desc().nullslast()))
        items, meta = paginate(q)
        return ok([c.to_dict() for c in items], meta)

    @app.route('/api/cultura/patrimonio', methods=['GET'])
    def cultura_patrimonio():
        q = (Cultura.query
             .filter(Cultura.active == True)
             .filter(Cultura.tipo_lugar.ilike('patrimonio%'))
             .order_by(Cultura.valoracion.desc().nullslast()))
        items, meta = paginate(q)
        return ok([c.to_dict() for c in items], meta)

    @app.route('/api/cultura/visita-guiada', methods=['GET'])
    def cultura_visita_guiada():
        q = (Cultura.query
             .filter(Cultura.active == True)
             .filter(Cultura.visita_guiada == True)
             .order_by(Cultura.valoracion.desc().nullslast()))
        items, meta = paginate(q)
        return ok([c.to_dict() for c in items], meta)

    @app.route('/api/cultura/cerca-de-ti', methods=['GET'])
    def cultura_cerca_de_ti():
        mun_id = (request.args.get('municipality_id', type=int)
                  or get_municipality_id_from_request())
        if not mun_id:
            return err("Usuario no autenticado o sin municipio", 401)
        q = (Cultura.query
             .filter(Cultura.active == True)
             .filter(Cultura.municipality_id == mun_id)
             .order_by(Cultura.valoracion.desc().nullslast()))
        items, meta = paginate(q)
        return ok([c.to_dict() for c in items], meta)

    @app.route('/api/cultura', methods=['GET'])
    def cultura_todos():
        q = Cultura.query.filter(Cultura.active == True)
        if request.args.get('municipality_id'):
            q = q.filter(Cultura.municipality_id == request.args.get('municipality_id', type=int))
        if request.args.get('tipo_lugar'):
            q = q.filter(Cultura.tipo_lugar == request.args.get('tipo_lugar'))
        if request.args.get('visita_guiada'):
            q = q.filter(Cultura.visita_guiada == (request.args.get('visita_guiada') == 'true'))
        q = q.order_by(Cultura.valoracion.desc().nullslast())
        items, meta = paginate(q)
        return ok([c.to_dict() for c in items], meta)

    # =========================================================================
    # PREFERENCIAS
    # =========================================================================

    @app.route('/usuarios/<int:user_id>/preferencias', methods=['GET'])
    def obtener_preferencias(user_id):
        prefs = Preferencia.query.filter_by(user_id=user_id).first()
        if not prefs:
            return err("Preferencias no encontradas", 404)
        return ok(prefs.to_dict())

    @app.route('/usuarios/<int:user_id>/preferencias', methods=['PUT'])
    def actualizar_preferencias(user_id):
        data  = request.get_json()
        prefs = Preferencia.query.filter_by(user_id=user_id).first()
        if not prefs:
            return err("Preferencias no encontradas", 404)
        try:
            prefs.rango_precio       = data.get('rango_precio',       prefs.rango_precio)
            prefs.movilidad_reducida = data.get('movilidad_reducida', prefs.movilidad_reducida)
            if 'municipios_interes' in data:
                prefs.municipios_interes = [int(m) for m in data['municipios_interes']]
            prefs.updated_at = datetime.utcnow()
            db.session.commit()
            return ok({'mensaje': 'Preferencias actualizadas', 'data': prefs.to_dict()})
        except Exception as e:
            db.session.rollback()
            return err(str(e), 500)

    # =========================================================================
    # INTERESES
    # =========================================================================

    @app.route('/intereses', methods=['GET'])
    def listar_intereses():
        return ok([i.to_dict() for i in Interes.query.all()])

    @app.route('/usuarios/<int:user_id>/intereses', methods=['GET'])
    def obtener_intereses_usuario(user_id):
        uis = UserInteres.query.filter_by(id_user=user_id).all()
        return ok({'id_user': user_id, 'intereses': [ui.id_interes for ui in uis]})

    @app.route('/usuarios/<int:user_id>/intereses', methods=['POST'])
    def agregar_interes_usuario(user_id):
        data       = request.get_json()
        id_interes = data.get('id_interes')
        if not id_interes:
            return err("id_interes es requerido")
        if not Interes.query.get(id_interes):
            return err("El interés no existe", 404)
        if UserInteres.query.filter_by(id_user=user_id, id_interes=id_interes).first():
            return ok({'mensaje': 'El usuario ya tiene este interés'})
        try:
            db.session.add(UserInteres(id_user=user_id, id_interes=id_interes))
            db.session.commit()
            return ok({'mensaje': 'Interés agregado'}, status=201)
        except Exception as e:
            db.session.rollback()
            return err(str(e), 500)

    @app.route('/usuarios/<int:user_id>/intereses/<int:id_interes>', methods=['DELETE'])
    def eliminar_interes_usuario(user_id, id_interes):
        rel = UserInteres.query.filter_by(id_user=user_id, id_interes=id_interes).first()
        if not rel:
            return err("Relación no encontrada", 404)
        try:
            db.session.delete(rel)
            db.session.commit()
            return ok({'mensaje': 'Interés eliminado'})
        except Exception as e:
            db.session.rollback()
            return err(str(e), 500)

    # =========================================================================
    # RESEÑAS
    # =========================================================================

    @app.route('/resenas', methods=['POST'])
    def crear_resena():
        data = request.get_json()
        required = ['user_id', 'entidad_tipo', 'entidad_id', 'puntuacion']
        if not all(k in data for k in required):
            return err("Faltan campos obligatorios")
        if data['entidad_tipo'] not in ['event', 'gastro', 'cultura']:
            return err("Tipo de entidad inválido")
        if not (1 <= data['puntuacion'] <= 5):
            return err("La puntuación debe ser entre 1 y 5")
        fk_map = {'event': 'event_id', 'gastro': 'gastro_id', 'cultura': 'culture_id'}
        try:
            r = Resena(
                user_id=data['user_id'],
                puntuacion=data['puntuacion'],
                texto=data.get('texto', ''),
                **{fk_map[data['entidad_tipo']]: data['entidad_id']}
            )
            db.session.add(r)
            db.session.commit()
            return ok({'mensaje': 'Reseña creada', 'id': r.id}, status=201)
        except Exception as e:
            db.session.rollback()
            return err(str(e), 500)

    @app.route('/resenas/<string:entidad_tipo>/<int:entidad_id>', methods=['GET'])
    def obtener_resenas_entidad(entidad_tipo, entidad_id):
        if entidad_tipo not in ['event', 'gastro', 'cultura']:
            return err("Tipo inválido")
        fk_col = {
            'event':   Resena.event_id,
            'gastro':  Resena.gastro_id,
            'cultura': Resena.culture_id,
        }
        resenas = Resena.query.filter(fk_col[entidad_tipo] == entidad_id).all()
        return ok([r.to_dict() for r in resenas])

    # =========================================================================
    # CHATBOT
    # =========================================================================

    @app.route('/api/chat', methods=['POST'])
    def chat_assistant():
        data = request.get_json()
        if not data or 'message' not in data:
            return err("Falta el mensaje")

        user_id = request.headers.get('X-User-Id', type=int)

        try:
            respuesta = manejar_chat_flask(
                message=data['message'],
                session_id=data.get('session_id', 'default'),
                user_id=user_id
            )
            return ok(respuesta.dict())
        except Exception as e:
            logging.error(f"Error en chat: {e}")
            return err(f"Error en el asistente: {str(e)}", 500)

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5442))
    app.run(host='0.0.0.0', port=port, debug=False)
