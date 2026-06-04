import { useMemo } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@features/auth/context/AuthContext';
import CategorySection from '@shared/components/Section/CategorySection';
import CategoryFilters from '@shared/components/Filters/CategoryFilters';
import Card from '@shared/components/Cards/Card';
import '@/pages/events/Events.css';

// ---------------------------------------------------------------------------
// Helpers de fecha
// ---------------------------------------------------------------------------

function isThisWeek(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0 = domingo
  const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + daysToSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= today && date <= endOfWeek;
}

function isWeekend(dateStr) {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 5 || day === 6; // dom, vie, sáb
}

// ---------------------------------------------------------------------------
// Categorías base — Nivel 1
// municipioId: municipality_id del usuario autenticado (1 = Bilbao por defecto)
// ---------------------------------------------------------------------------

function buildCategories(municipioId) {
  return [
    {
      id: 'todos',
      title: 'Todos los eventos',
      predicate: () => true,
      baseFilter: null,
    },
    {
      id: 'esta-semana',
      title: 'Esta semana',
      predicate: (e) => isThisWeek(e.start_date),
      baseFilter: { label: 'de esta semana' },
    },
    {
      id: 'fin-de-semana',
      title: 'Fin de semana',
      predicate: (e) => isWeekend(e.start_date),
      baseFilter: { label: 'del fin de semana' },
    },
    {
      id: 'cerca-de-ti',
      title: 'Cerca de ti',
      predicate: (e) => e.municipality_id === municipioId,
      baseFilter: { label: 'cerca de ti' },
    },
    {
      id: 'en-euskera',
      title: 'En euskera',
      predicate: (e) => e.language === 'EU',
      baseFilter: { label: 'en euskera' },
    },
  ];
}

// ---------------------------------------------------------------------------
// Filtros del Nivel 2
// ---------------------------------------------------------------------------

const FILTER1 = {
  label: 'Categorías',
  allLabel: 'Todas',
  options: [
    { id: 'concierto',   label: 'Concierto',            predicate: (e) => e.type === 'Concierto' },
    { id: 'festival',    label: 'Festival',             predicate: (e) => e.type === 'Festival' },
    { id: 'teatro',      label: 'Teatro',               predicate: (e) => e.type === 'Teatro' },
    { id: 'danza',       label: 'Danza',                predicate: (e) => e.type === 'Danza' },
    { id: 'bertso',      label: 'Bertsolarismo',        predicate: (e) => e.type === 'Bertsolarismo' },
    { id: 'exposicion',  label: 'Exposición',           predicate: (e) => e.type === 'Exposición' },
    { id: 'conferencia', label: 'Conferencia',          predicate: (e) => e.type === 'Conferencia' },
    { id: 'cine',        label: 'Cine',                 predicate: (e) => e.type === 'Cine' || e.type === 'Cine y audiovisuales' },
    { id: 'feria',       label: 'Feria',                predicate: (e) => e.type === 'Feria' },
  ],
};

const FILTER2 = {
  label: 'Ordenar por',
  defaultLabel: 'Sin ordenar',
  options: [
    {
      id: 'proximos',
      label: 'Próximos primero',
      comparator: (a, b) => new Date(a.start_date) - new Date(b.start_date),
    },
  ],
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Events() {
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const filterKey = searchParams.get('filter');

  const categories = useMemo(
    () => buildCategories(user?.municipality_id ?? 1),
    [user],
  );

  // ---- Nivel 2: listado de una categoría con filtros ---------------------
  if (filterKey) {
    const category = categories.find((c) => c.id === filterKey);

    // Clave desconocida → volver al nivel 1
    if (!category) return <Navigate to="/events" replace />;

    const baseItems = EVENTOS_DEMO.filter(category.predicate);

    return (
      <div className="events container">
        <CategoryFilters
          title="Eventos"
          baseFilter={category.baseFilter}
          items={baseItems}
          filter1={FILTER1}
          filter2={FILTER2}
          onReset={() => navigate('/events')}
        >
          {(filteredItems) =>
            filteredItems.length === 0 ? (
              <p className="events__empty">No hay eventos con los filtros seleccionados.</p>
            ) : (
              <ul className="events__grid">
                {filteredItems.map((evento) => (
                  <li key={evento.id} className="events__item">
                    <Card
                      variant="event"
                      data={evento}
                      lang="es"
                      onAction={() => navigate(`/events/${evento.id}`)}
                    />
                  </li>
                ))}
              </ul>
            )
          }
        </CategoryFilters>
      </div>
    );
  }

  // ---- Nivel 1: aterrizaje con 5 categorías prefiltradas ----------------
  const isAuth = !loading && Boolean(user);
  const authResolved = !loading;

  return (
    <div className="events container">
      <h1 className="events__title">Eventos</h1>
      {categories.map((cat) => {
        const items = EVENTOS_DEMO.filter(cat.predicate);
        // Mientras la sesión carga no mostramos el botón para evitar cambios bruscos
        const seeAllTo = authResolved
          ? isAuth
            ? `/events?filter=${cat.id}`
            : '/login'
          : undefined;
        const seeAllLabel = authResolved
          ? isAuth
            ? 'Ver todas'
            : 'Inicia sesión para ver más'
          : undefined;

        return (
          <CategorySection
            key={cat.id}
            title={cat.title}
            seeAllTo={seeAllTo}
            seeAllLabel={seeAllLabel}
            showArrow={isAuth}
            items={items}
            renderCard={(data) => (
              <Card
                variant="event"
                data={data}
                lang="es"
                onAction={() => navigate(`/events/${data.id}`)}
              />
            )}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Datos demo — sustituir por events.api.js
// ---------------------------------------------------------------------------

const EVENTOS_DEMO = [
  {
    id: 1,
    nombre: 'Concierto de Kalakan',
    type: 'Concierto',
    start_date: '2026-06-05T20:00:00Z',
    end_date: '2026-06-05T22:30:00Z',
    establishment: 'Teatro Arriaga',
    place: 'Bilbao',
    language: 'EU',
    municipality_id: 1,
    active: true,
  },
  {
    id: 2,
    nombre: 'Feria del libro',
    type: 'Feria',
    start_date: '2026-06-06T10:00:00Z',
    end_date: '2026-06-06T20:00:00Z',
    establishment: 'Plaza Nueva',
    place: 'Bilbao',
    language: 'ES',
    municipality_id: 1,
    active: true,
  },
  {
    id: 3,
    nombre: 'Bertso saioa',
    type: 'Bertsolarismo',
    start_date: '2026-06-06T18:00:00Z',
    end_date: '2026-06-06T22:00:00Z',
    establishment: 'Kafe Antzokia',
    place: 'Bilbao',
    language: 'EU',
    municipality_id: 1,
    active: true,
  },
  {
    id: 4,
    nombre: 'Exposición de fotografía contemporánea',
    type: 'Exposición',
    start_date: '2026-06-07T11:00:00Z',
    end_date: '2026-07-15T20:00:00Z',
    establishment: 'Azkuna Zentroa',
    place: 'Bilbao',
    language: 'ES',
    municipality_id: 1,
    active: true,
  },
  {
    id: 5,
    nombre: 'Danza contemporánea: Aterpe',
    type: 'Danza',
    start_date: '2026-06-07T19:30:00Z',
    end_date: '2026-06-07T21:00:00Z',
    establishment: 'Euskalduna',
    place: 'Bilbao',
    language: 'ES',
    municipality_id: 1,
    active: true,
  },
  {
    id: 6,
    nombre: 'Teatro: La casa de Bernarda Alba',
    type: 'Teatro',
    start_date: '2026-06-08T20:00:00Z',
    end_date: '2026-06-08T22:00:00Z',
    establishment: 'Teatro Campos',
    place: 'Bilbao',
    language: 'ES',
    municipality_id: 1,
    active: true,
  },
];
