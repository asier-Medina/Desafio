import OnboardingForm from '../components/OnboardingForm';
import { useLanguage } from "@shared/context/LanguageContext";

export default function OnboardingSection({ onSuccess }) {
  const { t } = useLanguage();
  const ta = t.auth;

  return (
    <div className="onboarding-card">
      <div className="onboarding-card__header">
        <p className="onboarding__progress">{ta.step}</p>
        <h2 className="onboarding__title">{ta.onboardingTitle}</h2>
        <p className="onboarding__subtitle">{ta.onboardingSubtitle}</p>
      </div>
      <div className="onboarding-card__body">
        <OnboardingForm onSuccess={onSuccess} onSkip={onSuccess} />
      </div>
    </div>
  );
}
