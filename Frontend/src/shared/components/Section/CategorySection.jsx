import { useId } from "react";
import { Link } from "react-router";
import "./CategorySection.css";

/**
 * Sección de la pantalla de aterrizaje: cabecera (título + "Ver todos") y una
 * rejilla con como máximo `max` tarjetas ya prefiltradas.
 *
 * La interacción de cada tarjeta la resuelve la propia <Card> (su cuerpo es un
 * role="button" con onAction). Por eso aquí NO se envuelve en <Link> ni se añade
 * interacción extra: evitamos controles anidados. La sección solo coloca el grid
 * y el enlace "Ver todos".
 *
 * Uso en la página (Events / Gastronomy / Culture):
 *
 *   import { Card } from "@shared/components/Cards";
 *   import { useNavigate } from "react-router";
 *   const navigate = useNavigate();
 *
 *   <CategorySection
 *     title="Esta semana"
 *     seeAllTo="/events?filter=esta-semana"
 *     items={items}
 *     renderCard={(data) => (
 *       <Card
 *         variant="event"
 *         data={data}
 *         lang={lang}
 *         onAction={(d) => navigate(`/events/${d.id}`)}
 *         onToggleFavorite={toggleFavorite}
 *         isFavorite={isFavorite(data)}
 *       />
 *     )}
 *   />
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.seeAllTo]        Ruta del listado completo (react-router).
 * @param {string} [props.seeAllLabel="Ver todos"]
 * @param {ReadonlyArray<any>} props.items  Datos ya prefiltrados (se muestran `max`).
 * @param {(data: any) => React.ReactNode} props.renderCard  Pinta tu <Card data={...} />.
 * @param {number} [props.max=5]
 */
export default function CategorySection({
  title,
  seeAllTo,
  seeAllLabel = "Ver todos",
  items = [],
  renderCard,
  max = 5,
}) {
  const titleId = useId();
  const visible = Array.isArray(items) ? items.slice(0, max) : [];

  return (
    <section className="category-section" aria-labelledby={titleId}>
      <div className="category-section__header">
        <h2 className="category-section__title" id={titleId}>
          {title}
        </h2>
        {seeAllTo && (
          <Link className="category-section__see-all" to={seeAllTo}>
            {seeAllLabel}
            {/* Contexto para lectores de pantalla: de qué "Ver todos" se trata. */}
            <span className="sr-only"> de {title}</span>
            <span className="category-section__arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="category-section__empty">No hay resultados ahora mismo.</p>
      ) : (
        <ul className="category-section__list">
          {visible.map((data) => (
            <li
              className="category-section__item"
              key={data.id || data.google_place_id || data.kulturklik_id}
            >
              {renderCard(data)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}