export const categories = [
  { id: "gastronomia", nombre: "Gastronomía", icono: "utensils" },
  { id: "cultura", nombre: "Cultura", icono: "landmark" },
  { id: "musica", nombre: "Música en directo", icono: "music" },
  { id: "compras", nombre: "Tiendas especializadas", icono: "shopping-bag" },
  { id: "bienestar", nombre: "Bienestar", icono: "heart" }
];

export const events = [
  { id: "evt_001", nombre: "Cata de vinos de Rioja Alavesa", categoria: "gastronomia",
    descripcion: "Cata guiada por un sumiller en una bodega histórica del Ensanche. Aforo reducido.",
    ubicacion: { lat: 43.2645, lng: -2.9355, direccion: "Calle Ledesma 10, Bilbao", zona: "Ensanche" },
    valoracionMedia: 4.7, numResenas: 128, precio: "€€€", fecha: "2026-06-20T19:00:00Z",
    imagen: "https://picsum.photos/seed/vinos/600/400", destacado: true },
  { id: "evt_002", nombre: "Visita guiada al Museo de Bellas Artes", categoria: "cultura",
    descripcion: "Recorrido por la colección permanente con experto en arte vasco. Ritmo tranquilo.",
    ubicacion: { lat: 43.2603, lng: -2.9389, direccion: "Museo Plaza 2, Bilbao", zona: "Abando" },
    valoracionMedia: 4.8, numResenas: 256, precio: "€€", fecha: "2026-06-18T11:00:00Z",
    imagen: "https://picsum.photos/seed/museo/600/400", destacado: true },
  { id: "evt_003", nombre: "Concierto de jazz en el Café Iruña", categoria: "musica",
    descripcion: "Sesión de jazz clásico en un local centenario. Ambiente acogedor.",
    ubicacion: { lat: 43.2624, lng: -2.9301, direccion: "Berastegi 4, Bilbao", zona: "Abando" },
    valoracionMedia: 4.5, numResenas: 89, precio: "€€", fecha: "2026-06-21T20:30:00Z",
    imagen: "https://picsum.photos/seed/jazz/600/400", destacado: false },
  { id: "evt_004", nombre: "Tienda de quesos artesanos de Idiazabal", categoria: "compras",
    descripcion: "Degustación y compra de quesos con denominación de origen. Atención personalizada.",
    ubicacion: { lat: 43.2587, lng: -2.9342, direccion: "Indautxu, Bilbao", zona: "Indautxu" },
    valoracionMedia: 4.9, numResenas: 174, precio: "€€", fecha: "2026-06-19T10:00:00Z",
    imagen: "https://picsum.photos/seed/quesos/600/400", destacado: true },
  { id: "evt_005", nombre: "Paseo termal en balneario", categoria: "bienestar",
    descripcion: "Circuito de aguas termales y relax. Acceso adaptado y sin prisas.",
    ubicacion: { lat: 43.2701, lng: -2.9445, direccion: "Deusto, Bilbao", zona: "Deusto" },
    valoracionMedia: 4.6, numResenas: 63, precio: "€€€", fecha: "2026-06-22T17:00:00Z",
    imagen: "https://picsum.photos/seed/balneario/600/400", destacado: false },
  { id: "evt_006", nombre: "Menú degustación en restaurante con estrella", categoria: "gastronomia",
    descripcion: "Alta cocina vasca de temporada. Reserva imprescindible.",
    ubicacion: { lat: 43.2668, lng: -2.9312, direccion: "Gran Vía 38, Bilbao", zona: "Abando" },
    valoracionMedia: 4.8, numResenas: 312, precio: "€€€€", fecha: "2026-06-25T21:00:00Z",
    imagen: "https://picsum.photos/seed/estrella/600/400", destacado: true }
];

export const reviews = {
  evt_001: [
    { id: "rev_1", usuario: "María G.", puntuacion: 5, texto: "Trato exquisito y muy buena explicación. Repetiremos.", fecha: "2026-05-10T18:00:00Z" },
    { id: "rev_2", usuario: "Ignacio L.", puntuacion: 4, texto: "Vinos excelentes, el local algo justo de espacio.", fecha: "2026-05-12T20:00:00Z" }
  ],
  evt_002: [
    { id: "rev_3", usuario: "Begoña A.", puntuacion: 5, texto: "Visita muy bien explicada y sin agobios.", fecha: "2026-05-08T12:00:00Z" }
  ]
};

export const users = [
  { id: "usr_001", email: "maria@ejemplo.com", password: "demo1234", nombre: "María", favoritos: ["evt_002", "evt_004"] }
];
