import { useId, useMemo, useState } from 'react';
import './FiltrosCategoria.css';

/**
 * Barra de filtros de la pantalla de listado de una categoría.
 *
 * Modelo en 3 capas (igual para Eventos, Gastronomía y Cultura):
 *   1. BASE: la sección excluyente por la que se entra. La aplica la PÁGINA
 *      antes de pasar `elementos` (aquí ya llegan acotados a la base).
 *   2. FILTRO 1 (refinamiento): selección ÚNICA. Se aplica en AND sobre la base.
 *      "Todos" = sin refinamiento. Las opciones son excluyentes entre sí.
 *   3. FILTRO 2 (ordenar por): solo reordena, nunca recorta. Opción por
 *      defecto = sin ordenar.
 *
 * El componente no conoce el dominio: cada página le pasa los predicados
 * (Filtro 1) y los comparadores (Filtro 2). Así se mantiene reutilizable.
 *
 * @typedef {Object} OpcionFiltro1
 * @property {string} id
 * @property {string} etiqueta
 * @property {(elemento: any) => boolean} predicado
 *
 * @typedef {Object} OpcionFiltro2
 * @property {string} id
 * @property {string} etiqueta
 * @property {(a: any, b: any) => number} comparador
 *
 * @param {Object} props
 * @param {string} props.titulo                 Título accesible de la pantalla.
 * @param {ReadonlyArray<any>} props.elementos   Lista ya acotada a la base.
 * @param {{ etiqueta?: string, etiquetaTodos?: string, opciones: ReadonlyArray<OpcionFiltro1>, seleccionInicial?: string|null }} props.filtro1
 * @param {{ etiqueta?: string, etiquetaPorDefecto?: string, opciones: ReadonlyArray<OpcionFiltro2>, seleccionInicial?: string|null }} [props.filtro2]
 * @param {(estado: { refinamiento: string|null, orden: string|null }) => void} [props.onCambio]
 * @param {(elementosFiltrados: any[]) => React.ReactNode} props.children
 */
export function FiltrosCategoria({ titulo, elementos, filtro1, filtro2, onCambio, children }) {
  const idBase = useId();

  // OWASP — validación de entradas / fallar seguro: descartamos opciones mal formadas.
  const opciones1 = useMemo(
    () => (filtro1 && Array.isArray(filtro1.opciones) ? filtro1.opciones.filter(esOpcionFiltro1Valida) : []),
    [filtro1],
  );
  const opciones2 = useMemo(
    () => (filtro2 && Array.isArray(filtro2.opciones) ? filtro2.opciones.filter(esOpcionFiltro2Valida) : []),
    [filtro2],
  );

  const [refinamiento, setRefinamiento] = useState(() =>
    filtro1?.seleccionInicial && opciones1.some((o) => o.id === filtro1.seleccionInicial)
      ? filtro1.seleccionInicial
      : null,
  );
  const [orden, setOrden] = useState(() =>
    filtro2?.seleccionInicial && opciones2.some((o) => o.id === filtro2.seleccionInicial)
      ? filtro2.seleccionInicial
      : null,
  );

  const elementosFiltrados = useMemo(() => {
    let lista = Array.isArray(elementos) ? [...elementos] : [];

    // Filtro 1: refinamiento en AND sobre la base.
    if (refinamiento !== null) {
      const ref = opciones1.find((o) => o.id === refinamiento);
      if (ref) {
        lista = lista.filter((el) => {
          try {
            return Boolean(ref.predicado(el));
          } catch {
            return false; // si el predicado falla con datos raros, se excluye.
          }
        });
      }
    }

    // Filtro 2: orden (no recorta).
    if (orden !== null) {
      const ord = opciones2.find((o) => o.id === orden);
      if (ord) {
        try {
          lista = [...lista].sort(ord.comparador);
        } catch {
          /* si el comparador falla, mantenemos el orden de llegada */
        }
      }
    }

    return lista;
  }, [elementos, opciones1, opciones2, refinamiento, orden]);

  function cambiarRefinamiento(id) {
    setRefinamiento(id);
    if (typeof onCambio === 'function') onCambio({ refinamiento: id, orden });
  }

  function cambiarOrden(id) {
    setOrden(id);
    if (typeof onCambio === 'function') onCambio({ refinamiento, orden: id });
  }

  const idTitulo = `${idBase}-titulo`;
  const idGrupo1 = `${idBase}-f1`;
  const idOrden = `${idBase}-f2`;
  const total = elementosFiltrados.length;
  const etiquetaTodos = filtro1?.etiquetaTodos ?? 'Todos';

  return (
    <section className="filtros-categoria" aria-labelledby={idTitulo}>
      <h2 className="filtros-categoria__titulo" id={idTitulo}>
        {titulo}
      </h2>

      {/* ----- Filtro 1: refinamiento (selección única) ----- */}
      <div className="filtros-categoria__grupo">
        <p className="filtros-categoria__etiqueta-grupo" id={idGrupo1}>
          {filtro1?.etiqueta ?? 'Filtrar por'}
        </p>
        <div className="filtros-categoria__lista" role="group" aria-labelledby={idGrupo1}>
          <button
            type="button"
            className={claseOpcion(refinamiento === null)}
            aria-pressed={refinamiento === null}
            onClick={() => cambiarRefinamiento(null)}
          >
            <span className="filtros-categoria__check" aria-hidden="true" />
            <span className="filtros-categoria__texto">{etiquetaTodos}</span>
          </button>

          {opciones1.map((op) => {
            const activa = op.id === refinamiento;
            return (
              <button
                key={op.id}
                type="button"
                className={claseOpcion(activa)}
                aria-pressed={activa}
                onClick={() => cambiarRefinamiento(op.id)}
              >
                <span className="filtros-categoria__check" aria-hidden="true" />
                <span className="filtros-categoria__texto">{op.etiqueta}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----- Filtro 2: ordenar por (no recorta) ----- */}
      {filtro2 && opciones2.length > 0 && (
        <div className="filtros-categoria__grupo filtros-categoria__grupo--orden">
          <label className="filtros-categoria__etiqueta-grupo" htmlFor={idOrden}>
            {filtro2.etiqueta ?? 'Ordenar por'}
          </label>
          <select
            id={idOrden}
            className="filtros-categoria__select"
            value={orden ?? ''}
            onChange={(e) => cambiarOrden(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">{filtro2.etiquetaPorDefecto ?? 'Ordenar por'}</option>
            {opciones2.map((op) => (
              <option key={op.id} value={op.id}>
                {op.etiqueta}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Región viva: anuncia a lectores de pantalla cuántos resultados hay. */}
      <p className="filtros-categoria__resultado" role="status" aria-live="polite">
        {total === 1 ? '1 resultado' : `${total} resultados`}
      </p>

      {children(elementosFiltrados)}
    </section>
  );
}

function claseOpcion(activa) {
  const base = 'filtros-categoria__opcion';
  return activa ? `${base} ${base}--activa` : base;
}

function esOpcionFiltro1Valida(o) {
  return (
    !!o &&
    typeof o === 'object' &&
    typeof o.id === 'string' &&
    o.id.length > 0 &&
    typeof o.etiqueta === 'string' &&
    typeof o.predicado === 'function'
  );
}

function esOpcionFiltro2Valida(o) {
  return (
    !!o &&
    typeof o === 'object' &&
    typeof o.id === 'string' &&
    o.id.length > 0 &&
    typeof o.etiqueta === 'string' &&
    typeof o.comparador === 'function'
  );
}