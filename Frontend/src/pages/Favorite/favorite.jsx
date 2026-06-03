import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";

export default function Favorite() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  function handleToggleFavorite(data) {
    removeFavorite(data.id, data._variant);
  }

  function handleAction(data) {
    const base = data._variant === "event" ? "events" : data._variant === "gastronomy" ? "gastronomy" : "culture";
    navigate(`/${base}/${data.id}`);
  }

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Favoritos</h1>

      {favorites.length === 0 ? (
        <p className="text-gray-500">Aún no tienes favoritos.</p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item) => (
            <Card
              key={`${item._variant}-${item.id}`}
              variant={item._variant}
              data={item}
              isFavorite={true}
              onToggleFavorite={handleToggleFavorite}
              onAction={handleAction}
            />
          ))}
        </section>
      )}
    </div>
  );
}
