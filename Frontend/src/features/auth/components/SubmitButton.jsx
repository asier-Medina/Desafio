export default function SubmitButton({ children, loading, ...props }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="auth-card__submit"
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  )
}
