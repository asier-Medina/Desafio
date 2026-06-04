import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";
import { useLanguage } from "@features/language/LanguageContext";
import * as gastronomyApi from "@services/gastronomy.api";

export default function Gastronomy() {
  const navigate = useNavigate();
  const { translate } = useLanguage();
  const { addFavorite, removeFavorite, isFavorite, user } = useFavorites();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gastronomyApi.list()
      .then(data => translate(data, ["nombre", "direccion", "tipo_comida"]).then(setRestaurants))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [translate]);

  function handleToggleFavorite(data) {
    if (isFavorite(data.id, "gastronomy")) {
      removeFavorite(data.id, "gastronomy");
    } else {
      addFavorite({ ...data, _variant: "gastronomy" });
    }
  }

  if (loading) return <div className="p-8">Cargando gastronomía...</div>;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Gastronomía</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((rest) => (
          <Card
            key={rest.id}
            variant="gastronomy"
            data={rest}
            isFavorite={isFavorite(rest.id, "gastronomy")}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
            onAction={(d) => navigate(`/gastronomy/${d.id}`)}
          />
        ))}
      </section>
    </div>
  );
}
