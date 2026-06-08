import Button from "@ui/Button";
import LoginForm from "../components/LoginForm";
import { useLanguage } from "@shared/context/LanguageContext";

export default function LoginSection({ onToggle, onSuccess }) {
  const { t } = useLanguage();
  const ta = t.auth;

  return (
    <div className="auth-card__content">
      <h2 className="auth-card__title">{ta.loginTitle}</h2>
      <LoginForm onSuccess={onSuccess} />
      <div className="auth-card__toggle">
        <p className="auth-card__toggle-text">{ta.noAccount}</p>
        <Button variant="soft" fullWidth onClick={onToggle}>
          {ta.registerTitle}
        </Button>
      </div>
    </div>
  );
}
