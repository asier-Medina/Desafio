import { useState } from 'react'
import InputField from './InputField'

export default function PasswordInput({ label, id, error, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
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
        className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm"
        tabIndex={-1}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  )
}
