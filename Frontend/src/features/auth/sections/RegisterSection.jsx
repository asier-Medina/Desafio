import RegisterForm from '../components/RegisterForm'

export default function RegisterSection({ onToggle, onSuccess }) {
  return (
    <div className="auth-card__content">
      <h2 className="auth-card__title">
        Crear cuenta
      </h2>
      <RegisterForm onSuccess={onSuccess} />

      <div className="auth-card__toggle">
        <p className="auth-card__toggle-text">¿Ya tienes cuenta?</p>
        <button
          type="button"
          onClick={onToggle}
          className="auth-card__submit auth-card__submit--secondary"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  )
}
