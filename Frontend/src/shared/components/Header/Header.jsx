import { useEffect, useRef, useState, useId } from "react";
import { FaRegUser, FaSliders, FaChevronDown } from "@ui/icons";
import { useLanguage } from "@shared/context/LanguageContext";
import HeaderNav from "./HeaderNav";
import "./Header.css";
import logoSvg from "@assets/images/logofinal.svg";

const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "eu", label: "EU" },
  { code: "en", label: "EN" },
];

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
  currentPath = "",
  showFilters = false,
  onToggleFilters = () => {},
  logoSrc = logoSvg,
  homePath = "/",
}) {
  const { lang, setLang, t } = useLanguage();
  const labels = t.header;
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const langRef = useRef(null);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();
  const langId = useId();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!langOpen) return;
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

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

  useEffect(() => {
    if (!langOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") {
        setLangOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [langOpen]);

  function handleMenuAction(action) {
    setMenuOpen(false);
    action();
  }

  function handleLogoClick(e) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(homePath);
  }

  function handleLangSelect(code) {
    if (code !== lang) setLang(code);
    setLangOpen(false);
  }

  function currentLangLabel() {
    return LANGUAGES.find((l) => l.code === lang)?.label ?? "ES";
  }

  return (
    <header
      aria-label={labels.appBar}
      className={`header${scrolled ? " header--scrolled" : ""}`}
    >
      <div className="header__inner">
        <h1 className="header__logo-title">
          <a
            href={homePath}
            onClick={handleLogoClick}
            aria-label={labels.home}
            className="header__logo-link"
          >
            <img src={logoSrc} alt="" className="header__logo-img" />
          </a>
        </h1>

        <HeaderNav onNavigate={onNavigate} currentPath={currentPath} />

        <div className="header__actions">
          {showFilters && (
            <button
              type="button"
              onClick={onToggleFilters}
              aria-label={labels.openFilters}
              className="header__filters-btn header__desktop-only"
            >
              <FaSliders className="header__icon" aria-hidden="true" />
              <span className="header__desktop-only">{labels.filters}</span>
            </button>
          )}

          <div ref={langRef} className="header__lang">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={labels.langSelector}
              className="header__lang-trigger"
            >
              <span className="header__lang-current">{currentLangLabel()}</span>
              <FaChevronDown
                className={`header__chevron${langOpen ? " header__chevron--open" : ""}`}
                aria-hidden="true"
              />
            </button>
            {langOpen && (
              <ul
                role="listbox"
                aria-label={labels.lang}
                id={langId}
                className="header__lang-menu"
              >
                {LANGUAGES.map((l) => (
                  <li
                    key={l.code}
                    role="option"
                    aria-selected={l.code === lang}
                    onClick={() => handleLangSelect(l.code)}
                    className={`header__lang-option${l.code === lang ? " header__lang-option--active" : ""}`}
                  >
                    {l.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!isAuthenticated && (
            <button type="button" onClick={onLogin} className="header__login-btn">
              <FaRegUser className="header__icon" aria-hidden="true" />
              <span>{labels.login}</span>
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
                aria-label={labels.userMenu}
                className="header__user-trigger"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={labels.avatarAlt(user.name)}
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
                  aria-label={labels.userMenu}
                  className="header__menu"
                >
                  <div className="header__menu-header">
                    <p className="header__menu-name">{user.name}</p>
                    {user.email && <p className="header__menu-email">{user.email}</p>}
                    <span className="header__menu-role">
                      {isAdmin ? labels.roleAdmin : labels.roleUser}
                    </span>
                  </div>
                  <ul className="header__menu-list">
                    <li>
                      <MenuItem onSelect={() => handleMenuAction(() => onNavigate("/profile"))}>
                        {labels.profile}
                      </MenuItem>
                    </li>
                    <li>
                      <MenuItem onSelect={() => handleMenuAction(onLogout)} danger>
                        {labels.logout}
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
