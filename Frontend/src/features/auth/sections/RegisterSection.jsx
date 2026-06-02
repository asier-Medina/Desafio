import RegisterForm from '../components/RegisterForm'

export default function RegisterSection({ onToggle, onSuccess }) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
        Crear cuenta
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Regístrate para disfrutar de la experiencia
      </p>

      <RegisterForm onSuccess={onSuccess} />

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-[#7f557b] dark:text-[#b894b2] font-medium hover:underline cursor-pointer"
        >
          Iniciar sesión
        </button>
      </p>
    </div>
  )
}
