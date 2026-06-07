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
import * as gastronomyApi from '@services/gastronomy.api';
import './Gastronomy.css';

// ---------------------------------------------------------------------------
// Categorías
// ---------------------------------------------------------------------------

function buildCategories(municipioId) {
  return [
    {
      id: 'todos',
      title: 'Todos los restaurantes',
      predicate: () => true,
      baseFilter: null,
      fetch: gastronomyApi.list,
    },
    {
      id: 'mejor-valorados',
      title: 'Mejor valorados',
      predicate: (g) => g.valoracion != null,
      baseFilter: { label: 'mejor valorados' },
      fetch: gastronomyApi.getMejorValorados,
    },
    {
      id: 'michelin-repsol',
      title: 'Con distinción',
      predicate: (g) => g.calidad === true,
      baseFilter: { label: 'con distinción' },
      fetch: gastronomyApi.getMichelinRepsol,
    },
    {
      id: 'entorno-especial',
      title: 'Entorno especial',
      predicate: (g) => g.entorno != null,
      baseFilter: { label: 'de entorno especial' },
      fetch: gastronomyApi.getEntornoEspecial,
    },
    {
      id: 'cerca-de-ti',
      title: 'Cerca de ti',
      predicate: (g) => g.municipality_id === municipioId,
      baseFilter: { label: 'cerca de ti' },
      fetch: () => gastronomyApi.getCercaDeTi(municipioId),
    },
  ];
}

// ---------------------------------------------------------------------------
// Filtros del nivel 2
// ---------------------------------------------------------------------------

const FILTER1 = {
  label: 'Tipo',
  allLabel: 'Todos',
  options: [
    { id: 'restaurante', label: 'Restaurante', predicate: (g) => g.type === 'Restaurante' },
    { id: 'bar',         label: 'Bar',         predicate: (g) => g.type === 'Bar' },
    { id: 'sidreria',    label: 'Sidrería',    predicate: (g) => g.type === 'Sidrería' },
    { id: 'bodega',      label: 'Bodega',      predicate: (g) => g.type === 'Bodega' },
    { id: 'asador',      label: 'Asador',      predicate: (g) => g.type === 'Asador' },
    { id: 'cafe',        label: 'Café',        predicate: (g) => g.type === 'Café' },
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
// Componente principal
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Gastronomy() {
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

  const category = filterKey ? categories.find((g) => g.id === filterKey) : null;

  useEffect(() => {
    setLoading(true);
    setItems([]);
    const fetcher = category ? category.fetch() : gastronomyApi.list();
    fetcher
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterKey, category?.id]);

  // ---- Nivel 2: listado con filtros y paginación -------------------------
  if (filterKey) {
    if (!category) return <Navigate to="/gastronomy" replace />;

    return (
      <div className="gastronomy container">
        {loading ? (
          <p className="gastronomy__empty">Cargando...</p>
        ) : (
          <CategoryFilters
            title="Gastronomía"
            baseFilter={category.baseFilter}
            items={items}
            filter1={FILTER1}
            filter2={FILTER2}
            onReset={() => navigate('/gastronomy')}
          >
            {(filteredItems) =>
              filteredItems.length === 0 ? (
                <p className="gastronomy__empty">No hay resultados con los filtros seleccionados.</p>
              ) : (
                <PaginatedGrid
                  items={filteredItems}
                  limit={limits.detail}
                  emptyMessage="No hay resultados con los filtros seleccionados."
                  renderItem={(lugar) => (
                    <Card
                      variant="gastronomy"
                      data={lugar}
                      onAction={() => navigate(`/gastronomy/${lugar.id}`)}
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
      <div className="gastronomy container">
        <motion.h1
          className="gastronomy__title"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {lang === 'eu' ? 'Gastronomia' : lang === 'en' ? 'Gastronomy' : 'Gastronomía'}
        </motion.h1>
        {loading ? (
          <p className="gastronomy__empty">
            {lang === 'eu' ? 'Kargatzen...' : lang === 'en' ? 'Loading...' : 'Cargando...'}
          </p>
        ) : (
          categories.map((cat, i) => {
            const catItems = items.filter(cat.predicate);
            const seeAllTo = authResolved
              ? isAuth ? `/gastronomy?filter=${cat.id}` : '/login'
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
                      variant="gastronomy"
                      data={data}
                      lang={lang}
                      onAction={() => navigate(`/gastronomy/${data.id}`)}
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
