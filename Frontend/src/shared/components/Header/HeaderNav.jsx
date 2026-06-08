import { FaLandmark, FaRegCalendar, FaUtensils, FaRegHeart } from "@ui/icons";
import { useLanguage } from "@shared/context/LanguageContext";

export default function HeaderNav({ onNavigate = () => {}, currentPath = "" }) {
  const { t } = useLanguage();

  const links = [
    { path: "/events",     label: t.nav.events,     icon: FaRegCalendar },
    { path: "/gastronomy", label: t.nav.gastronomy,  icon: FaUtensils    },
    { path: "/culture",    label: t.nav.culture,     icon: FaLandmark    },
    { path: "/favoritos",  label: t.nav.favorites,   icon: FaRegHeart    },
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
