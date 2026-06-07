import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLang } from "@shared/context/LangContext";
import FooterCtas from "@shared/components/FooterCtas/FooterCtas";

const LABELS = {
  es: { title: 'Favoritos', empty: 'Aún no tienes favoritos.' },
  eu: { title: 'Gogokoak',  empty: 'Oraindik ez duzu gogokorik.' },
  en: { title: 'Favourites', empty: "You don't have any favourites yet." },
};

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
  const { lang } = useLang();
  const t = LABELS[lang] ?? LABELS.es;

  function handleToggleFavorite(data) {
    removeFavorite(data.id, data._variant);
  }

  function handleAction(data) {
    const base = data._variant === "event" ? "events" : data._variant === "gastronomy" ? "gastronomy" : "culture";
    navigate(`/${base}/${data.id}`);
  }

  return (
    <>
      <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
        <motion.h1
          className="text-2xl font-semibold"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {t.title}
        </motion.h1>

        {favorites.length === 0 ? (
          <motion.p
            className="text-gray-500"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            {t.empty}
          </motion.p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item, i) => (
              <motion.div
                key={`${item._variant}-${item.id}`}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <Card
                  variant={item._variant}
                  data={item}
                  lang={lang}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  onAction={handleAction}
                />
              </motion.div>
            ))}
          </section>
        )}
      </div>
      <FooterCtas />
    </>
  );
}
