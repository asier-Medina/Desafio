import {
  FaLocationDot, FaRegCalendar, FaUtensils, FaLandmark,
  FaBuildingColumns, FaPalette, FaScroll, FaPersonChalkboard, FaMonument,
  FaArchway, FaLandmarkFlag, FaTree, FaUmbrellaBeach,
  FaMusic, FaMasksTheater, FaPaintbrush, FaBook,
  FaMicrophone, FaFutbol, FaFire, FaWineGlass,
  FaMugSaucer, FaFish, FaCampground, FaStore,
  FaDrum, FaCrown, FaUsers,
} from "@ui/icons";
import michelinLogo from "./logos/michelin.png";
import repsolLogo from "./logos/repsol.jpeg";
import { formatDate } from "./cardHelpers.jsx";

export const LABELS = {
  es: {
    featured: "Destacado",
    ended: "Finalizado",
    reviews: (n) => `${n} reseñas`,
  },
  eu: {
    featured: "Nabarmendua",
    ended: "Amaitua",
    reviews: (n) => `${n} iritzi`,
  },
};

const EVENT_ICONS = {
  concierto:    FaMusic,
  festival:     FaCampground,
  exposición:   FaPaintbrush,
  exposicion:   FaPaintbrush,
  fiestas:      FaCampground,
  teatro:       FaMasksTheater,
  danza:        FaDrum,
  mercado:      FaStore,
  feria:        FaStore,
  bertsolarismo: FaMicrophone,
  conferencia:  FaMicrophone,
  deportes:     FaFutbol,
  carnaval:     FaCampground,
};

const CULTURE_ICONS = {
  museo:            FaBuildingColumns,
  teatro:           FaMasksTheater,
  galeria:          FaPalette,
  galería:          FaPalette,
  biblioteca:       FaScroll,
  centro_cultural:  FaPersonChalkboard,
  monumento:        FaMonument,
  'casco histórico': FaArchway,
  'casco historico': FaArchway,
  patrimonio:       FaLandmarkFlag,
  parque:           FaTree,
  playa:            FaUmbrellaBeach,
};

// Iconos por tipo_comida (lo que aparece en el badge)
const GASTRONOMY_TIPO_ICONS = {
  'vasca':              FaUtensils,
  'vasca creativa':     FaPaintbrush,
  'alta cocina':        FaCrown,
  'tradicional':        FaUtensils,
  'pescados y mariscos': FaFish,
};

// Iconos por type de establecimiento (fallback)
const GASTRONOMY_TYPE_ICONS = {
  'asador':      FaFire,
  'sidrería':    FaWineGlass,
  'sidreria':    FaWineGlass,
  'bodega':      FaWineGlass,
  'café':        FaMugSaucer,
  'cafe':        FaMugSaucer,
  'bar':         FaWineGlass,
  'restaurante': FaUtensils,
};

export const VARIANTS = {
  event: {
    badge: (d) => d.type,
    title: (d) => d.nombre_es || d.nombre || `${d.type} · ${d.establishment || ""}`,
    badgeIcon: (d) => EVENT_ICONS[(d.type || "").toLowerCase()] ?? FaRegCalendar,
    meta: (d, t, lang) => (
      <>
        {d.start_date && (
          <span className="card__meta-item">
            <FaRegCalendar className="card__icon" aria-hidden="true" />
            <time dateTime={d.start_date}>
              {formatDate(d.start_date, lang)}
              {d.end_date && new Date(d.end_date) < new Date() && ` · ${t.ended}`}
            </time>
          </span>
        )}
        {(d.establishment || d.place) && (
          <span className="card__meta-item">
            <FaLocationDot className="card__icon" aria-hidden="true" />
            <span>{d.establishment || d.place}</span>
          </span>
        )}
      </>
    ),
    rating: null,
  },

  culture: {
    badge: (d) => {
      const map = {
        museo: "Museo",
        teatro: "Teatro",
        galeria: "Galería",
        biblioteca: "Biblioteca",
        centro_cultural: "Centro Cultural",
        monumento: "Monumento",
      };
      return map[d.tipo_lugar] || d.tipo_lugar;
    },
    title: (d) => d.nombre,
    badgeIcon: (d) => CULTURE_ICONS[(d.tipo_lugar || "").toLowerCase()] ?? FaLandmark,
    meta: (d) => (
      <>
        {d.direccion && (
          <span className="card__meta-item">
            <FaLocationDot className="card__icon" aria-hidden="true" />
            <span>{d.direccion}</span>
          </span>
        )}
      </>
    ),
    rating: (d) => d.valoracion,
    reviews: (d) => d.numero_valoraciones,
  },

  gastronomy: {
    badge: (d) => {
      const map = {
        asador: "Asador",
        sidreria: "Sidrería",
        restaurante: "Restaurante",
        bar: "Bar",
        cafeteria: "Cafetería",
        taberna: "Taberna",
        marisqueria: "Marisquería",
      };
      return map[d.tipo_comida] || d.tipo_comida;
    },
    title: (d) => d.nombre,
    badgeIcon: (d) => {
      const byTipo = GASTRONOMY_TIPO_ICONS[(d.tipo_comida || "").toLowerCase()];
      const byType = GASTRONOMY_TYPE_ICONS[(d.type || "").toLowerCase()];
      return byTipo ?? byType ?? FaUtensils;
    },
    meta: (d) => (
      <>
        {d.direccion && (
          <span className="card__meta-item">
            <FaLocationDot className="card__icon" aria-hidden="true" />
            <span>{d.direccion}</span>
          </span>
        )}
      </>
    ),
    extras: (d) => (
      <>
        {d.michelin && (
          <span className="card__tag card__tag--michelin">
            <img src={michelinLogo} alt="" className="card__tag-logo" />
            Michelin
          </span>
        )}
        {d.repsol && (
          <span className="card__tag card__tag--repsol">
            <img src={repsolLogo} alt="" className="card__tag-logo" />
            Repsol
          </span>
        )}
      </>
    ),
    rating: (d) => d.valoracion,
    reviews: (d) => d.num_resenas,
  },
};
