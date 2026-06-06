import OnboardingForm from '../components/OnboardingForm'

export default function OnboardingSection({ onSuccess }) {
  return (
    <div className="onboarding-card">
      <div className="onboarding-card__header">
        <p className="onboarding__progress">Paso 2 de 2</p>
        <h2 className="onboarding__title">Personaliza tu experiencia</h2>
        <p className="onboarding__subtitle">
          Cuéntanos qué te gusta para mostrarte lo más relevante del País Vasco.
        </p>
      </div>
      <div className="onboarding-card__body">
        <OnboardingForm onSuccess={onSuccess} onSkip={onSuccess} />
      </div>
    </div>
  )
}
