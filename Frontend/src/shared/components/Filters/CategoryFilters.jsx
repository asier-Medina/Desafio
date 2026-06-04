import { useId, useMemo, useState } from "react";
import Button from "@shared/ui/Button";
import "./CategoryFilters.css";

export default function CategoryFilters({ title, items, filter1, filter2, baseFilter, onChange, onReset, children }) {
  const baseId = useId();

  // Validación defensiva: descartamos opciones mal formadas (OWASP, fallar seguro).
  const options1 = useMemo(
    () => (filter1 && Array.isArray(filter1.options) ? filter1.options.filter(isValidFilter1) : []),
    [filter1],
  );
  const options2 = useMemo(
    () => (filter2 && Array.isArray(filter2.options) ? filter2.options.filter(isValidFilter2) : []),
    [filter2],
  );

  const [refinement, setRefinement] = useState(() =>
    filter1?.initial && options1.some((o) => o.id === filter1.initial) ? filter1.initial : null,
  );
  const [sort, setSort] = useState(() =>
    filter2?.initial && options2.some((o) => o.id === filter2.initial) ? filter2.initial : null,
  );

  const filteredItems = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];

    if (refinement !== null) {
      const ref = options1.find((o) => o.id === refinement);
      if (ref) {
        list = list.filter((el) => {
          try {
            return Boolean(ref.predicate(el));
          } catch {
            return false;
          }
        });
      }
    }

    if (sort !== null) {
      const ord = options2.find((o) => o.id === sort);
      if (ord) {
        try {
          list = [...list].sort(ord.comparator);
        } catch {
          /* si el comparador falla, mantenemos el orden de llegada */
        }
      }
    }

    return list;
  }, [items, options1, options2, refinement, sort]);

  const hasActiveFilter = refinement !== null || sort !== null || Boolean(baseFilter?.label);

  function selectRefinement(id) {
    setRefinement(id);
    if (typeof onChange === "function") onChange({ refinement: id, sort });
  }

  function selectSort(id) {
    setSort(id);
    if (typeof onChange === "function") onChange({ refinement, sort: id });
  }

  function resetFilters() {
    setRefinement(null);
    setSort(null);
    if (typeof onChange === "function") onChange({ refinement: null, sort: null });
    if (typeof onReset === "function") onReset();
  }

  const titleId = `${baseId}-title`;
  const group1Id = `${baseId}-f1`;
  const sortId = `${baseId}-f2`;
  const total = filteredItems.length;
  const allLabel = filter1?.allLabel ?? "Todos";
  const baseLabel = baseFilter?.label ?? null;
  const resultsText = baseLabel
    ? `${total === 1 ? "1 resultado" : `${total} resultados`} ${baseLabel}`
    : total === 1
      ? "1 resultado"
      : `${total} resultados`;

  return (
    <section className="category-filters" aria-labelledby={titleId}>
      <div className="category-filters__header">
        <h2 className="category-filters__title" id={titleId}>
          {title}
        </h2>
        {hasActiveFilter && (
          <button
            type="button"
            className="category-filters__reset"
            onClick={resetFilters}
          >
            Restablecer filtros
          </button>
        )}
      </div>

      {/* ----- Filtro 1: refinamiento (selección única) ----- */}
      <div className="category-filters__group">
        <p className="category-filters__group-label" id={group1Id}>
          {filter1?.label ?? "Filtrar por"}
        </p>
        <div className="category-filters__options" role="group" aria-labelledby={group1Id}>
          <Button
            type="button"
            className={chipClass(refinement === null)}
            aria-pressed={refinement === null}
            onClick={() => selectRefinement(null)}
          >
            {allLabel}
          </Button>

          {options1.map((op) => {
            const active = op.id === refinement;
            return (
              <Button
                key={op.id}
                type="button"
                className={chipClass(active)}
                aria-pressed={active}
                onClick={() => selectRefinement(op.id)}
              >
                {op.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ----- Filtro 2: ordenar por (no recorta) ----- */}
      {filter2 && options2.length > 0 && (
        <div className="category-filters__group category-filters__group--sort">
          <label className="category-filters__group-label" htmlFor={sortId}>
            {filter2.label ?? "Ordenar por"}
          </label>
          <select
            id={sortId}
            className="category-filters__select"
            value={sort ?? ""}
            onChange={(e) => selectSort(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">{filter2.defaultLabel ?? "Ordenar por"}</option>
            {options2.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Región viva: anuncia a lectores de pantalla cuántos resultados hay. */}
      <p className="category-filters__result" role="status" aria-live="polite">
        {resultsText}
      </p>

      {children(filteredItems)}
    </section>
  );
}

function chipClass(active) {
  const base = "category-filters__option";
  return active ? `${base} is-active` : base;
}

function isValidFilter1(o) {
  return (
    !!o &&
    typeof o === "object" &&
    typeof o.id === "string" &&
    o.id.length > 0 &&
    typeof o.label === "string" &&
    typeof o.predicate === "function"
  );
}

function isValidFilter2(o) {
  return (
    !!o &&
    typeof o === "object" &&
    typeof o.id === "string" &&
    o.id.length > 0 &&
    typeof o.label === "string" &&
    typeof o.comparator === "function"
  );
}