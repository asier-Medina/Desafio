import { Link } from 'react-router';
import { useAuth } from '@features/auth/context/AuthContext';
import { useLanguage } from '@shared/context/LanguageContext';
import './RequireAuth.css';

export default function RequireAuth({ children, icon: Icon, variant, title, description }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const tr = t.requireAuth;

  if (loading) return null;

  if (!user) {
    const resolved = variant ? tr.variants[variant] : { title, description };
    return (
      <div className="require-auth">
        {Icon && <Icon className="require-auth__icon" aria-hidden="true" />}
        <h1 className="require-auth__title">{resolved.title}</h1>
        <p className="require-auth__desc">{resolved.description}</p>
        <div className="require-auth__actions">
          <Link to="/login" className="require-auth__btn require-auth__btn--primary">
            {tr.login}
          </Link>
          <Link to="/login" className="require-auth__btn require-auth__btn--ghost">
            {tr.register}
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
