import { useId, useMemo, useState } from "react";
import Button from "@shared/ui/Button";
import { useLanguage } from "@shared/context/LanguageContext";
import "./CategoryFilters.css";

export default function CategoryFilters({ title, items, filter1, filter2, baseFilter, onChange, onReset, children }) {
  const baseId = useId();
  const { t } = useLanguage();
  const tf = t.categoryFilters;

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
        } catch {}
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
  const allLabel = filter1?.allLabel ?? t.categoryFilters.allLabel;
  const baseLabel = baseFilter?.label ?? null;
  const displayTitle = baseLabel ? `${title} ${baseLabel}` : title;
  const resultsText = baseLabel
    ? `${tf.results(total)} ${baseLabel}`
    : tf.results(total);

  return (
    <section className="category-filters" aria-labelledby={titleId}>
      <div className="category-filters__header">
        <h2 className="category-filters__title" id={titleId}>
          {displayTitle}
        </h2>
        {hasActiveFilter && (
          <button
            type="button"
            className="category-filters__reset"
            onClick={resetFilters}
          >
            {tf.reset}
          </button>
        )}
      </div>

      <div className="category-filters__groups">
        <div className="category-filters__group">
          <label className="category-filters__group-label" htmlFor={group1Id}>
            {filter1?.label ?? ""}
          </label>
          <select
            id={group1Id}
            className="category-filters__select"
            value={refinement ?? ""}
            onChange={(e) => selectRefinement(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">{allLabel}</option>
            {options1.map((op) => (
              <option key={op.id} value={op.id}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {filter2 && options2.length > 0 && (
          <div className="category-filters__group">
            <label className="category-filters__group-label" htmlFor={sortId}>
              {filter2.label ?? ""}
            </label>
            <select
              id={sortId}
              className="category-filters__select"
              value={sort ?? ""}
              onChange={(e) => selectSort(e.target.value === "" ? null : e.target.value)}
            >
              <option value="">{filter2.defaultLabel ?? ""}</option>
              {options2.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <p className="category-filters__result" role="status" aria-live="polite">
        {resultsText}
      </p>

      {children(filteredItems)}
    </section>
  );
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
