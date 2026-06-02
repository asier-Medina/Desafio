export default function InputField({ label, id, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        id={id}
        className={`px-3 py-2.5 rounded-lg border text-sm transition-colors outline-none
          ${error
            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#7f557b]/30 focus:border-[#7f557b]'
          }
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
