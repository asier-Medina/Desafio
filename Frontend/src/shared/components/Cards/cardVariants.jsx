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

const GASTRONOMY_TIPO_ICONS = {
  'vasca':              FaUtensils,
  'vasca creativa':     FaPaintbrush,
  'alta cocina':        FaCrown,
  'tradicional':        FaUtensils,
  'pescados y mariscos': FaFish,
};

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

// Mapa de código de distinción → representación visual
const DIST_MAP = {
  michelin_estrella:   { logo: michelinLogo, label: 'Michelin' },
  repsol_sol:          { logo: repsolLogo,   label: 'Repsol Sol' },
  denominacion_origen: { emoji: '🏷️', label: 'D.O.' },
  calidad_q:           { emoji: '🔵', label: 'Calidad Q' },
  agricultura_eco:     { emoji: '🌱', label: 'Ecológico' },
  euskal_baserri:      { emoji: '🐄', label: 'Euskal Baserri' },
  euskolabel:          { emoji: '🏷️', label: 'Eusko Label' },
};

function DistincionBadges({ cualificaciones }) {
  if (!cualificaciones?.length) return null;
  return (
    <>
      {cualificaciones.map((q) => {
        const def = DIST_MAP[q.codigo] ?? { emoji: '⭐', label: q.nombre };
        if (def.logo) {
          return (
            <span key={q.codigo} className={`card__tag card__tag--${q.codigo.replace(/_/g, '-')}`}>
              <img src={def.logo} alt="" className="card__tag-logo" />
              {def.label}
            </span>
          );
        }
        return (
          <span key={q.codigo} className="card__tag">
            {def.emoji} {def.label}
          </span>
        );
      })}
    </>
  );
}

// Devuelve el texto de localización más apropiado según los datos disponibles
function getLocation(d) {
  return d.direccion
    || d.municipio
    || d.Municipality?.nombre
    || null;
}

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
    meta: (d) => {
      const loc = getLocation(d);
      return loc ? (
        <span className="card__meta-item">
          <FaLocationDot className="card__icon" aria-hidden="true" />
          <span>{loc}</span>
        </span>
      ) : null;
    },
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
    meta: (d) => {
      // Gastronomía no tiene dirección → usamos municipio como referencia geográfica
      const loc = d.municipio || d.Municipality?.nombre || null;
      return loc ? (
        <span className="card__meta-item">
          <FaLocationDot className="card__icon" aria-hidden="true" />
          <span>{loc}</span>
        </span>
      ) : null;
    },
    extras: (d) => <DistincionBadges cualificaciones={d.cualificaciones} />,
    rating: (d) => d.valoracion,
    reviews: (d) => d.num_resenas,
  },
};
