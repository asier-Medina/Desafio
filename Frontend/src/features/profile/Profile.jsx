import { useAuth } from "@features/auth/context/AuthContext";
import { useNavigate } from "react-router";
import { Card } from "@components/Cards";
import {
  FaRegUser,
  FaArrowRightFromBracket,
  FaArrowRight,
  FaGear,
  FaCircleQuestion,
  FaFileLines,
} from "@ui/icons";
import "./Profile.css";

const menuItems = [
  { id: "mis-datos",     label: "Mis datos",                icon: FaRegUser,               path: "/profile/data" },
  { id: "configuracion", label: "Configuración de la cuenta", icon: FaGear,               path: "/profile/settings" },
  { id: "soporte",       label: "Contacta con soporte",     icon: FaCircleQuestion,         path: "/profile/support" },
  { id: "legal",         label: "Legal",                    icon: FaFileLines,              path: "/profile/legal" },
  { id: "cerrar-sesion", label: "Cierra sesión",            icon: FaArrowRightFromBracket, path: null,          isLogout: true },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profile = user || { name: "Invitado", lastName: "" };

  const initial = (profile.name || "?").charAt(0).toUpperCase();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="profile">
      <h1 className="profile__title">Perfil</h1>

      <Card display="auth" data={{}} className="profile__card">
        <div className="profile__user">
          <div className="profile__avatar" aria-hidden="true">
            {initial}
          </div>
          <div className="profile__user-info">
            <p className="profile__user-name">{profile.name}</p>
            <p className="profile__user-location">Bilbao, España</p>
          </div>
        </div>
      </Card>

      <Card display="auth" data={{}} className="profile__card">
        <button className="profile__business" type="button">
          <div className="profile__business-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="var(--brand-cream)" />
              <path d="M14 20h20v14H14z" fill="var(--brand-navy)" opacity="0.15" />
              <path d="M12 20h24l-3-5H15l-3 5z" fill="var(--brand-navy)" />
              <rect x="20" y="26" width="8" height="8" rx="1.5" fill="var(--neutral-white)" />
              <path d="M22 20v-3a2 2 0 014 0v3" stroke="var(--neutral-white)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="profile__business-text">
            <p className="profile__business-title">¿Eres un negocio?</p>
            <p className="profile__business-desc">Copy de negocio.</p>
          </div>
          <FaArrowRight className="profile__business-arrow" aria-hidden="true" />
        </button>
      </Card>

      <nav className="profile__menu" aria-label="Opciones del perfil">
        {menuItems.map(({ id, label, icon: Icon, path, isLogout }) => (
          <button
            key={id}
            className="profile__menu-item"
            type="button"
            onClick={() => (isLogout ? handleLogout() : navigate(path))}
          >
            <span className="profile__menu-icon-wrapper">
              <Icon className="profile__menu-icon" aria-hidden="true" />
            </span>
            <span className="profile__menu-label">{label}</span>
            {!isLogout && (
              <FaArrowRight className="profile__menu-chevron" aria-hidden="true" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
