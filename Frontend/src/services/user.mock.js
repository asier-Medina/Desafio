const SESSION_KEY = 'sustrai_mock_session'

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveSession(data) {
  const session = getSession()
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, ...data }))
}

function delay(ms = 400) {
  return new Promise(r => setTimeout(r, ms))
}

const CATALOG = [
  { id_interes: 100, nombre: 'Eventos',           level: 0, father_id: null },
  { id_interes: 101, nombre: 'Gastronomía',        level: 0, father_id: null },
  { id_interes: 102, nombre: 'Puntos de Interés',  level: 0, father_id: null },

  { id_interes: 110, nombre: 'Concierto',           level: 1, father_id: 100 },
  { id_interes: 111, nombre: 'Festival',            level: 1, father_id: 100 },
  { id_interes: 112, nombre: 'Fiestas',             level: 1, father_id: 100 },
  { id_interes: 113, nombre: 'Feria',               level: 1, father_id: 100 },
  { id_interes: 114, nombre: 'Teatro',              level: 1, father_id: 100 },
  { id_interes: 115, nombre: 'Danza',               level: 1, father_id: 100 },
  { id_interes: 116, nombre: 'Conferencia',         level: 1, father_id: 100 },
  { id_interes: 117, nombre: 'Presentación',        level: 1, father_id: 100 },
  { id_interes: 118, nombre: 'Cine y audiovisuales',level: 1, father_id: 100 },
  { id_interes: 119, nombre: 'Bertsolarismo',       level: 1, father_id: 100 },
  { id_interes: 120, nombre: 'Exposición',          level: 1, father_id: 100 },
  { id_interes: 121, nombre: 'Formación',           level: 1, father_id: 100 },
  { id_interes: 122, nombre: 'Concurso',            level: 1, father_id: 100 },

  { id_interes: 130, nombre: 'Restaurantes',        level: 1, father_id: 101 },
  { id_interes: 131, nombre: 'Bodegas',             level: 1, father_id: 101 },
  { id_interes: 132, nombre: 'Queserías',           level: 1, father_id: 101 },
  { id_interes: 133, nombre: 'Gourmet',             level: 1, father_id: 101 },

  { id_interes: 140, nombre: 'Restaurante',         level: 2, father_id: 130 },
  { id_interes: 141, nombre: 'Asador',              level: 2, father_id: 130 },
  { id_interes: 142, nombre: 'Sidrería',            level: 2, father_id: 130 },

  { id_interes: 150, nombre: 'Agricultura ecológica',   level: 2, father_id: 133 },
  { id_interes: 151, nombre: 'Denominación de Origen',  level: 2, father_id: 133 },
  { id_interes: 152, nombre: 'Eusko Label',             level: 2, father_id: 133 },
  { id_interes: 153, nombre: 'Euskal Baserri',          level: 2, father_id: 133 },

  { id_interes: 160, nombre: 'Museos',              level: 1, father_id: 102 },
  { id_interes: 161, nombre: 'Patrimonio cultural', level: 1, father_id: 102 },

  { id_interes: 170, nombre: 'Historia',            level: 2, father_id: 160 },
  { id_interes: 171, nombre: 'Ciencias naturales',  level: 2, father_id: 160 },
  { id_interes: 172, nombre: 'Arte',                level: 2, father_id: 160 },
  { id_interes: 173, nombre: 'Etnografía',          level: 2, father_id: 160 },
]

export async function getInterestsCatalog() {
  await delay(200)
  return CATALOG
}

export async function updateInterests(interest_ids) {
  await delay()
  saveSession({ interest_ids })
  return CATALOG.filter(i => interest_ids.includes(i.id_interes))
}

export async function updatePreferences(data) {
  await delay()
  saveSession({ preferences: data })
  return data
}
