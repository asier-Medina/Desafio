import { useState } from 'react'
import InputField from './InputField'

export default function PasswordInput({ label, id, error, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-card__password">
      <InputField
        label={label}
        id={id}
        type={visible ? 'text' : 'password'}
        error={error}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="auth-card__toggle-btn"
        tabIndex={-1}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
