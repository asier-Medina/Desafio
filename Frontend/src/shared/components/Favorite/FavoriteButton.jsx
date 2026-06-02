import { FaHeart, FaRegHeart } from "../../ui/icons";
import "./FavoriteButton.css";

export default function FavoriteButton({ isFavorited = false, onToggle, className = "" }) {
  return (
    <button
      className={`favorite-btn ${className} ${isFavorited ? "favorite-btn--active" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      aria-label={isFavorited ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {isFavorited ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
}
