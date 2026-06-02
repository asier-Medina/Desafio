import { Link } from "react-router";
import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
  FaArrowUpRightFromSquare,
} from "../../ui/icons";
import "./Footer.css";

// Enlaces externos: sustituid por las URLs reales del proyecto.
const BLOG_URL = "https://blog.bilbaoinsider.com";
const CONTACTO_NEGOCIOS = "mailto:hola@sustraiapp.com";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer is-on-dark">
      <div className="footer__inner">
        <div className="footer__brand">
          <img
            src="/logos/sustrai_logo_horizontal.svg"
            alt="Bilbao Insider"
            className="footer__logo"
          />
          <p className="footer__tagline">
            Agenda cultural y gastronómica del País Vasco.
          </p>
          <ul className="footer__social">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bilbao Insider en Instagram"
                className="footer__social-link"
              >
                <FaInstagram className="footer__social-icon" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bilbao Insider en Facebook"
                className="footer__social-link"
              >
                <FaFacebookF className="footer__social-icon" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bilbao Insider en X"
                className="footer__social-link"
              >
                <FaXTwitter className="footer__social-icon" aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        <nav className="footer__nav" aria-label="Explorar">
          <h2 className="footer__heading">Explorar</h2>
          <ul className="footer__list">
            <li><Link to="/" className="footer__link">Eventos</Link></li>
            <li><Link to="/gastronomia" className="footer__link">Gastronomía</Link></li>
            <li><Link to="/cultura" className="footer__link">Cultura</Link></li>
            <li><Link to="/favoritos" className="footer__link">Favoritos</Link></li>
          </ul>
        </nav>

        <nav className="footer__nav" aria-label="Información">
          <h2 className="footer__heading">Información</h2>
          <ul className="footer__list">
            <li><Link to="/aviso-legal" className="footer__link">Aviso legal</Link></li>
            <li><Link to="/privacidad" className="footer__link">Privacidad</Link></li>
            <li><Link to="/accesibilidad" className="footer__link">Accesibilidad</Link></li>
            <li><Link to="/cookies" className="footer__link">Cookies</Link></li>
          </ul>
        </nav>

        <nav className="footer__nav" aria-label="Negocios">
          <h2 className="footer__heading">Negocios</h2>
          <ul className="footer__list">
            <li>
              <a href={CONTACTO_NEGOCIOS} className="footer__link">
                ¿Eres un negocio? Contáctanos
              </a>
            </li>
            <li>
              <a
                href={BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link footer__link--external"
              >
                Blog
                <FaArrowUpRightFromSquare
                  className="footer__external-icon"
                  aria-hidden="true"
                />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer__bottom">
        <p className="footer__copy">© {year} SustraiApp. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}