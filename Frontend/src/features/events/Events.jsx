import { useMemo, useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@features/auth/context/AuthContext';
import { useResponsiveLimit } from '@hooks/useResponsiveLimit';
import { useLang } from '@shared/context/LangContext';
import { useFavorites } from '@shared/context/FavoritesContext';
import CategorySection from '@shared/components/Section/CategorySection';
import CategoryFilters from '@shared/components/Filters/CategoryFilters';
import PaginatedGrid from '@shared/components/PaginatedGrid/PaginatedGrid';
import Card from '@shared/components/Cards/Card';
import FooterCtas from '@shared/components/FooterCtas/FooterCtas';
import * as eventsApi from '@services/events.api';
import './Events.css';

// ---------------------------------------------------------------------------
// Helpers de fecha para filtrado local en nivel 1
// ---------------------------------------------------------------------------

function isThisWeek(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysToSunday = today.getDay() === 0 ? 0 : 7 - today.getDay();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + daysToSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= today && date <= endOfWeek;
}

function isWeekend(dateStr) {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 5 || day === 6;
}

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------

function buildCategories(municipioId) {
  return [
    {
      id: 'todos',
      title: 'Todos los eventos',
      predicate: () => true,
      baseFilter: null,
      fetch: eventsApi.list,
    },
    {
      id: 'esta-semana',
      title: 'Esta semana',
      predicate: (e) => isThisWeek(e.start_date),
      baseFilter: { label: 'de esta semana' },
      fetch: eventsApi.getEstaSemana,
    },
    {
      id: 'fin-de-semana',
      title: 'Fin de semana',
      predicate: (e) => isWeekend(e.start_date),
      baseFilter: { label: 'del fin de semana' },
      fetch: eventsApi.getFinDeSemana,
    },
    {
      id: 'cerca-de-ti',
      title: 'Cerca de ti',
      predicate: (e) => e.municipality_id === municipioId,
      baseFilter: { label: 'cerca de ti' },
      fetch: () => eventsApi.getCercaDeTi(municipioId),
    },
    {
      id: 'en-euskera',
      title: 'En euskera',
      predicate: (e) => e.language?.toLowerCase().startsWith('eu'),
      baseFilter: { label: 'en euskera' },
      fetch: eventsApi.getEnEuskera,
    },
  ];
}

// ---------------------------------------------------------------------------
// Filtros del nivel 2
// ---------------------------------------------------------------------------

const FILTER1 = {
  label: 'Categorías',
  allLabel: 'Todas',
  options: [
    { id: 'concierto',   label: 'Concierto',     predicate: (e) => e.type === 'Concierto' },
    { id: 'festival',    label: 'Festival',      predicate: (e) => e.type === 'Festival' },
    { id: 'teatro',      label: 'Teatro',        predicate: (e) => e.type === 'Teatro' },
    { id: 'danza',       label: 'Danza',         predicate: (e) => e.type === 'Danza' },
    { id: 'bertso',      label: 'Bertsolarismo', predicate: (e) => e.type === 'Bertsolarismo' },
    { id: 'exposicion',  label: 'Exposición',    predicate: (e) => e.type === 'Exposición' },
    { id: 'conferencia', label: 'Conferencia',   predicate: (e) => e.type === 'Conferencia' },
    { id: 'feria',       label: 'Feria',         predicate: (e) => e.type === 'Feria' },
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Events() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const filterKey = searchParams.get('filter');
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const isAuth = !authLoading && Boolean(user);
  const limits = useResponsiveLimit(isAuth);

  function toggleFavorite(item) {
    if (!user) { navigate('/favoritos'); return; }
    if (isFavorite(item.id, 'event')) {
      removeFavorite(item.id, 'event');
    } else {
      addFavorite({ ...item, _variant: 'event' });
    }
  }

  const categories = useMemo(
    () => buildCategories(user?.municipality_id ?? 1),
    [user],
  );

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = filterKey ? categories.find((c) => c.id === filterKey) : null;

  useEffect(() => {
    setLoading(true);
    setItems([]);
    const fetcher = category ? category.fetch() : eventsApi.list();
    fetcher
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterKey, category?.id]);

  // ---- Nivel 2: listado con filtros y paginación -------------------------
  if (filterKey) {
    if (!category) return <Navigate to="/events" replace />;

    return (
      <div className="events container">
        {loading ? (
          <p className="events__empty">Cargando...</p>
        ) : (
          <CategoryFilters
            title="Eventos"
            baseFilter={category.baseFilter}
            items={items}
            filter1={FILTER1}
            filter2={FILTER2}
            onReset={() => navigate('/events')}
          >
            {(filteredItems) =>
              filteredItems.length === 0 ? (
                <p className="events__empty">No hay eventos con los filtros seleccionados.</p>
              ) : (
                <PaginatedGrid
                  items={filteredItems}
                  limit={limits.detail}
                  emptyMessage="No hay eventos con los filtros seleccionados."
                  renderItem={(evento) => (
                    <Card
                      variant="event"
                      data={evento}
                      lang="es"
                      onAction={() => navigate(`/events/${evento.id}`)}
                      onToggleFavorite={() => toggleFavorite(evento)}
                      isFavorite={isFavorite(evento.id, 'event')}
                    />
                  )}
                />
              )
            }
          </CategoryFilters>
        )}
      </div>
    );
  }

  // ---- Nivel 1: overview con categorías prefiltradas --------------------
  const authResolved = !authLoading;

  return (
    <>
      <div className="events container">
        <motion.h1
          className="events__title"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {lang === 'eu' ? 'Gertakariak' : lang === 'en' ? 'Events' : 'Eventos'}
        </motion.h1>
        {loading ? (
          <p className="events__empty">
            {lang === 'eu' ? 'Kargatzen...' : lang === 'en' ? 'Loading...' : 'Cargando...'}
          </p>
        ) : (
          categories.map((cat, i) => {
            const catItems = items.filter(cat.predicate);
            const seeAllTo = authResolved
              ? isAuth ? `/events?filter=${cat.id}` : '/login'
              : undefined;
            const seeAllLabel = authResolved
              ? isAuth ? (lang === 'eu' ? 'Guztiak ikusi' : lang === 'en' ? 'See all' : 'Ver todos') : (lang === 'eu' ? 'Gehiago ikusteko hasi saioa' : lang === 'en' ? 'Sign in to see more' : 'Inicia sesión para ver más')
              : undefined;

            return (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i * 0.1}
              >
                <CategorySection
                  title={cat.title}
                  seeAllTo={seeAllTo}
                  seeAllLabel={seeAllLabel}
                  showArrow={isAuth}
                  items={catItems}
                  max={limits.preview}
                  renderCard={(data) => (
                    <Card
                      variant="event"
                      data={data}
                      lang={lang}
                      onAction={() => navigate(`/events/${data.id}`)}
                      onToggleFavorite={() => toggleFavorite(data)}
                      isFavorite={isFavorite(data.id, 'event')}
                    />
                  )}
                />
              </motion.div>
            );
          })
        )}
      </div>
      <FooterCtas />
    </>
  );
}
