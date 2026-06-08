import BackButton from "@ui/BackButton";
import { FaLocationDot, FaStar, FaRegClock, FaEuroSign, FaLink, FaRegHeart, FaHeart } from "@ui/icons";
import { useLanguage } from "@shared/context/LanguageContext";
import { VARIANTS } from "../Cards/cardVariants";
import { getImage, formatDate, renderStars } from "../Cards/cardHelpers";
import { getCoordsById } from "@services/municipalities";
import "./Detail.css";

/** Devuelve coordenadas: prioriza lat/lng directos del item, luego busca en la lista estática */
function resolveCoords(data) {
  if (data.lat && data.lng) return { lat: data.lat, lng: data.lng };
  return getCoordsById(data.municipality_id) ?? null;
}

/** Devuelve el texto de localización más útil disponible */
function resolveLocation(data) {
  return data.direccion
    || data.municipio
    || data.Municipality?.nombre
    || null;
}

export default function Detail({ variant = "event", data = {}, onBack, isFavorite, onToggleFavorite }) {
  const { lang, t } = useLanguage();
  const cfg = VARIANTS[variant] || VARIANTS.event;
  const imageUrl = getImage(data, variant);
  const badgeText = cfg.badge(data);
  const title = cfg.title(data);
  const rating = cfg.rating?.(data);
  const reviews = cfg.reviews?.(data);
  const td = t.detail;

  const coords = resolveCoords(data);
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.025}%2C${coords.lat - 0.015}%2C${coords.lng + 0.025}%2C${coords.lat + 0.015}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : null;

  const location = resolveLocation(data);
  const phone = data.national_phone_number || data.telefono || null;
  const website = data.web || data.web_amigable || data.web_euskadi || data.purchase_url || null;
  const province = data.Municipality?.provincia || data.provincia || null;

  return (
    <article className="detail">
      <div className="detail__hero">
        <BackButton onClick={onBack} className="detail__hero-back" />
        {onToggleFavorite && (
          <button
            className="detail__favorite-btn"
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(data); }}
            aria-label={isFavorite ? t.card.removeFav : t.card.addFav}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
        {imageUrl ? (
          <img src={imageUrl} alt="" className="detail__hero-img"
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling?.style.setProperty("display", "block"); }}
          />
        ) : null}
        <div
          className={`detail__hero-placeholder detail__hero-placeholder--${variant}`}
          style={{ display: imageUrl ? "none" : "block" }}
        />
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
            <span className="detail__reviews">({t.card.reviews(reviews)})</span>
          </div>
        )}

        <div className="detail__info">
          {/* ── EVENTOS ─────────────────────────────────────── */}
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
                  <span className="detail__free">{td.free}</span>
                </div>
              ) : data.price_eur ? (
                <div className="detail__info-row">
                  <FaEuroSign className="detail__info-icon" />
                  <span>{data.price_eur} €</span>
                </div>
              ) : null}
              {data.purchase_url && (
                <div className="detail__info-row">
                  <FaLink className="detail__info-icon" />
                  <a href={data.purchase_url} target="_blank" rel="noopener noreferrer" className="detail__link">
                    {td.buyTickets}
                  </a>
                </div>
              )}
            </>
          )}

          {/* ── GASTRONOMÍA y CULTURA ───────────────────────── */}
          {(variant === "culture" || variant === "gastronomy") && (
            <>
              {/* Localización: dirección o municipio */}
              {location && (
                <div className="detail__info-row">
                  <FaLocationDot className="detail__info-icon" />
                  <span>{location}{province ? `, ${province}` : ""}</span>
                </div>
              )}

              {/* Teléfono */}
              {phone && (
                <div className="detail__info-row">
                  <span className="detail__info-icon" aria-hidden="true">📞</span>
                  <a href={`tel:${phone}`} className="detail__link">{phone}</a>
                </div>
              )}

              {/* Nivel de precio (solo gastronomía) */}
              {variant === "gastronomy" && data.nivel_precio && (
                <div className="detail__info-row">
                  <FaEuroSign className="detail__info-icon" />
                  <span>{data.nivel_precio}</span>
                </div>
              )}

              {/* Sitio web */}
              {website && (
                <div className="detail__info-row">
                  <FaLink className="detail__info-icon" />
                  <a href={website} target="_blank" rel="noopener noreferrer" className="detail__link">
                    {td.website ?? "Sitio web"}
                  </a>
                </div>
              )}

              {/* Distinciones (solo gastronomía) */}
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
              title={td.mapTitle}
              src={mapSrc}
              className="detail__map-iframe"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="detail__map-placeholder">
              <FaLocationDot className="detail__map-icon" />
              <span>{td.mapUnavailable}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
