export default function InputField({ label, id, error, maxLength = 255, ...props }) {
  return (
    <div className="auth-card__field">
      <label htmlFor={id} className="auth-card__label">
        {label}
      </label>
      <input
        id={id}
        className={`auth-card__input${error ? ' auth-card__input--error' : ''}`}
        maxLength={maxLength}
        {...props}
      />
      {error && <span className="auth-card__field-error">{error}</span>}
    </div>
  )
}
