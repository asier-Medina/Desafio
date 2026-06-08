import { useState } from 'react'
import InputField from './InputField'
import { useLanguage } from '@shared/context/LanguageContext'
import { getPasswordStrength } from '../utils/validation'

export default function PasswordInput({ label, id, error, showStrength, value, ...props }) {
  const [visible, setVisible] = useState(false)
  const { t } = useLanguage()
  const ta = t.auth
  const raw = showStrength && value ? getPasswordStrength(value) : null

  const strengthLabels = { weak: ta.strengthWeak, medium: ta.strengthMedium, strong: ta.strengthStrong }
  const strength = raw ? { ...raw, label: strengthLabels[raw.level] ?? raw.label } : null

  return (
    <div className="auth-card__password">
      <InputField
        label={label}
        id={id}
        type={visible ? 'text' : 'password'}
        error={error}
        value={value}
        maxLength={128}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="auth-card__toggle-btn"
        tabIndex={-1}
        aria-label={visible ? ta.hidePassword : ta.showPassword}
      >
        {visible ? ta.hide : ta.show}
      </button>
      {strength && (
        <div className="auth-card__strength" role="meter" aria-valuenow={strength.score} aria-valuemin={0} aria-valuemax={5} aria-label={`${ta.strengthWeak}: ${strength.label}`}>
          <div className={`auth-card__strength-bar auth-card__strength-bar--${strength.level}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
          <span className={`auth-card__strength-label auth-card__strength-label--${strength.level}`}>{strength.label}</span>
        </div>
      )}
    </div>
  )
}
