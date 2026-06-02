export default function SubmitButton({ children, loading, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors
        bg-[#7f557b] hover:bg-[#6b4767] disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}
