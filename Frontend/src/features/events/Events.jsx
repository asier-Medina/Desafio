import { useMemo, useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@features/auth/context/AuthContext';
import { useLanguage } from '@shared/context/LanguageContext';
import { useResponsiveLimit } from '@hooks/useResponsiveLimit';
import { useFavorites } from '@shared/context/FavoritesContext';
import CategorySection from '@shared/components/Section/CategorySection';
import CategoryFilters from '@shared/components/Filters/CategoryFilters';
import PaginatedGrid from '@shared/components/PaginatedGrid/PaginatedGrid';
import Card from '@shared/components/Cards/Card';
import FooterCtas from '@shared/components/FooterCtas/FooterCtas';
import * as eventsApi from '@services/events.api';
import './Events.css';

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const filterKey = searchParams.get('filter');
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const te = t.eventsPage;

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

  const categories = useMemo(() => [
    {
      id: 'todos',
      title: te.categories.todos,
      predicate: () => true,
      baseFilter: null,
      fetch: eventsApi.list,
    },
    {
      id: 'esta-semana',
      title: te.categories.estaSemana,
      predicate: (e) => isThisWeek(e.start_date),
      baseFilter: { label: te.categoryLabels.estaSemana },
      fetch: eventsApi.getEstaSemana,
    },
    {
      id: 'fin-de-semana',
      title: te.categories.finDeSemana,
      predicate: (e) => isWeekend(e.start_date),
      baseFilter: { label: te.categoryLabels.finDeSemana },
      fetch: eventsApi.getFinDeSemana,
    },
    {
      id: 'cerca-de-ti',
      title: te.categories.cercaDeTi,
      predicate: (e) => e.municipality_id === (user?.municipality_id ?? 1),
      baseFilter: { label: te.categoryLabels.cercaDeTi },
      fetch: () => eventsApi.getCercaDeTi(user?.municipality_id ?? 1),
    },
    {
      id: 'en-euskera',
      title: te.categories.enEuskera,
      predicate: (e) => e.language?.toLowerCase().startsWith('eu'),
      baseFilter: { label: te.categoryLabels.enEuskera },
      fetch: eventsApi.getEnEuskera,
    },
  ], [te, user?.municipality_id]);

  const filter1 = useMemo(() => ({
    label: te.filter1.label,
    allLabel: te.filter1.allLabel,
    options: [
      { id: 'concierto',   label: te.filter1.concierto,   predicate: (e) => e.type === 'Concierto' },
      { id: 'festival',    label: te.filter1.festival,    predicate: (e) => e.type === 'Festival' },
      { id: 'teatro',      label: te.filter1.teatro,      predicate: (e) => e.type === 'Teatro' },
      { id: 'danza',       label: te.filter1.danza,       predicate: (e) => e.type === 'Danza' },
      { id: 'bertso',      label: te.filter1.bertso,      predicate: (e) => e.type === 'Bertsolarismo' },
      { id: 'exposicion',  label: te.filter1.exposicion,  predicate: (e) => e.type === 'Exposición' },
      { id: 'conferencia', label: te.filter1.conferencia, predicate: (e) => e.type === 'Conferencia' },
      { id: 'feria',       label: te.filter1.feria,       predicate: (e) => e.type === 'Feria' },
    ],
  }), [te]);

  const filter2 = useMemo(() => ({
    label: te.filter2.label,
    defaultLabel: te.filter2.defaultLabel,
    options: [
      {
        id: 'proximos',
        label: te.filter2.proximos,
        comparator: (a, b) => new Date(a.start_date) - new Date(b.start_date),
      },
    ],
  }), [te]);

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

  if (filterKey) {
    if (!category) return <Navigate to="/events" replace />;

    return (
      <div className="events container">
        {loading ? (
          <p className="events__empty">{t.loading}</p>
        ) : (
          <CategoryFilters
            title={te.title}
            baseFilter={category.baseFilter}
            items={items}
            filter1={filter1}
            filter2={filter2}
            onReset={() => navigate('/events')}
          >
            {(filteredItems) =>
              filteredItems.length === 0 ? (
                <p className="events__empty">{te.noResults}</p>
              ) : (
                <PaginatedGrid
                  items={filteredItems}
                  limit={limits.detail}
                  emptyMessage={te.noResults}
                  renderItem={(evento) => (
                    <Card
                      variant="event"
                      data={evento}
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
          {te.title}
        </motion.h1>
        {loading ? (
          <p className="events__empty">{t.loading}</p>
        ) : (
          categories.map((cat, i) => {
            const catItems = items.filter(cat.predicate);
            const seeAllTo = authResolved
              ? isAuth ? `/events?filter=${cat.id}` : '/login'
              : undefined;
            const seeAllLabel = authResolved
              ? isAuth ? t.seeAll : t.loginPrompt
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
