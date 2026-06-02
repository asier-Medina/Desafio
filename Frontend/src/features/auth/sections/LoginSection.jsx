import LoginForm from '../components/LoginForm'

export default function LoginSection({ onToggle, onSuccess }) {
  return (
    <div className="auth-card__content">
      <h2 className="auth-card__title">
        Bienvenido de nuevo
      </h2>

      <LoginForm onSuccess={onSuccess} />

      <div className="auth-card__toggle">
        <p className="auth-card__toggle-text">¿No tienes cuenta?</p>
        <button
          type="button"
          onClick={onToggle}
          className="auth-card__submit auth-card__submit--secondary"
        >
          Registrarse
        </button>
      </div>
    </div>
  )
}
