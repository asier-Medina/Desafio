import { useNavigate } from "react-router";
import { useAuth } from "@features/auth/context/AuthContext";
import { useLanguage } from "@shared/context/LanguageContext";
import Button from "@ui/Button";
import { Card } from "@components/Cards";
import {
  FaRegUser,
  FaArrowRightFromBracket,
  FaArrowRight,
  FaGear,
  FaCircleQuestion,
  FaFileLines,
  FaPen,
  FaUsers,
  FaStore,
} from "@ui/icons";
import "./Profile.css";

const fallbackUser = {
  name: "Invitado",
  email: "invitado@sustrai.eus",
  createdAt: new Date().toISOString(),
};

export default function Profile() {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const tp = t.profile;

  const profile = user || fallbackUser;
  const initial = (profile.name || "?").charAt(0).toUpperCase();

  const menuItems = [
    { id: "mi-cuenta",     label: tp.menuAccount,   icon: FaRegUser,               path: "/profile/account" },
    { id: "configuracion", label: tp.menuSettings,   icon: FaGear,                  path: null },
    { id: "soporte",       label: tp.menuSupport,    icon: FaCircleQuestion,         path: null },
    { id: "legal",         label: tp.menuLegal,      icon: FaFileLines,              path: null },
    { id: "cerrar-sesion", label: tp.menuLogout,     icon: FaArrowRightFromBracket, isLogout: true },
  ];

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="profile">

      <h1 className="profile__title">{tp.title}</h1>

      <Card display="auth" data={{}} className="profile__card">
        <div className="profile__user">
          <div className="profile__avatar" aria-hidden="true">{initial}</div>
          <div className="profile__user-info">
            <p className="profile__user-name">{profile.name}</p>
            <p className="profile__user-location">{tp.location}</p>
          </div>
          <div className="profile__user-actions">
            {user && (
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile/account")}>
                <FaPen /> {tp.edit}
              </Button>
            )}
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
            <p className="profile__business-title">{tp.businessCta}</p>
          </div>
          <FaArrowRight className="profile__business-arrow" aria-hidden="true" />
        </button>
      </Card>

      <nav className="profile__menu" aria-label={tp.title}>
        {menuItems.map(({ id, label, icon: Icon, path, isLogout }) => (
          <button
            key={id}
            className="profile__menu-item"
            type="button"
            onClick={() => {
              if (isLogout) handleLogout();
              else if (path) navigate(path);
            }}
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

      {user?.role === "admin" && (
        <section className="profile__admin">
          <h2 className="profile__admin-title">{tp.adminTitle}</h2>
          <div className="profile__admin-banners">
            <button className="profile__admin-banner" onClick={() => navigate("/admin/usuarios")}>
              <FaUsers className="profile__admin-banner-icon" />
              <div className="profile__admin-banner-text">
                <p className="profile__admin-banner-label">{tp.adminUsers}</p>
                <p className="profile__admin-banner-desc">{tp.adminUsersDesc}</p>
              </div>
              <FaArrowRight className="profile__admin-banner-arrow" />
            </button>
            <button className="profile__admin-banner" onClick={() => navigate("/admin/comercios")}>
              <FaStore className="profile__admin-banner-icon" />
              <div className="profile__admin-banner-text">
                <p className="profile__admin-banner-label">{tp.adminBusinesses}</p>
                <p className="profile__admin-banner-desc">{tp.adminBusinessesDesc}</p>
              </div>
              <FaArrowRight className="profile__admin-banner-arrow" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
