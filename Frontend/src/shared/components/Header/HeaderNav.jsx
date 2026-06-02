import { FaLandmark, FaRegCalendar, FaUtensils, FaRegHeart } from "../../ui/icons";

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
    { path: "/culture", label: "Kultura", icon: FaLandmark },
    { path: "/favoritos", label: "Gogokoak", icon: FaRegHeart },
  ],
};

export default function HeaderNav({ onNavigate = () => {}, lang = "es" }) {
  const links = NAV_LINKS[lang] ?? NAV_LINKS.es;

  function handleClick(e, path) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate(path);
  }

  return (
    <nav aria-label="Navegación principal" className="header__nav">
      {links.map(({ path, label, icon: Icon }) => (
        <a
          key={path}
          href={path}
          onClick={(e) => handleClick(e, path)}
          aria-label={label}
          className="header__nav-link"
        >
          <Icon className="header__icon" aria-hidden="true" />
          <span className="header__nav-label">{label}</span>
        </a>
      ))}
    </nav>
  );
}
