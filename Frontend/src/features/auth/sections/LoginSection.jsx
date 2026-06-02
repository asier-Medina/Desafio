import LoginForm from '../components/LoginForm'

export default function LoginSection({ onToggle, onSuccess }) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
        Bienvenido de nuevo
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Inicia sesión para continuar
      </p>

      <LoginForm onSuccess={onSuccess} />

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-[#7f557b] dark:text-[#b894b2] font-medium hover:underline cursor-pointer"
        >
          Registrarse
        </button>
      </p>
    </div>
  )
}
