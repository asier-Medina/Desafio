import { useState } from "react";
import { FaLocationDot, FaRegCalendar, FaUtensils, FaStar } from "../../ui/icons";
import FavoriteButton from "../Favorite/FavoriteButton";
import michelinLogo from "./logos/michelin.png";
import repsolLogo from "./logos/repsol.jpeg";
import "./Card.css";

const LABELS = {
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

function formatDate(dateStr, lang) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(lang === "eu" ? "eu" : "es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderStars(rating) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="card__stars" aria-hidden="true">
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
    </span>
  );
}

const VARIANT = {
  event: {
    badge: (d) => d.typeEs,
    title: (d) => d.nombre_es,
    badgeIcon: null,
    meta: (d, t, lang) => (
      <>
        {d.startDate && (
          <span className="card__meta-item">
            <FaRegCalendar className="card__icon" aria-hidden="true" />
            <time dateTime={d.startDate}>
              {formatDate(d.startDate, lang)}
              {d.endDate && new Date(d.endDate) < new Date() && ` · ${t.ended}`}
            </time>
          </span>
        )}
        {(d.establishmentEs || d.municipalityEs) && (
          <span className="card__meta-item">
            <FaLocationDot className="card__icon" aria-hidden="true" />
            <span>{d.establishmentEs || d.municipalityEs}</span>
          </span>
        )}
      </>
    ),
    rating: null,
  },
  culture: {
    badge: (d) => {
      const map = { museo: "Museo", teatro: "Teatro", galeria: "Galería", biblioteca: "Biblioteca", centro_cultural: "Centro Cultural", monumento: "Monumento" };
      return map[d.tipo_lugar] || d.tipo_lugar;
    },
    title: (d) => d.nombre,
    badgeIcon: null,
    meta: (d) => (
      <>
        {(d.direccion || d.municipio) && (
          <span className="card__meta-item">
            <FaLocationDot className="card__icon" aria-hidden="true" />
            <span>{d.direccion || d.municipio}</span>
          </span>
        )}
      </>
    ),
    rating: (d) => d.valoracion,
    reviews: (d) => d.num_valoraciones,
  },
  gastronomy: {
    badge: (d) => {
      const map = { asador: "Asador", sidreria: "Sidrería", restaurante: "Restaurante", bar: "Bar", cafeteria: "Cafetería", taberna: "Taberna", marisqueria: "Marisquería" };
      return map[d.tipo_comida] || d.tipo_comida;
    },
    title: (d) => d.nombre,
    badgeIcon: FaUtensils,
    meta: (d) => (
      <>
        {d.municipio && (
          <span className="card__meta-item">
            <FaLocationDot className="card__icon" aria-hidden="true" />
            <span>{d.municipio}</span>
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

function getImage(data, variant) {
  if (variant === "event") {
    const raw = data.images;
    if (!raw) return "";
    if (Array.isArray(raw) && raw.length > 0) {
      return raw[0]?.imageUrl || raw[0]?.url || "";
    }
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0]?.imageUrl || parsed[0]?.url || "";
        }
      } catch {}
    }
    return "";
  }
  return data.url_imagen || data.imagen_url || "";
}

export default function Card({
  variant = "event",
  data = {},
  onAction,
  onFavoriteToggle,
  lang = "es",
}) {
  const t = LABELS[lang] ?? LABELS.es;
  const cfg = VARIANT[variant] || VARIANT.event;
  const imageUrl = getImage(data, variant);
  const title = cfg.title(data);
  const badgeText = cfg.badge(data);
  const BadgeIcon = cfg.badgeIcon;
  const rating = cfg.rating?.(data);
  const reviews = cfg.reviews?.(data);
  const uid = data.id || data.id_Kulturklik || data.google_place_id || data.kulturklik_id;

  if (data.active === false) return null;

  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <article className="card" data-key={uid}>
      <div className="card__media">
        <FavoriteButton
          isFavorited={isFavorited}
          onToggle={() => {
            setIsFavorited((prev) => !prev);
            onFavoriteToggle?.(data);
          }}
        />
        {imageUrl ? (
          <img src={imageUrl} alt="" className="card__img" loading="lazy" />
        ) : (
          <div className={`card__img-placeholder card__img-placeholder--${variant}`} />
        )}
      </div>

      <div
        className="card__content"
        onClick={() => onAction?.(data)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAction?.(data);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={title}
      >
        {badgeText && (
          <span className="card__badge">
            {BadgeIcon && <BadgeIcon className="card__badge-icon" aria-hidden="true" />}
            {badgeText}
          </span>
        )}

        <h3 className="card__title">{title}</h3>

        <div className="card__meta">
          {cfg.meta(data, t, lang)}
        </div>

        {rating > 0 && (
          <span className="card__rating">
            <span className="card__rating-value">{Number(rating).toFixed(1)}</span>
            {renderStars(rating)}
            <span className="card__reviews">({t.reviews(reviews)})</span>
          </span>
        )}

        {cfg.extras && (
          <div className="card__tags">
            {cfg.extras(data)}
          </div>
        )}
      </div>
    </article>
  );
}
