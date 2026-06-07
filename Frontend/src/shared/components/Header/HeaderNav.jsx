import { FaLandmark, FaRegCalendar, FaUtensils, FaRegHeart } from "@ui/icons";

const NAV_LINKS = {
  es: [
    { path: "/events", label: "Eventos", icon: FaRegCalendar },
    { path: "/gastronomy", label: "Gastronomía", icon: FaUtensils },
    { path: "/culture", label: "Cultura", icon: FaLandmark },
    { path: "/favoritos", label: "Favoritos", icon: FaRegHeart },
  ],
  eu: [
    { path: "/events", label: "Ekitaldiak", icon: FaRegCalendar },
    { path: "/gastronomy", label: "Gastronomia", icon: FaUtensils },
    { path: "/culture", label: "Kultura", icon: FaLandmark },
    { path: "/favoritos", label: "Gogokoak", icon: FaRegHeart },
  ],
  en: [
    { path: "/events", label: "Events", icon: FaRegCalendar },
    { path: "/gastronomy", label: "Gastronomy", icon: FaUtensils },
    { path: "/culture", label: "Culture", icon: FaLandmark },
    { path: "/favoritos", label: "Favorites", icon: FaRegHeart },
  ],
};

export default function HeaderNav({ onNavigate = () => {}, currentPath = "", lang = "es" }) {
  const links = NAV_LINKS[lang] ?? NAV_LINKS.es;

  function handleClick(e, path) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(path);
  }

  function isActive(path) {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  }

  return (
    <nav aria-label="Navegación principal" className="header__nav">
      {links.map(({ path, label, icon: Icon }) => (
        <a
          key={path}
          href={path}
          onClick={(e) => handleClick(e, path)}
          aria-label={label}
          aria-current={isActive(path) ? "page" : undefined}
          className={`header__nav-link${isActive(path) ? " header__nav-link--active" : ""}`}
        >
          <Icon className="header__nav-icon" aria-hidden="true" />
          <span className="header__nav-label">{label}</span>
        </a>
      ))}
    </nav>
  );
}
