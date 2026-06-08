// IDs coinciden con los códigos NORA numéricos de shared.municipalities
const MUNICIPALITIES = [
  // ── Bizkaia ─────────────────────────────────────────────────────────────────
  { id: 48020, name_es: 'Bilbao',               name_eu: 'Bilbo',              province: 'Bizkaia',  lat: 43.2627, lng: -2.9253 },
  { id: 48044, name_es: 'Getxo',                name_eu: 'Getxo',              province: 'Bizkaia',  lat: 43.3561, lng: -2.9879 },
  { id: 48013, name_es: 'Barakaldo',            name_eu: 'Barakaldo',          province: 'Bizkaia',  lat: 43.2963, lng: -2.9937 },
  { id: 48034, name_es: 'Ermua',                name_eu: 'Ermua',              province: 'Bizkaia',  lat: 43.1934, lng: -2.5023 },
  { id: 48027, name_es: 'Durango',              name_eu: 'Durango',            province: 'Bizkaia',  lat: 43.1715, lng: -2.6337 },
  { id: 48054, name_es: 'Leioa',                name_eu: 'Leioa',              province: 'Bizkaia',  lat: 43.3265, lng: -2.9839 },
  { id: 48017, name_es: 'Bermeo',               name_eu: 'Bermeo',             province: 'Bizkaia',  lat: 43.4207, lng: -2.7224 },
  { id: 48015, name_es: 'Basauri',              name_eu: 'Basauri',            province: 'Bizkaia',  lat: 43.2356, lng: -2.8869 },
  { id: 48082, name_es: 'Santurtzi',            name_eu: 'Santurtzi',          province: 'Bizkaia',  lat: 43.3312, lng: -3.0319 },
  { id: 48078, name_es: 'Portugalete',          name_eu: 'Portugalete',        province: 'Bizkaia',  lat: 43.3184, lng: -3.0208 },
  { id: 48084, name_es: 'Sestao',               name_eu: 'Sestao',             province: 'Bizkaia',  lat: 43.3025, lng: -3.0147 },
  { id: 48902, name_es: 'Erandio',              name_eu: 'Erandio',            province: 'Bizkaia',  lat: 43.3057, lng: -2.9614 },
  { id: 48046, name_es: 'Gernika-Lumo',         name_eu: 'Gernika-Lumo',       province: 'Bizkaia',  lat: 43.3147, lng: -2.6827 },
  { id: 48069, name_es: 'Mungia',               name_eu: 'Mungia',             province: 'Bizkaia',  lat: 43.3553, lng: -2.8462 },
  { id: 48036, name_es: 'Galdakao',             name_eu: 'Galdakao',           province: 'Bizkaia',  lat: 43.2313, lng: -2.8453 },
  { id: 48011, name_es: 'Arrigorriaga',         name_eu: 'Arrigorriaga',       province: 'Bizkaia',  lat: 43.2034, lng: -2.8888 },
  { id: 48003, name_es: 'Amorebieta-Etxano',   name_eu: 'Amorebieta-Etxano',  province: 'Bizkaia',  lat: 43.2197, lng: -2.7403 },
  { id: 48085, name_es: 'Sopelana',             name_eu: 'Sopelana',           province: 'Bizkaia',  lat: 43.3869, lng: -2.9935 },
  { id: 48016, name_es: 'Berango',              name_eu: 'Berango',            province: 'Bizkaia',  lat: 43.3703, lng: -2.9698 },
  { id: 48073, name_es: 'Ondarroa',             name_eu: 'Ondarroa',           province: 'Bizkaia',  lat: 43.3243, lng: -2.4165 },
  { id: 48060, name_es: 'Markina-Xemein',       name_eu: 'Markina-Xemein',     province: 'Bizkaia',  lat: 43.2622, lng: -2.4994 },
  { id: 48090, name_es: 'Balmaseda',            name_eu: 'Balmaseda',          province: 'Bizkaia',  lat: 43.1866, lng: -3.1901 },
  { id: 48077, name_es: 'Plentzia',             name_eu: 'Plentzia',           province: 'Bizkaia',  lat: 43.4039, lng: -2.9483 },
  { id: 48057, name_es: 'Lekeitio',             name_eu: 'Lekeitio',           province: 'Bizkaia',  lat: 43.3600, lng: -2.5005 },
  { id: 48096, name_es: 'Zalla',                name_eu: 'Zalla',              province: 'Bizkaia',  lat: 43.2154, lng: -3.1461 },
  { id: 48083, name_es: 'Ortuella',             name_eu: 'Ortuella',           province: 'Bizkaia',  lat: 43.3077, lng: -3.0611 },
  { id: 48080, name_es: 'Valle de Trápaga',     name_eu: 'Trapagaran',         province: 'Bizkaia',  lat: 43.2985, lng: -3.0518 },
  { id: 48071, name_es: 'Muskiz',               name_eu: 'Muskiz',             province: 'Bizkaia',  lat: 43.3436, lng: -3.1196 },
  { id: 48913, name_es: 'Zierbena',             name_eu: 'Zierbena',           province: 'Bizkaia',  lat: 43.3600, lng: -3.0824 },
  { id: 48002, name_es: 'Abanto y Ciérvana',   name_eu: 'Abanto Zierbena',    province: 'Bizkaia',  lat: 43.3234, lng: -3.0911 },
  { id: 48042, name_es: 'Gordexola',            name_eu: 'Gordexola',          province: 'Bizkaia',  lat: 43.1869, lng: -3.1145 },
  { id: 48045, name_es: 'Güeñes',               name_eu: 'Güeñes',             province: 'Bizkaia',  lat: 43.2041, lng: -3.0767 },
  { id: 48037, name_es: 'Galdames',             name_eu: 'Galdames',           province: 'Bizkaia',  lat: 43.2531, lng: -3.1180 },

  // ── Gipuzkoa ─────────────────────────────────────────────────────────────────
  { id: 20069, name_es: 'San Sebastián',        name_eu: 'Donostia',           province: 'Gipuzkoa', lat: 43.3183, lng: -1.9812 },
  { id: 20045, name_es: 'Irún',                 name_eu: 'Irun',               province: 'Gipuzkoa', lat: 43.3385, lng: -1.7894 },
  { id: 20079, name_es: 'Zarautz',              name_eu: 'Zarautz',            province: 'Gipuzkoa', lat: 43.2843, lng: -2.1718 },
  { id: 20036, name_es: 'Hondarribia',          name_eu: 'Hondarribia',        province: 'Gipuzkoa', lat: 43.3627, lng: -1.7971 },
  { id: 20071, name_es: 'Tolosa',               name_eu: 'Tolosa',             province: 'Gipuzkoa', lat: 43.1323, lng: -2.0757 },
  { id: 20067, name_es: 'Errenteria',           name_eu: 'Errenteria',         province: 'Gipuzkoa', lat: 43.3076, lng: -1.8999 },
  { id: 20030, name_es: 'Eibar',                name_eu: 'Eibar',              province: 'Gipuzkoa', lat: 43.1851, lng: -2.4722 },
  { id: 20040, name_es: 'Hernani',              name_eu: 'Hernani',            province: 'Gipuzkoa', lat: 43.2677, lng: -1.9734 },
  { id: 20902, name_es: 'Lasarte-Oria',         name_eu: 'Lasarte-Oria',       province: 'Gipuzkoa', lat: 43.2676, lng: -2.0150 },
  { id: 20055, name_es: 'Mondragón',            name_eu: 'Arrasate',           province: 'Gipuzkoa', lat: 43.0695, lng: -2.4916 },
  { id: 20059, name_es: 'Oñati',                name_eu: 'Oñati',              province: 'Gipuzkoa', lat: 43.0328, lng: -2.4131 },
  { id: 20019, name_es: 'Beasain',              name_eu: 'Beasain',            province: 'Gipuzkoa', lat: 43.0503, lng: -2.1942 },
  { id: 20018, name_es: 'Azpeitia',             name_eu: 'Azpeitia',           province: 'Gipuzkoa', lat: 43.1804, lng: -2.2658 },
  { id: 20017, name_es: 'Azkoitia',             name_eu: 'Azkoitia',           province: 'Gipuzkoa', lat: 43.1759, lng: -2.3142 },
  { id: 20074, name_es: 'Bergara',              name_eu: 'Bergara',            province: 'Gipuzkoa', lat: 43.1182, lng: -2.4162 },
  { id: 20081, name_es: 'Zumaia',               name_eu: 'Zumaia',             province: 'Gipuzkoa', lat: 43.2960, lng: -2.2589 },
  { id: 20029, name_es: 'Deba',                 name_eu: 'Deba',               province: 'Gipuzkoa', lat: 43.2955, lng: -2.3525 },
  { id: 20056, name_es: 'Mutriku',              name_eu: 'Mutriku',            province: 'Gipuzkoa', lat: 43.3107, lng: -2.3853 },
  { id: 20080, name_es: 'Zumarraga',            name_eu: 'Zumarraga',          province: 'Gipuzkoa', lat: 43.0820, lng: -2.3202 },
  { id: 20076, name_es: 'Ordizia',              name_eu: 'Ordizia',            province: 'Gipuzkoa', lat: 43.0643, lng: -2.1707 },
  { id: 20051, name_es: 'Legazpi',              name_eu: 'Legazpi',            province: 'Gipuzkoa', lat: 43.0541, lng: -2.3389 },
  { id: 20032, name_es: 'Elgoibar',             name_eu: 'Elgoibar',           province: 'Gipuzkoa', lat: 43.2118, lng: -2.4131 },
  { id: 20027, name_es: 'Zestoa',               name_eu: 'Zestoa',             province: 'Gipuzkoa', lat: 43.2299, lng: -2.2758 },
  { id: 20039, name_es: 'Getaria',              name_eu: 'Getaria',            province: 'Gipuzkoa', lat: 43.2984, lng: -2.2025 },
  { id: 20061, name_es: 'Orio',                 name_eu: 'Orio',               province: 'Gipuzkoa', lat: 43.2786, lng: -2.1278 },
  { id: 20009, name_es: 'Andoain',              name_eu: 'Andoain',            province: 'Gipuzkoa', lat: 43.2242, lng: -2.0163 },
  { id: 20075, name_es: 'Villabona',            name_eu: 'Billabona',          province: 'Gipuzkoa', lat: 43.2067, lng: -2.0432 },
  { id: 20077, name_es: 'Urretxu',              name_eu: 'Urretxu',            province: 'Gipuzkoa', lat: 43.0965, lng: -2.2824 },
  { id: 20065, name_es: 'Soraluze',             name_eu: 'Soraluze',           province: 'Gipuzkoa', lat: 43.1776, lng: -2.4407 },
  { id: 20064, name_es: 'Pasaia',               name_eu: 'Pasaia',             province: 'Gipuzkoa', lat: 43.3267, lng: -1.9276 },
  { id: 20053, name_es: 'Lezo',                 name_eu: 'Lezo',               province: 'Gipuzkoa', lat: 43.3260, lng: -1.9014 },

  // ── Álava / Araba ─────────────────────────────────────────────────────────────
  { id:  1059, name_es: 'Vitoria-Gasteiz',      name_eu: 'Gasteiz',            province: 'Álava',    lat: 42.8467, lng: -2.6726 },
  { id:  1036, name_es: 'Llodio',               name_eu: 'Laudio',             province: 'Álava',    lat: 43.1417, lng: -2.9679 },
  { id:  1002, name_es: 'Amurrio',              name_eu: 'Amurrio',            province: 'Álava',    lat: 43.0517, lng: -2.9985 },
  { id:  1051, name_es: 'Salvatierra',          name_eu: 'Agurain',            province: 'Álava',    lat: 42.8502, lng: -2.3912 },
  { id:  1031, name_es: 'Laguardia',            name_eu: 'Laguardia',          province: 'Álava',    lat: 42.5613, lng: -2.5862 },
  { id:  1043, name_es: 'Oyón-Oion',            name_eu: 'Oion',               province: 'Álava',    lat: 42.5157, lng: -2.7000 },
  { id:  1001, name_es: 'Alegría-Dulantzi',     name_eu: 'Dulantzi',           province: 'Álava',    lat: 42.8372, lng: -2.5016 },
  { id:  1049, name_es: 'Añana',                name_eu: 'Añana',              province: 'Álava',    lat: 42.7992, lng: -2.9905 },
  { id:  1004, name_es: 'Artziniega',           name_eu: 'Artziniega',         province: 'Álava',    lat: 43.1148, lng: -3.1490 },
  { id:  1018, name_es: 'Zigoitia',             name_eu: 'Zigoitia',           province: 'Álava',    lat: 42.9491, lng: -2.7679 },
  { id:  1063, name_es: 'Zuia',                 name_eu: 'Zuia',               province: 'Álava',    lat: 42.9600, lng: -2.8200 },
  { id:  1901, name_es: 'Iruña de Oca',         name_eu: 'Iruña Oka',          province: 'Álava',    lat: 42.8038, lng: -2.7467 },
  { id:  1046, name_es: 'Ribera Alta',          name_eu: 'Erribera Goitia',    province: 'Álava',    lat: 42.9157, lng: -2.5818 },
]

export function getAll(lang = 'es') {
  return MUNICIPALITIES
    .slice()
    .sort((a, b) => {
      const la = lang === 'eu' ? a.name_eu : a.name_es
      const lb = lang === 'eu' ? b.name_eu : b.name_es
      return la.localeCompare(lb, 'es')
    })
    .map(m => ({
      value:    m.id,
      label:    lang === 'eu' ? m.name_eu : m.name_es,
      province: m.province,
    }))
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export async function fetchAll() {
  const res = await fetch(`${BASE_URL}/api/municipalities`, { credentials: 'include' })
  if (!res.ok) throw new Error('Error al cargar municipios')
  const data = await res.json()
  return data.map(m => ({
    value:    m.id,
    label:    m.nombre,
    province: m.provincia,
  }))
}

export function getNameById(id, lang = 'es') {
  const m = MUNICIPALITIES.find(m => m.id === id)
  if (!m) return ''
  return lang === 'eu' ? m.name_eu : m.name_es
}

export function getCoordsById(id) {
  const m = MUNICIPALITIES.find(m => m.id === id)
  if (!m) return null
  return { lat: m.lat, lng: m.lng }
}
