import LoginForm from '../components/LoginForm'

export default function LoginSection({ onToggle, onSuccess }) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">
        Bienvenido de nuevo
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Inicia sesión para continuar
      </p>

      <LoginForm onSuccess={onSuccess} />

      <p className="text-sm text-gray-500 mt-6">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-[#7f557b] font-medium hover:underline cursor-pointer"
        >
          Registrarse
        </button>
      </p>
    </div>
  )
}
