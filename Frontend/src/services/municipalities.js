// IDs 1-15 coinciden exactamente con el seed de init.sql
// IDs 16+ requieren ejecutar el INSERT adicional en la BD
const MUNICIPALITIES = [
  // ── Bizkaia ────────────────────────────────────────────
  { id: 1,  name_es: 'Bilbao',               name_eu: 'Bilbo',              province: 'Bizkaia'  },
  { id: 2,  name_es: 'Getxo',                name_eu: 'Getxo',              province: 'Bizkaia'  },
  { id: 3,  name_es: 'Barakaldo',            name_eu: 'Barakaldo',          province: 'Bizkaia'  },
  { id: 7,  name_es: 'Ermua',                name_eu: 'Ermua',              province: 'Bizkaia'  },
  { id: 8,  name_es: 'Durango',              name_eu: 'Durango',            province: 'Bizkaia'  },
  { id: 9,  name_es: 'Leioa',                name_eu: 'Leioa',              province: 'Bizkaia'  },
  { id: 15, name_es: 'Bermeo',               name_eu: 'Bermeo',             province: 'Bizkaia'  },
  { id: 16, name_es: 'Basauri',              name_eu: 'Basauri',            province: 'Bizkaia'  },
  { id: 17, name_es: 'Santurtzi',            name_eu: 'Santurtzi',          province: 'Bizkaia'  },
  { id: 18, name_es: 'Portugalete',          name_eu: 'Portugalete',        province: 'Bizkaia'  },
  { id: 19, name_es: 'Sestao',               name_eu: 'Sestao',             province: 'Bizkaia'  },
  { id: 20, name_es: 'Erandio',              name_eu: 'Erandio',            province: 'Bizkaia'  },
  { id: 21, name_es: 'Gernika-Lumo',         name_eu: 'Gernika-Lumo',       province: 'Bizkaia'  },
  { id: 22, name_es: 'Mungia',               name_eu: 'Mungia',             province: 'Bizkaia'  },
  { id: 23, name_es: 'Galdakao',             name_eu: 'Galdakao',           province: 'Bizkaia'  },
  { id: 24, name_es: 'Arrigorriaga',         name_eu: 'Arrigorriaga',       province: 'Bizkaia'  },
  { id: 25, name_es: 'Amorebieta-Etxano',   name_eu: 'Amorebieta-Etxano',  province: 'Bizkaia'  },
  { id: 26, name_es: 'Sopelana',             name_eu: 'Sopelana',           province: 'Bizkaia'  },
  { id: 27, name_es: 'Berango',              name_eu: 'Berango',            province: 'Bizkaia'  },
  { id: 28, name_es: 'Ondarroa',             name_eu: 'Ondarroa',           province: 'Bizkaia'  },
  { id: 29, name_es: 'Markina-Xemein',       name_eu: 'Markina-Xemein',     province: 'Bizkaia'  },
  { id: 30, name_es: 'Balmaseda',            name_eu: 'Balmaseda',          province: 'Bizkaia'  },
  { id: 31, name_es: 'Plentzia',             name_eu: 'Plentzia',           province: 'Bizkaia'  },
  { id: 32, name_es: 'Lekeitio',             name_eu: 'Lekeitio',           province: 'Bizkaia'  },
  { id: 33, name_es: 'Zornotza',             name_eu: 'Zornotza',           province: 'Bizkaia'  },
  { id: 34, name_es: 'Zalla',                name_eu: 'Zalla',              province: 'Bizkaia'  },
  { id: 35, name_es: 'Ortuella',             name_eu: 'Ortuella',           province: 'Bizkaia'  },
  { id: 36, name_es: 'Valle de Trápaga',     name_eu: 'Trapagaran',         province: 'Bizkaia'  },
  { id: 37, name_es: 'Muskiz',               name_eu: 'Muskiz',             province: 'Bizkaia'  },
  { id: 38, name_es: 'Zierbena',             name_eu: 'Zierbena',           province: 'Bizkaia'  },
  { id: 39, name_es: 'Abanto y Ciérvana',   name_eu: 'Abanto Zierbena',    province: 'Bizkaia'  },
  { id: 40, name_es: 'Gordexola',            name_eu: 'Gordexola',          province: 'Bizkaia'  },
  { id: 41, name_es: 'Güeñes',               name_eu: 'Güeñes',             province: 'Bizkaia'  },
  { id: 42, name_es: 'Galdames',             name_eu: 'Galdames',           province: 'Bizkaia'  },

  // ── Gipuzkoa ───────────────────────────────────────────
  { id: 4,  name_es: 'San Sebastián',        name_eu: 'Donostia',           province: 'Gipuzkoa' },
  { id: 6,  name_es: 'Irún',                 name_eu: 'Irun',               province: 'Gipuzkoa' },
  { id: 10, name_es: 'Zarautz',              name_eu: 'Zarautz',            province: 'Gipuzkoa' },
  { id: 11, name_es: 'Hondarribia',          name_eu: 'Hondarribia',        province: 'Gipuzkoa' },
  { id: 12, name_es: 'Tolosa',               name_eu: 'Tolosa',             province: 'Gipuzkoa' },
  { id: 43, name_es: 'Errenteria',           name_eu: 'Errenteria',         province: 'Gipuzkoa' },
  { id: 44, name_es: 'Eibar',                name_eu: 'Eibar',              province: 'Gipuzkoa' },
  { id: 45, name_es: 'Hernani',              name_eu: 'Hernani',            province: 'Gipuzkoa' },
  { id: 46, name_es: 'Lasarte-Oria',         name_eu: 'Lasarte-Oria',       province: 'Gipuzkoa' },
  { id: 47, name_es: 'Mondragón',            name_eu: 'Arrasate',           province: 'Gipuzkoa' },
  { id: 48, name_es: 'Oñati',                name_eu: 'Oñati',              province: 'Gipuzkoa' },
  { id: 49, name_es: 'Beasain',              name_eu: 'Beasain',            province: 'Gipuzkoa' },
  { id: 50, name_es: 'Azpeitia',             name_eu: 'Azpeitia',           province: 'Gipuzkoa' },
  { id: 51, name_es: 'Azkoitia',             name_eu: 'Azkoitia',           province: 'Gipuzkoa' },
  { id: 52, name_es: 'Bergara',              name_eu: 'Bergara',            province: 'Gipuzkoa' },
  { id: 53, name_es: 'Zumaia',               name_eu: 'Zumaia',             province: 'Gipuzkoa' },
  { id: 54, name_es: 'Deba',                 name_eu: 'Deba',               province: 'Gipuzkoa' },
  { id: 55, name_es: 'Mutriku',              name_eu: 'Mutriku',            province: 'Gipuzkoa' },
  { id: 56, name_es: 'Zumarraga',            name_eu: 'Zumarraga',          province: 'Gipuzkoa' },
  { id: 57, name_es: 'Ordizia',              name_eu: 'Ordizia',            province: 'Gipuzkoa' },
  { id: 58, name_es: 'Legazpi',              name_eu: 'Legazpi',            province: 'Gipuzkoa' },
  { id: 59, name_es: 'Elgoibar',             name_eu: 'Elgoibar',           province: 'Gipuzkoa' },
  { id: 60, name_es: 'Zestoa',               name_eu: 'Zestoa',             province: 'Gipuzkoa' },
  { id: 61, name_es: 'Getaria',              name_eu: 'Getaria',            province: 'Gipuzkoa' },
  { id: 62, name_es: 'Orio',                 name_eu: 'Orio',               province: 'Gipuzkoa' },
  { id: 63, name_es: 'Andoain',              name_eu: 'Andoain',            province: 'Gipuzkoa' },
  { id: 64, name_es: 'Villabona',            name_eu: 'Billabona',          province: 'Gipuzkoa' },
  { id: 65, name_es: 'Urretxu',              name_eu: 'Urretxu',            province: 'Gipuzkoa' },
  { id: 66, name_es: 'Soraluze',             name_eu: 'Soraluze',           province: 'Gipuzkoa' },
  { id: 67, name_es: 'Pasaia',               name_eu: 'Pasaia',             province: 'Gipuzkoa' },
  { id: 68, name_es: 'Lezo',                 name_eu: 'Lezo',               province: 'Gipuzkoa' },

  // ── Álava / Araba ──────────────────────────────────────
  { id: 5,  name_es: 'Vitoria-Gasteiz',      name_eu: 'Gasteiz',            province: 'Álava'    },
  { id: 13, name_es: 'Llodio',               name_eu: 'Laudio',             province: 'Álava'    },
  { id: 14, name_es: 'Amurrio',              name_eu: 'Amurrio',            province: 'Álava'    },
  { id: 69, name_es: 'Salvatierra',          name_eu: 'Agurain',            province: 'Álava'    },
  { id: 70, name_es: 'Laguardia',            name_eu: 'Laguardia',          province: 'Álava'    },
  { id: 71, name_es: 'Oyón-Oion',            name_eu: 'Oion',               province: 'Álava'    },
  { id: 72, name_es: 'Alegría-Dulantzi',     name_eu: 'Dulantzi',           province: 'Álava'    },
  { id: 73, name_es: 'Añana',                name_eu: 'Añana',              province: 'Álava'    },
  { id: 74, name_es: 'Artziniega',           name_eu: 'Artziniega',         province: 'Álava'    },
  { id: 75, name_es: 'Zigoitia',             name_eu: 'Zigoitia',           province: 'Álava'    },
  { id: 76, name_es: 'Zuia',                 name_eu: 'Zuia',               province: 'Álava'    },
  { id: 77, name_es: 'Iruña de Oca',         name_eu: 'Iruña Oka',          province: 'Álava'    },
  { id: 78, name_es: 'Ribera Alta',          name_eu: 'Erribera Goitia',    province: 'Álava'    },
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

export function getNameById(id, lang = 'es') {
  const m = MUNICIPALITIES.find(m => m.id === id)
  if (!m) return ''
  return lang === 'eu' ? m.name_eu : m.name_es
}
