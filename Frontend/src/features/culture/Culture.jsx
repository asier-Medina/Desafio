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
import * as cultureApi from '@services/culture.api';
import './Culture.css';

const PATRIMONIO_TIPOS = ['Patrimonio', 'Patrimonio Cultural', 'Monumento', 'Casco Histórico'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Culture() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const filterKey = searchParams.get('filter');
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const tc = t.culturePage;

  const isAuth = !authLoading && Boolean(user);
  const limits = useResponsiveLimit(isAuth);

  function toggleFavorite(item) {
    if (!user) { navigate('/favoritos'); return; }
    if (isFavorite(item.id, 'culture')) {
      removeFavorite(item.id, 'culture');
    } else {
      addFavorite({ ...item, _variant: 'culture' });
    }
  }

  const categories = useMemo(() => [
    {
      id: 'todos',
      title: tc.categories.todos,
      predicate: () => true,
      baseFilter: null,
      fetch: cultureApi.list,
    },
    {
      id: 'museos',
      title: tc.categories.museos,
      predicate: (c) => c.tipo_lugar?.toLowerCase().includes('museo'),
      baseFilter: { label: tc.categoryLabels.museos },
      fetch: cultureApi.getMuseos,
    },
    {
      id: 'patrimonio',
      title: tc.categories.patrimonio,
      predicate: (c) => PATRIMONIO_TIPOS.includes(c.tipo_lugar),
      baseFilter: { label: tc.categoryLabels.patrimonio },
      fetch: cultureApi.getPatrimonio,
    },
    {
      id: 'visita-guiada',
      title: tc.categories.visitaGuiada,
      predicate: (c) => c.visita_guiada === true,
      baseFilter: { label: tc.categoryLabels.visitaGuiada },
      fetch: cultureApi.getVisitaGuiada,
    },
    {
      id: 'cerca-de-ti',
      title: tc.categories.cercaDeTi,
      predicate: (c) => c.municipality_id === (user?.municipality_id ?? 1),
      baseFilter: { label: tc.categoryLabels.cercaDeTi },
      fetch: () => cultureApi.getCercaDeTi(user?.municipality_id ?? 1),
    },
  ], [tc, user?.municipality_id]);

  const filter1 = useMemo(() => ({
    label: tc.filter1.label,
    allLabel: tc.filter1.allLabel,
    options: [
      { id: 'museo',           label: tc.filter1.museo,          predicate: (c) => c.tipo_lugar?.toLowerCase().includes('museo') },
      { id: 'monumento',       label: tc.filter1.monumento,      predicate: (c) => c.tipo_lugar === 'Monumento' },
      { id: 'casco-historico', label: tc.filter1.cascoHistorico, predicate: (c) => c.tipo_lugar === 'Casco Histórico' },
      { id: 'patrimonio',      label: tc.filter1.patrimonio,     predicate: (c) => c.tipo_lugar?.includes('Patrimonio') },
      { id: 'teatro',          label: tc.filter1.teatro,         predicate: (c) => c.tipo_lugar === 'Teatro' },
      { id: 'parque-playa',    label: tc.filter1.parquePlaya,    predicate: (c) => c.tipo_lugar === 'Parque' || c.tipo_lugar === 'Playa' },
    ],
  }), [tc]);

  const filter2 = useMemo(() => ({
    label: tc.filter2.label,
    defaultLabel: tc.filter2.defaultLabel,
    options: [
      {
        id: 'mejor-valorados',
        label: tc.filter2.mejorValorados,
        comparator: (a, b) => (b.valoracion ?? 0) - (a.valoracion ?? 0),
      },
    ],
  }), [tc]);

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

  if (filterKey) {
    if (!category) return <Navigate to="/culture" replace />;

    return (
      <div className="culture container">
        {loading ? (
          <p className="culture__empty">{t.loading}</p>
        ) : (
          <CategoryFilters
            title={tc.title}
            baseFilter={category.baseFilter}
            items={items}
            filter1={filter1}
            filter2={filter2}
            onReset={() => navigate('/culture')}
          >
            {(filteredItems) =>
              filteredItems.length === 0 ? (
                <p className="culture__empty">{tc.noResults}</p>
              ) : (
                <PaginatedGrid
                  items={filteredItems}
                  limit={limits.detail}
                  emptyMessage={tc.noResults}
                  renderItem={(lugar) => (
                    <Card
                      variant="culture"
                      data={lugar}
                      onAction={() => navigate(`/culture/${lugar.id}`)}
                      onToggleFavorite={() => toggleFavorite(lugar)}
                      isFavorite={isFavorite(lugar.id, 'culture')}
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
      <div className="culture container">
        <motion.h1
          className="culture__title"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {tc.title}
        </motion.h1>
        {loading ? (
          <p className="culture__empty">{t.loading}</p>
        ) : (
          categories.map((cat, i) => {
            const catItems = items.filter(cat.predicate);
            const seeAllTo = authResolved
              ? isAuth ? `/culture?filter=${cat.id}` : '/login'
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
                      variant="culture"
                      data={data}
                      onAction={() => navigate(`/culture/${data.id}`)}
                      onToggleFavorite={() => toggleFavorite(data)}
                      isFavorite={isFavorite(data.id, 'culture')}
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
