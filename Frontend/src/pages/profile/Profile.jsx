import { useNavigate } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import { useFavorites } from "@shared/context/FavoritesContext";
import Button from "@ui/Button";
import { Card } from "@components/Cards";
import { FaRegUser, FaArrowRightFromBracket, FaRegHeart } from "../../shared/ui/icons";
import "./Profile.css";

const fallbackUser = {
  name: "Invitado",
  lastName: "",
  email: "invitado@sustrai.eus",
  createdAt: new Date().toISOString(),
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { favorites, removeFavorite } = useFavorites();
  const profile = user || fallbackUser;

  const initials = `${profile.name?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase() || "?";

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="profile">
      <div className="profile__header">
        <div className="profile__avatar" aria-hidden="true">
          {initials || <FaRegUser />}
        </div>
        <div className="profile__info">
          <h1 className="profile__name">
            {profile.name} {profile.lastName}
          </h1>
          <p className="profile__email">{profile.email}</p>
          {profile.createdAt && (
            <p className="profile__joined">
              Miembro desde {new Date(profile.createdAt).toLocaleDateString("es", { year: "numeric", month: "long" })}
            </p>
          )}
        </div>
      </div>

      <div className="profile__actions">
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <FaArrowRightFromBracket /> Cerrar sesión
        </Button>
      </div>

      <section className="profile__section">
        <h2 className="profile__section-title">
          <FaRegHeart className="profile__section-icon" />
          Favoritos
        </h2>
        {favorites.length === 0 ? (
          <p className="profile__empty">No tienes favoritos aún.</p>
        ) : (
          <div className="profile__favorites">
            {favorites.map((item) => (
              <Card
                key={`${item._variant}-${item.id}`}
                variant={item._variant}
                data={item}
                isFavorite={true}
                onToggleFavorite={() => removeFavorite(item.id, item._variant)}
                onAction={() => navigate(`/${item._variant === "event" ? "events" : item._variant === "gastronomy" ? "gastronomy" : "culture"}/${item.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
