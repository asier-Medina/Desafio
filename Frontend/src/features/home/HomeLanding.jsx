import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@features/auth/context/AuthContext';
import { useLanguage } from '@shared/context/LanguageContext';
import { useResponsiveLimit } from '@hooks/useResponsiveLimit';
import { useFavorites } from '@shared/context/FavoritesContext';
import CategorySection from '@shared/components/Section/CategorySection';
import Card from '@shared/components/Cards/Card';
import Button from '@shared/ui/Button';
import FooterCtas from '@shared/components/FooterCtas/FooterCtas';
import * as eventsApi from '@services/events.api';
import * as gastronomyApi from '@services/gastronomy.api';
import * as cultureApi from '@services/culture.api';
import './Home.css';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomeLanding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { lang, t } = useLanguage();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const isAuth = !authLoading && Boolean(user);
  const limits = useResponsiveLimit(isAuth);

  function toggleFavorite(item, variant) {
    if (!user) { navigate('/favoritos'); return; }
    if (isFavorite(item.id, variant)) {
      removeFavorite(item.id, variant);
    } else {
      addFavorite({ ...item, _variant: variant });
    }
  }

  const [events, setEvents] = useState([]);
  const [gastronomy, setGastronomy] = useState([]);
  const [culture, setCulture] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([eventsApi.list(), gastronomyApi.list(), cultureApi.list()])
      .then(([ev, gas, cul]) => {
        setEvents(Array.isArray(ev) ? ev : []);
        setGastronomy(Array.isArray(gas) ? gas : []);
        setCulture(Array.isArray(cul) ? cul : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="homepage">

      <section className="homepage__hero" aria-label="Bienvenida">
        <div className="homepage__hero-inner container">
          <motion.h1
            className="homepage__hero-title"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            {t.home.heroTitle}{' '}
            <span className="homepage__hero-title-emphasis">{t.home.heroEmphasis}</span>
          </motion.h1>

          <motion.p
            className="homepage__hero-sub"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            {t.home.heroSub}
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <Button
              variant="soft"
              size="lg"
              className="homepage__hero-cta"
              onClick={() => navigate('/events')}
            >
              {t.home.heroCta}
            </Button>
          </motion.div>
        </div>
      </section>

      <div className="homepage__content container">
        {loading ? (
          <p className="homepage__loading">{t.loading}</p>
        ) : (
          <>
            {[
              { key: 'gastronomy', title: t.gastronomy, items: gastronomy, variant: 'gastronomy', path: '/gastronomy' },
              { key: 'culture',    title: t.culture,    items: culture,    variant: 'culture',    path: '/culture'    },
              { key: 'events',     title: t.events,     items: events,     variant: 'event',      path: '/events'     },
            ].map(({ key, title, items, variant, path }, sectionIdx) => (
              <motion.div
                key={key}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                custom={sectionIdx * 0.15}
              >
                <CategorySection
                  title={title}
                  seeAllTo={isAuth ? path : '/login'}
                  seeAllLabel={isAuth ? t.seeAll : t.loginPrompt}
                  showArrow={isAuth}
                  items={items}
                  max={limits.preview}
                  renderCard={(data) => (
                    <Card
                      variant={variant}
                      data={data}
                      onAction={() => navigate(`${path}/${data.id}`)}
                      onToggleFavorite={() => toggleFavorite(data, variant)}
                      isFavorite={isFavorite(data.id, variant)}
                    />
                  )}
                />
              </motion.div>
            ))}
          </>
        )}
      </div>

      <FooterCtas />
    </div>
  );
}
