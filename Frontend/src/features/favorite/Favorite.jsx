import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLang } from "@shared/context/LangContext";
import CategorySection from "@shared/components/Section/CategorySection";
import FooterCtas from "@shared/components/FooterCtas/FooterCtas";
import { FaRegHeart } from "@ui/icons";
import "./Favorite.css";

const LABELS = {
  es: {
    title: 'Favoritos',
    subtitle: (n) => n === 1 ? '1 elemento guardado' : `${n} elementos guardados`,
    empty_title: 'Nada guardado todavía',
    empty_text: 'Explora gastronomía, cultura y eventos, y guarda lo que más te guste.',
    gastronomy: 'Gastronomía',
    culture: 'Cultura',
    events: 'Eventos',
  },
  eu: {
    title: 'Gogokoak',
    subtitle: (n) => n === 1 ? '1 elementu gordeta' : `${n} elementu gordeta`,
    empty_title: 'Oraindik ezer ez gordeta',
    empty_text: 'Esploratu gastronomia, kultura eta gertakariak, eta gorde gehien gustatzen zaizuna.',
    gastronomy: 'Gastronomia',
    culture: 'Kultura',
    events: 'Gertakariak',
  },
  en: {
    title: 'Favourites',
    subtitle: (n) => n === 1 ? '1 item saved' : `${n} items saved`,
    empty_title: 'Nothing saved yet',
    empty_text: 'Explore gastronomy, culture and events, and save what you love most.',
    gastronomy: 'Gastronomy',
    culture: 'Culture',
    events: 'Events',
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const GROUPS = [
  { variant: 'gastronomy', key: 'gastronomy', path: '/gastronomy' },
  { variant: 'culture',    key: 'culture',    path: '/culture'    },
  { variant: 'event',      key: 'events',     path: '/events'     },
];

export default function Favorite() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const { lang } = useLang();
  const t = LABELS[lang] ?? LABELS.es;

  function handleAction(data) {
    const base = data._variant === 'event'
      ? 'events'
      : data._variant === 'gastronomy'
        ? 'gastronomy'
        : 'culture';
    navigate(`/${base}/${data.id}`);
  }

  const groups = GROUPS.map(({ variant, key, path }) => ({
    title: t[key],
    path,
    variant,
    items: favorites.filter((f) => f._variant === variant),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <div className="favorites container">

        <motion.div
          className="favorites__header"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <h1 className="favorites__title">{t.title}</h1>
          {favorites.length > 0 && (
            <p className="favorites__subtitle">{t.subtitle(favorites.length)}</p>
          )}
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            className="favorites__empty"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <FaRegHeart className="favorites__empty-icon" aria-hidden="true" />
            <h2 className="favorites__empty-title">{t.empty_title}</h2>
            <p className="favorites__empty-text">{t.empty_text}</p>
          </motion.div>
        ) : (
          groups.map(({ title, path, variant, items }, i) => (
            <motion.div
              key={variant}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              custom={i * 0.12}
            >
              <CategorySection
                title={title}
                items={items}
                renderCard={(data) => (
                  <Card
                    variant={variant}
                    data={data}
                    lang={lang}
                    isFavorite={true}
                    onToggleFavorite={() => removeFavorite(data.id, data._variant)}
                    onAction={handleAction}
                  />
                )}
              />
            </motion.div>
          ))
        )}

      </div>
      <FooterCtas />
    </>
  );
}
