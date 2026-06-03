import Button from "@ui/Button";
import RegisterForm from "../components/RegisterForm";

export default function RegisterSection({ onToggle, onSuccess }) {
  return (
    <div className="auth-card__content">
      <h2 className="auth-card__title">Crear cuenta</h2>

      <RegisterForm onSuccess={onSuccess} />

      <div className="auth-card__toggle">
        <p className="auth-card__toggle-text">¿Ya tienes cuenta?</p>
        <Button variant="soft" fullWidth onClick={onToggle}>
          Iniciar sesión
        </Button>
      </div>
    </div>
  );
}
