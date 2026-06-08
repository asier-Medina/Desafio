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
import * as gastronomyApi from '@services/gastronomy.api';
import './Gastronomy.css';

const PATRIMONIO_TIPOS = ['Patrimonio', 'Patrimonio Cultural', 'Monumento', 'Casco Histórico'];

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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const filterKey = searchParams.get('filter');
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const tg = t.gastronomyPage;

  const isAuth = !authLoading && Boolean(user);
  const limits = useResponsiveLimit(isAuth);

  function toggleFavorite(item) {
    if (!user) { navigate('/favoritos'); return; }
    if (isFavorite(item.id, 'gastronomy')) {
      removeFavorite(item.id, 'gastronomy');
    } else {
      addFavorite({ ...item, _variant: 'gastronomy' });
    }
  }

  const categories = useMemo(() => [
    {
      id: 'todos',
      title: tg.categories.todos,
      predicate: () => true,
      baseFilter: null,
      fetch: gastronomyApi.list,
    },
    {
      id: 'mejor-valorados',
      title: tg.categories.mejorValorados,
      predicate: (g) => g.valoracion != null,
      baseFilter: { label: tg.categoryLabels.mejorValorados },
      fetch: gastronomyApi.getMejorValorados,
    },
    {
      id: 'michelin-repsol',
      title: tg.categories.michelinRepsol,
      predicate: (g) => g.cualificaciones?.length > 0 || g.calidad === true,
      baseFilter: { label: tg.categoryLabels.michelinRepsol },
      fetch: gastronomyApi.getMichelinRepsol,
    },
    {
      id: 'entorno-especial',
      title: tg.categories.entornoEspecial,
      predicate: (g) => g.entorno != null,
      baseFilter: { label: tg.categoryLabels.entornoEspecial },
      fetch: gastronomyApi.getEntornoEspecial,
    },
    {
      id: 'cerca-de-ti',
      title: tg.categories.cercaDeTi,
      predicate: (g) => g.municipality_id === (user?.municipality_id ?? 48020),
      baseFilter: { label: tg.categoryLabels.cercaDeTi },
      fetch: () => gastronomyApi.getCercaDeTi(user?.municipality_id || 48020),
    },
  ], [tg, user?.municipality_id]);

  const filter1 = useMemo(() => ({
    label: tg.filter1.label,
    allLabel: tg.filter1.allLabel,
    options: [
      { id: 'restaurante', label: tg.filter1.restaurante, predicate: (g) => g.type === 'Restaurante' },
      { id: 'bar',         label: tg.filter1.bar,         predicate: (g) => g.type === 'Bar' },
      { id: 'sidreria',    label: tg.filter1.sidreria,    predicate: (g) => g.type === 'Sidrería' },
      { id: 'bodega',      label: tg.filter1.bodega,      predicate: (g) => g.type === 'Bodega' },
      { id: 'asador',      label: tg.filter1.asador,      predicate: (g) => g.type === 'Asador' },
      { id: 'cafe',        label: tg.filter1.cafe,        predicate: (g) => g.type === 'Café' },
    ],
  }), [tg]);

  const filter2 = useMemo(() => ({
    label: tg.filter2.label,
    defaultLabel: tg.filter2.defaultLabel,
    options: [
      {
        id: 'mejor-valorados',
        label: tg.filter2.mejorValorados,
        comparator: (a, b) => (b.valoracion ?? 0) - (a.valoracion ?? 0),
      },
    ],
  }), [tg]);

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

  if (filterKey) {
    if (!category) return <Navigate to="/gastronomy" replace />;

    return (
      <div className="gastronomy container">
        {loading ? (
          <p className="gastronomy__empty">{t.loading}</p>
        ) : (
          <CategoryFilters
            title={tg.title}
            baseFilter={category.baseFilter}
            items={items}
            filter1={filter1}
            filter2={filter2}
            onReset={() => navigate('/gastronomy')}
          >
            {(filteredItems) =>
              filteredItems.length === 0 ? (
                <p className="gastronomy__empty">{tg.noResults}</p>
              ) : (
                <PaginatedGrid
                  items={filteredItems}
                  limit={limits.detail}
                  emptyMessage={tg.noResults}
                  renderItem={(lugar) => (
                    <Card
                      variant="gastronomy"
                      data={lugar}
                      onAction={() => navigate(`/gastronomy/${lugar.id}`)}
                      onToggleFavorite={() => toggleFavorite(lugar)}
                      isFavorite={isFavorite(lugar.id, 'gastronomy')}
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
      <div className="gastronomy container">
        <motion.h1
          className="gastronomy__title"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {tg.title}
        </motion.h1>
        {loading ? (
          <p className="gastronomy__empty">{t.loading}</p>
        ) : (
          categories.map((cat, i) => {
            const catItems = items.filter(cat.predicate);
            const seeAllTo = authResolved
              ? isAuth ? `/gastronomy?filter=${cat.id}` : '/login'
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
                      variant="gastronomy"
                      data={data}
                      onAction={() => navigate(`/gastronomy/${data.id}`)}
                      onToggleFavorite={() => toggleFavorite(data)}
                      isFavorite={isFavorite(data.id, 'gastronomy')}
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
