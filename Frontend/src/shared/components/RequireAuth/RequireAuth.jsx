import { Link } from 'react-router';
import { useAuth } from '@features/auth/context/AuthContext';
import './RequireAuth.css';

export default function RequireAuth({ children, icon: Icon, title, description }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="require-auth">
        {Icon && <Icon className="require-auth__icon" aria-hidden="true" />}
        <h1 className="require-auth__title">{title}</h1>
        <p className="require-auth__desc">{description}</p>
        <div className="require-auth__actions">
          <Link to="/login" className="require-auth__btn require-auth__btn--primary">
            Iniciar sesión
          </Link>
          <Link to="/login" className="require-auth__btn require-auth__btn--ghost">
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
