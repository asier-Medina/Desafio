import { useMemo, useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@features/auth/context/AuthContext';
import { useResponsiveLimit } from '@hooks/useResponsiveLimit';
import { useLang } from '@shared/context/LangContext';
import CategorySection from '@shared/components/Section/CategorySection';
import CategoryFilters from '@shared/components/Filters/CategoryFilters';
import PaginatedGrid from '@shared/components/PaginatedGrid/PaginatedGrid';
import Card from '@shared/components/Cards/Card';
import FooterCtas from '@shared/components/FooterCtas/FooterCtas';
import * as cultureApi from '@services/culture.api';
import './Culture.css';

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------

const PATRIMONIO_TIPOS = ['Patrimonio', 'Patrimonio Cultural', 'Monumento', 'Casco Histórico'];

function buildCategories(municipioId) {
  return [
    {
      id: 'todos',
      title: 'Todos los lugares',
      predicate: () => true,
      baseFilter: null,
      fetch: cultureApi.list,
    },
    {
      id: 'museos',
      title: 'Museos',
      predicate: (c) => c.tipo_lugar?.toLowerCase().includes('museo'),
      baseFilter: { label: 'museos' },
      fetch: cultureApi.getMuseos,
    },
    {
      id: 'patrimonio',
      title: 'Patrimonio',
      predicate: (c) => PATRIMONIO_TIPOS.includes(c.tipo_lugar),
      baseFilter: { label: 'patrimonio' },
      fetch: cultureApi.getPatrimonio,
    },
    {
      id: 'visita-guiada',
      title: 'Con visita guiada',
      predicate: (c) => c.visita_guiada === true,
      baseFilter: { label: 'con visita guiada' },
      fetch: cultureApi.getVisitaGuiada,
    },
    {
      id: 'cerca-de-ti',
      title: 'Cerca de ti',
      predicate: (c) => c.municipality_id === municipioId,
      baseFilter: { label: 'cerca de ti' },
      fetch: () => cultureApi.getCercaDeTi(municipioId),
    },
  ];
}

// ---------------------------------------------------------------------------
// Filtros del nivel 2
// ---------------------------------------------------------------------------

const FILTER1 = {
  label: 'Tipo de lugar',
  allLabel: 'Todos',
  options: [
    { id: 'museo',          label: 'Museo',          predicate: (c) => c.tipo_lugar?.toLowerCase().includes('museo') },
    { id: 'monumento',      label: 'Monumento',      predicate: (c) => c.tipo_lugar === 'Monumento' },
    { id: 'casco-historico',label: 'Casco histórico',predicate: (c) => c.tipo_lugar === 'Casco Histórico' },
    { id: 'patrimonio',     label: 'Patrimonio',     predicate: (c) => c.tipo_lugar?.includes('Patrimonio') },
    { id: 'teatro',         label: 'Teatro',         predicate: (c) => c.tipo_lugar === 'Teatro' },
    { id: 'parque-playa',   label: 'Parque / Playa', predicate: (c) => c.tipo_lugar === 'Parque' || c.tipo_lugar === 'Playa' },
  ],
};

const FILTER2 = {
  label: 'Ordenar por',
  defaultLabel: 'Sin ordenar',
  options: [
    {
      id: 'mejor-valorados',
      label: 'Mejor valorados',
      comparator: (a, b) => (b.valoracion ?? 0) - (a.valoracion ?? 0),
    },
  ],
};

// ---------------------------------------------------------------------------
// Animación
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Culture() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const filterKey = searchParams.get('filter');

  const isAuth = !authLoading && Boolean(user);
  const limits = useResponsiveLimit(isAuth);

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
    const fetcher = category ? category.fetch() : cultureApi.list();
    fetcher
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterKey, category?.id]);

  // ---- Nivel 2: listado con filtros y paginación -------------------------
  if (filterKey) {
    if (!category) return <Navigate to="/culture" replace />;

    return (
      <div className="culture container">
        {loading ? (
          <p className="culture__empty">
            {lang === 'eu' ? 'Kargatzen...' : lang === 'en' ? 'Loading...' : 'Cargando...'}
          </p>
        ) : (
          <CategoryFilters
            title={lang === 'eu' ? 'Kultura' : lang === 'en' ? 'Culture' : 'Cultura'}
            baseFilter={category.baseFilter}
            items={items}
            filter1={FILTER1}
            filter2={FILTER2}
            onReset={() => navigate('/culture')}
          >
            {(filteredItems) =>
              filteredItems.length === 0 ? (
                <p className="culture__empty">
                  {lang === 'eu' ? 'Ez dago emaitzarik iragazkiekin.' : lang === 'en' ? 'No results with selected filters.' : 'No hay resultados con los filtros seleccionados.'}
                </p>
              ) : (
                <PaginatedGrid
                  items={filteredItems}
                  limit={limits.detail}
                  emptyMessage="No hay resultados con los filtros seleccionados."
                  renderItem={(lugar) => (
                    <Card
                      variant="culture"
                      data={lugar}
                      lang={lang}
                      onAction={() => navigate(`/culture/${lugar.id}`)}
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
      <div className="culture container">
        <motion.h1
          className="culture__title"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {lang === 'eu' ? 'Kultura' : lang === 'en' ? 'Culture' : 'Cultura'}
        </motion.h1>
        {loading ? (
          <p className="culture__empty">
            {lang === 'eu' ? 'Kargatzen...' : lang === 'en' ? 'Loading...' : 'Cargando...'}
          </p>
        ) : (
          categories.map((cat, i) => {
            const catItems = items.filter(cat.predicate);
            const seeAllTo = authResolved
              ? isAuth ? `/culture?filter=${cat.id}` : '/login'
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
                      variant="culture"
                      data={data}
                      lang={lang}
                      onAction={() => navigate(`/culture/${data.id}`)}
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
