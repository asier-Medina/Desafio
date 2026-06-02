import RegisterForm from '../components/RegisterForm'

export default function RegisterSection({ onToggle, onSuccess }) {
  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-2xl font-semibold text-gray-800 mb-1">
        Crear cuenta
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Regístrate para disfrutar de la experiencia
      </p>

      <RegisterForm onSuccess={onSuccess} />

      <p className="text-sm text-gray-500 mt-6">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onToggle}
          className="text-[#7f557b] font-medium hover:underline cursor-pointer"
        >
          Iniciar sesión
        </button>
      </p>
    </div>
  )
}
