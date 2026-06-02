import { useEffect, useRef, useState, useId } from "react";
import { FaRegUser, FaSliders, FaChevronDown } from "../../ui/icons";
import "./Header.css";

const LABELS = {
  es: {
    appBar: "Cabecera principal",
    home: "Ir al inicio",
    login: "Iniciar sesión",
    register: "Crear cuenta",
    filters: "Filtros",
    openFilters: "Abrir filtros",
    userMenu: "Abrir menú de usuario",
    profile: "Mi perfil",
    favorites: "Mis favoritos",
    settings: "Ajustes",
    adminPanel: "Panel de administración",
    logout: "Cerrar sesión",
    roleAdmin: "Administrador",
    roleUser: "Usuario",
    avatarAlt: (name) => `Avatar de ${name}`,
  },
  eu: {
    appBar: "Goiburu nagusia",
    home: "Hasierara joan",
    login: "Saioa hasi",
    register: "Kontua sortu",
    filters: "Iragazkiak",
    openFilters: "Iragazkiak ireki",
    userMenu: "Erabiltzailearen menua ireki",
    profile: "Nire profila",
    favorites: "Nire gogokoak",
    settings: "Ezarpenak",
    adminPanel: "Administrazio panela",
    logout: "Saioa itxi",
    roleAdmin: "Administratzailea",
    roleUser: "Erabiltzailea",
    avatarAlt: (name) => `${name}(r)en avatarra`,
  },
};

function getInitial(name) {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export default function Header({
  user = null,
  onLogin = () => {},
  onRegister = () => {},
  onLogout = () => {},
  onNavigate = () => {},
  showFilters = false,
  onToggleFilters = () => {},
  lang = "es",
  logoSrc = "",
  appName = "Bilbao Insider",
}) {
  const t = LABELS[lang] ?? LABELS.es;
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Cerrar con Escape y devolver el foco al disparador
  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  function handleMenuAction(action) {
    setMenuOpen(false);
    action();
  }

  return (
    <header aria-label={t.appBar} className="header">
      <div className="header__inner">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("/")}
          aria-label={t.home}
          className="header__logo-btn"
        >
          {logoSrc ? (
            <img src={logoSrc} alt={appName} className="header__logo-img" />
          ) : (
            <span className="header__logo-placeholder">LOGO</span>
          )}
        </button>

        {/* Acciones */}
        <div className="header__actions">
          {showFilters && (
            <button
              type="button"
              onClick={onToggleFilters}
              aria-label={t.openFilters}
              className="header__filters-btn"
            >
              <FaSliders className="header__icon" aria-hidden="true" />
              <span>{t.filters}</span>
            </button>
          )}

          {!isAuthenticated && (
            <button type="button" onClick={onLogin} className="header__login-btn">
              <FaRegUser className="header__icon" aria-hidden="true" />
              <span>{t.login}</span>
            </button>
          )}

          {isAuthenticated && (
            <div className="header__user">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                aria-label={t.userMenu}
                className="header__user-trigger"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={t.avatarAlt(user.name)}
                    className="header__avatar-img"
                  />
                ) : (
                  <span aria-hidden="true" className="header__avatar-initial">
                    {getInitial(user.name)}
                  </span>
                )}
                <FaChevronDown
                  className={`header__chevron${menuOpen ? " header__chevron--open" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  id={menuId}
                  role="menu"
                  aria-label={t.userMenu}
                  className="header__menu"
                >
                  <div className="header__menu-header">
                    <p className="header__menu-name">{user.name}</p>
                    {user.email && <p className="header__menu-email">{user.email}</p>}
                    <span className="header__menu-role">
                      {isAdmin ? t.roleAdmin : t.roleUser}
                    </span>
                  </div>

                  <ul className="header__menu-list">
                    <li>
                      <MenuItem onSelect={() => handleMenuAction(() => onNavigate("/perfil"))}>
                        {t.profile}
                      </MenuItem>
                    </li>
                    <li>
                      <MenuItem onSelect={() => handleMenuAction(() => onNavigate("/favoritos"))}>
                        {t.favorites}
                      </MenuItem>
                    </li>
                    <li>
                      <MenuItem onSelect={() => handleMenuAction(() => onNavigate("/ajustes"))}>
                        {t.settings}
                      </MenuItem>
                    </li>

                    {isAdmin && (
                      <li>
                        <MenuItem
                          onSelect={() => handleMenuAction(() => onNavigate("/admin"))}
                          highlight
                        >
                          {t.adminPanel}
                        </MenuItem>
                      </li>
                    )}

                    <li>
                      <MenuItem onSelect={() => handleMenuAction(onLogout)} danger>
                        {t.logout}
                      </MenuItem>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ children, onSelect, danger = false, highlight = false }) {
  const classes = ["header__menu-item"];
  if (danger) classes.push("header__menu-item--danger");
  if (highlight) classes.push("header__menu-item--highlight");

  return (
    <button type="button" role="menuitem" onClick={onSelect} className={classes.join(" ")}>
      {children}
    </button>
  );
}