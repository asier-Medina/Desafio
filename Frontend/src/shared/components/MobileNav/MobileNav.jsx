import { FaLandmark, FaRegCalendar, FaUtensils, FaRegHeart } from "@ui/icons";
import { useLanguage } from "@shared/context/LanguageContext";
import "./MobileNav.css";

export default function MobileNav({ onNavigate = () => {}, currentPath = "", hidden = false }) {
  const { t } = useLanguage();

  const links = [
    { path: "/events",     label: t.nav.events,    icon: FaRegCalendar },
    { path: "/gastronomy", label: t.nav.gastronomy, icon: FaUtensils    },
    { path: "/culture",    label: t.nav.culture,    icon: FaLandmark    },
    { path: "/favoritos",  label: t.nav.favorites,  icon: FaRegHeart    },
  ];

  function handleClick(e, path) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(path);
  }

  function isActive(path) {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  }

  if (hidden) return null;

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
