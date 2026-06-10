import { FaArrowUpRightFromSquare } from '@ui/icons';
import { useLanguage } from '@shared/context/LanguageContext';
import './FooterCtas.css';

export default function FooterCtas() {
  const { t } = useLanguage();
  const tc = t.footerCtas;

  return (
    <div className="footer-ctas">
      <div className="container">
        <div className="footer-ctas__grid">

          <a
            href="https://olatzglez.github.io/SustraiApp_LandingPage/landing-sustrai/landing.html"
            className="footer-ctas__card footer-ctas__card--business"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="footer-ctas__body">
              <h2 className="footer-ctas__title">{tc.businessTitle}</h2>
              <p className="footer-ctas__desc">{tc.businessDesc}</p>
            </div>
            <span className="btn btn--outline btn--md footer-ctas__btn">
              <span className="btn__text">{tc.businessBtn}</span>
            </span>
          </a>

          <a
            href="https://olatzglez.github.io/SustraiApp_LandingPage/landing-sustrai/blog.html"
            className="footer-ctas__card footer-ctas__card--blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="footer-ctas__body">
              <h2 className="footer-ctas__title">{tc.blogTitle}</h2>
              <p className="footer-ctas__desc">{tc.blogDesc}</p>
            </div>
            <FaArrowUpRightFromSquare className="footer-ctas__arrow" aria-hidden="true" />
          </a>

        </div>
      </div>
    </div>
  );
}
