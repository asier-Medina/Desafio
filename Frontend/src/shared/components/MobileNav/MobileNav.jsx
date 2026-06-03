import { FaLandmark, FaRegCalendar, FaUtensils, FaRegHeart } from "../../ui/icons";
import "./MobileNav.css";

const NAV_LINKS = {
  es: [
    { path: "/events", label: "Eventos", icon: FaRegCalendar },
    { path: "/gastronomy", label: "Gastronomía", icon: FaUtensils },
    { path: "/culture", label: "Cultural", icon: FaLandmark },
    { path: "/favoritos", label: "Favoritos", icon: FaRegHeart },
  ],
  eu: [
    { path: "/events", label: "Ekitaldiak", icon: FaRegCalendar },
    { path: "/gastronomy", label: "Gastronomia", icon: FaUtensils },
    { path: "/culture", label: "Kulturala", icon: FaLandmark },
    { path: "/favoritos", label: "Gogokoak", icon: FaRegHeart },
  ],
};

export default function MobileNav({ onNavigate = () => {}, currentPath = "", lang = "es" }) {
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
    <nav aria-label="Navegación móvil" className="mobile-nav">
      {links.map(({ path, label, icon: Icon }) => (
        <a
          key={path}
          href={path}
          onClick={(e) => handleClick(e, path)}
          aria-label={label}
          aria-current={isActive(path) ? "page" : undefined}
          className={`mobile-nav__link${isActive(path) ? " mobile-nav__link--active" : ""}`}
        >
          <Icon className="mobile-nav__icon" aria-hidden="true" />
          <span className="mobile-nav__label">{label}</span>
        </a>
      ))}
    </nav>
  );
}
