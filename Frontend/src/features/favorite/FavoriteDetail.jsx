import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import { useFavorites } from "@shared/context/FavoritesContext";
import { FaRegHeart } from "@ui/icons";
import "./Favorite.css";

const GROUPS = [
  { variant: "gastronomy", key: "gastronomía", path: "/gastronomy" },
  { variant: "culture",    key: "cultura",     path: "/culture"    },
  { variant: "event",      key: "eventos",     path: "/events"     },
];

export default function FavoriteDetail() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  function handleAction(data) {
    const base = data._variant === "event"
      ? "events"
      : data._variant === "gastronomy"
        ? "gastronomy"
        : "culture";
    navigate(`/${base}/${data.id}`);
  }

  const groups = GROUPS.map(({ variant, key, path }) => ({
    title: key,
    path,
    variant,
    items: favorites.filter((f) => f._variant === variant),
  })).filter((g) => g.items.length > 0);

  if (favorites.length === 0) {
    return (
      <div className="favorites-detail">
        <p className="favorites-detail__empty">
          <FaRegHeart className="favorites-detail__empty-icon" aria-hidden="true" />
          No tienes favoritos aún.
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-detail">
      {groups.map(({ title, items, variant }) => (
        <div key={variant} className="favorites-detail__group">
          <h3 className="favorites-detail__group-title">{title}</h3>
          <div className="favorites-detail__list">
            {items.map((item) => (
              <Card
                key={`${item._variant}-${item.id}`}
                variant={variant}
                data={item}
                lang="es"
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(item.id, item._variant)}
                onAction={handleAction}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
