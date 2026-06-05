import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";
import * as cultureApi from "@services/culture.api";

export default function Culture() {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite, user } = useFavorites();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cultureApi.list()
      .then(setPlaces)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleToggleFavorite(data) {
    if (isFavorite(data.id, "culture")) {
      removeFavorite(data.id, "culture");
    } else {
      addFavorite({ ...data, _variant: "culture" });
    }
  }

  if (loading) return <div className="p-8">Cargando cultura...</div>;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Cultura</h1>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((place) => (
          <Card
            key={place.id}
            variant="culture"
            data={place}
            isFavorite={isFavorite(place.id, "culture")}
            onToggleFavorite={user ? handleToggleFavorite : undefined}
            onAction={(d) => navigate(`/culture/${d.id}`)}
          />
        ))}
      </section>
    </div>
  );
}
