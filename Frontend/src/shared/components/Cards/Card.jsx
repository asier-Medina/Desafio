import { FaRegHeart, FaHeart } from "../../ui/icons";
import { LABELS, VARIANTS } from "./cardVariants.jsx";
import { getImage, renderStars } from "./cardHelpers.jsx";
import "./Card.css";

export default function Card({
  variant = "event",
  display = "default",
  data = {},
  onAction,
  onToggleFavorite,
  isFavorite = false,
  lang = "es",
  children,
  className = "",
}) {
  const t = LABELS[lang] ?? LABELS.es;
  const cfg = VARIANTS[variant] || VARIANTS.event;
  const imageUrl = getImage(data, variant);
  const title = cfg.title(data);
  const badgeText = cfg.badge(data, lang);
  const BadgeIcon = cfg.badgeIcon;
  const rating = cfg.rating?.(data);
  const reviews = cfg.reviews?.(data);
  const uid = data.id || data.id_Kulturklik || data.google_place_id || data.kulturklik_id;

  if (data.active === false) return null;

  const cardClass = ["card", `card--${display}`, className].filter(Boolean).join(" ");

  if (display === "auth") {
    return (
      <article className={cardClass} data-key={uid}>
        {children}
      </article>
    );
  }

  return (
    <article className={cardClass} data-key={uid}>
      <div className="card__media">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="card__img" loading="lazy" />
        ) : (
          <div className={`card__img-placeholder card__img-placeholder--${variant}`} />
        )}
        {onToggleFavorite && (
          <button
            className="card__favorite-btn"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(data); }}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
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
          <span className={`card__badge card__badge--${variant}`}>
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
