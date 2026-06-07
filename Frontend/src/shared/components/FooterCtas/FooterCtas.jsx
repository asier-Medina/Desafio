import { useNavigate } from 'react-router';
import Button from '@shared/ui/Button';
import { FaArrowUpRightFromSquare } from '@ui/icons';
import { useLang } from '@shared/context/LangContext';
import './FooterCtas.css';

const LABELS = {
  es: {
    businessTitle: '¿Tienes un negocio?',
    businessDesc: 'Añade tu establecimiento y llega a miles de personas que buscan lo mejor de Euskadi.',
    businessBtn: 'Registra tu negocio',
    blogTitle: 'Blog',
    blogDesc: 'Artículos, guías y recomendaciones sobre cultura y gastronomía vasca.',
  },
  eu: {
    businessTitle: 'Negozio bat al duzu?',
    businessDesc: 'Gehitu zure establezimendua eta iritsi Euskadiko onena bilatzen duten milaka pertsonengana.',
    businessBtn: 'Erregistratu zure negozioa',
    blogTitle: 'Bloga',
    blogDesc: 'Euskal kultura eta gastronomiaren inguruko artikuluak, gidak eta gomendioak.',
  },
  en: {
    businessTitle: 'Do you have a business?',
    businessDesc: 'List your establishment and reach thousands of people looking for the best of the Basque Country.',
    businessBtn: 'Register your business',
    blogTitle: 'Blog',
    blogDesc: 'Articles, guides and recommendations about Basque culture and gastronomy.',
  },
};

export default function FooterCtas() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = LABELS[lang] ?? LABELS.es;

  return (
    <div className="footer-ctas">
      <div className="container">
        <div className="footer-ctas__grid">

          <div className="footer-ctas__card footer-ctas__card--business">
            <div className="footer-ctas__body">
              <h2 className="footer-ctas__title">{t.businessTitle}</h2>
              <p className="footer-ctas__desc">{t.businessDesc}</p>
            </div>
            <Button
              variant="outline"
              size="md"
              className="footer-ctas__btn"
              onClick={() => navigate('/login')}
            >
              {t.businessBtn}
            </Button>
          </div>

          <a
            href="#"
            className="footer-ctas__card footer-ctas__card--blog"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="footer-ctas__body">
              <h2 className="footer-ctas__title">{t.blogTitle}</h2>
              <p className="footer-ctas__desc">{t.blogDesc}</p>
            </div>
            <FaArrowUpRightFromSquare className="footer-ctas__arrow" aria-hidden="true" />
          </a>

        </div>
      </div>
    </div>
  );
}
