import BackButton from "@ui/BackButton";
import { FaLocationDot, FaStar, FaRegClock, FaEuroSign, FaLink, FaRegHeart, FaHeart } from "@ui/icons";
import { VARIANTS, LABELS } from "../Cards/cardVariants";
import { getImage, formatDate, renderStars } from "../Cards/cardHelpers";
import { getCoordsById } from "@services/municipalities";
import "./Detail.css";

export default function Detail({ variant = "event", data = {}, lang = "es", onBack, isFavorite, onToggleFavorite }) {
  const t = LABELS[lang] ?? LABELS.es;
  const cfg = VARIANTS[variant] || VARIANTS.event;
  const imageUrl = getImage(data, variant);
  const badgeText = cfg.badge(data);
  const title = cfg.title(data);
  const rating = cfg.rating?.(data);
  const reviews = cfg.reviews?.(data);

  const coords = getCoordsById(data.municipality_id);
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.025}%2C${coords.lat - 0.015}%2C${coords.lng + 0.025}%2C${coords.lat + 0.015}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : null;

  return (
    <article className="detail">
      <div className="detail__hero">
        <BackButton onClick={onBack} className="detail__hero-back" />
        {onToggleFavorite && (
          <button
            className="detail__favorite-btn"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(data); }}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
        {imageUrl ? (
          <img src={imageUrl} alt="" className="detail__hero-img" />
        ) : (
          <div className={`detail__hero-placeholder detail__hero-placeholder--${variant}`} />
        )}
        <div className="detail__hero-overlay">
          {badgeText && <span className={`detail__badge detail__badge--${variant}`}>{badgeText}</span>}
        </div>
      </div>

      <div className="detail__body">
        <h1 className="detail__title">{title}</h1>

        {rating > 0 && (
          <div className="detail__rating">
            <FaStar className="detail__rating-icon" />
            <span className="detail__rating-value">{Number(rating).toFixed(1)}</span>
            {renderStars(rating)}
            <span className="detail__reviews">({t.reviews(reviews)})</span>
          </div>
        )}

        <div className="detail__info">
          {variant === "event" && (
            <>
              {data.start_date && (
                <div className="detail__info-row">
                  <FaRegClock className="detail__info-icon" />
                  <div>
                    <strong>{formatDate(data.start_date, lang)}</strong>
                    {data.end_date && <> – {formatDate(data.end_date, lang)}</>}
                  </div>
                </div>
              )}
              {(data.establishment || data.place) && (
                <div className="detail__info-row">
                  <FaLocationDot className="detail__info-icon" />
                  <span>{data.establishment || data.place}</span>
                </div>
              )}
              {data.is_free ? (
                <div className="detail__info-row">
                  <FaEuroSign className="detail__info-icon" />
                  <span className="detail__free">{lang === 'eu' ? 'Dohain' : 'Gratuito'}</span>
                </div>
              ) : data.price_eur && (
                <div className="detail__info-row">
                  <FaEuroSign className="detail__info-icon" />
                  <span>{data.price_eur} €</span>
                </div>
              )}
              {data.purchase_url && (
                <div className="detail__info-row">
                  <FaLink className="detail__info-icon" />
                  <a href={data.purchase_url} target="_blank" rel="noopener noreferrer" className="detail__link">
                    {lang === 'eu' ? 'Sarrerak erosi' : 'Comprar entradas'}
                  </a>
                </div>
              )}
            </>
          )}

          {(variant === "culture" || variant === "gastronomy") && (
            <>
              {data.direccion && (
                <div className="detail__info-row">
                  <FaLocationDot className="detail__info-icon" />
                  <span>{data.direccion}</span>
                </div>
              )}
              {variant === "gastronomy" && cfg.extras && (
                <div className="detail__tags">{cfg.extras(data)}</div>
              )}
            </>
          )}
        </div>

        {data.descripcion && (
          <p className="detail__description">{data.descripcion}</p>
        )}

        <div className="detail__map">
          {mapSrc ? (
            <iframe
              title={lang === 'eu' ? 'Kokapena mapan' : 'Ubicación en el mapa'}
              src={mapSrc}
              className="detail__map-iframe"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="detail__map-placeholder">
              <FaLocationDot className="detail__map-icon" />
              <span>{lang === 'eu' ? 'Mapa ez dago erabilgarri' : 'Mapa no disponible'}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
