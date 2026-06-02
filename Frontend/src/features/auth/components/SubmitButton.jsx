export default function SubmitButton({ children, loading, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors
        bg-[#7f557b] hover:bg-[#6b4767] disabled:opacity-50 disabled:cursor-not-allowed
        dark:bg-[#b894b2] dark:hover:bg-[#a37f9d] dark:text-gray-900"
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}
