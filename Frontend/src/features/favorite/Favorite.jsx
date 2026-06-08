import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLanguage } from "@shared/context/LanguageContext";
import CategorySection from "@shared/components/Section/CategorySection";
import FooterCtas from "@shared/components/FooterCtas/FooterCtas";
import { FaRegHeart } from "@ui/icons";
import "./Favorite.css";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Favorite() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const { t } = useLanguage();
  const tf = t.favoritesPage;

  const GROUPS = [
    { variant: 'gastronomy', title: t.gastronomy, path: '/gastronomy' },
    { variant: 'culture',    title: t.culture,    path: '/culture'    },
    { variant: 'event',      title: t.events,     path: '/events'     },
  ];

  function handleAction(data) {
    const base = data._variant === 'event'
      ? 'events'
      : data._variant === 'gastronomy'
        ? 'gastronomy'
        : 'culture';
    navigate(`/${base}/${data.id}`);
  }

  const groups = GROUPS.map(({ variant, title, path }) => ({
    title,
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
          <h1 className="favorites__title">{tf.title}</h1>
          {favorites.length > 0 && (
            <p className="favorites__subtitle">{tf.subtitle(favorites.length)}</p>
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
            <h2 className="favorites__empty-title">{tf.emptyTitle}</h2>
            <p className="favorites__empty-text">{tf.emptyText}</p>
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
