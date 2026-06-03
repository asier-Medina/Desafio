export default function SelectField({ label, id, error, options = [], placeholder = "Seleccionar", ...props }) {
  return (
    <div className="auth-card__field">
      <label htmlFor={id} className="auth-card__label">
        {label}
      </label>
      <select
        id={id}
        className={`auth-card__input${error ? ' auth-card__input--error' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="auth-card__field-error">{error}</span>}
    </div>
  )
}
