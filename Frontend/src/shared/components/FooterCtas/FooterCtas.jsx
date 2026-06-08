import { useNavigate } from 'react-router';
import Button from '@shared/ui/Button';
import { FaArrowUpRightFromSquare } from '@ui/icons';
import { useLanguage } from '@shared/context/LanguageContext';
import './FooterCtas.css';

export default function FooterCtas() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const tc = t.footerCtas;

  return (
    <div className="footer-ctas">
      <div className="container">
        <div className="footer-ctas__grid">

          <div className="footer-ctas__card footer-ctas__card--business">
            <div className="footer-ctas__body">
              <h2 className="footer-ctas__title">{tc.businessTitle}</h2>
              <p className="footer-ctas__desc">{tc.businessDesc}</p>
            </div>
            <Button
              variant="outline"
              size="md"
              className="footer-ctas__btn"
              onClick={() => navigate('/login')}
            >
              {tc.businessBtn}
            </Button>
          </div>

          <a
            href="#"
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
