import Button from "@ui/Button";
import RegisterForm from "../components/RegisterForm";
import { useLanguage } from "@shared/context/LanguageContext";

export default function RegisterSection({ onToggle, onSuccess }) {
  const { t } = useLanguage();
  const ta = t.auth;

  return (
    <div className="auth-card__content">
      <h2 className="auth-card__title">{ta.registerTitle}</h2>
      <RegisterForm onSuccess={onSuccess} />
      <div className="auth-card__toggle">
        <p className="auth-card__toggle-text">{ta.hasAccount}</p>
        <Button variant="soft" fullWidth onClick={onToggle}>
          {ta.loginBtn}
        </Button>
      </div>
    </div>
  );
}
