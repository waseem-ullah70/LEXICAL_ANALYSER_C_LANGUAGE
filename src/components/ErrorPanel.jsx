import { useTheme } from '../context/ThemeContext.jsx'

export default function ErrorPanel({ tokens }) {
  const { isDark } = useTheme()
  const errors = tokens.filter(t => t.type === 'INVALID')

  if (errors.length === 0) {
    return (
      <div className={`rounded-xl border p-4 transition-colors duration-300
        ${isDark
          ? 'bg-gray-900 border-gray-800'
          : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <h2 className={`text-sm font-bold uppercase tracking-widest mb-3
          ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Error Report
        </h2>
        <div className="flex items-center gap-2 text-green-500 text-sm font-mono">
          <span>✓</span>
          <span>No errors found — all tokens valid</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border p-4 transition-colors duration-300
      ${isDark
        ? 'bg-gray-900 border-red-900/50'
        : 'bg-white border-red-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-sm font-bold uppercase tracking-widest
          ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Error Report
        </h2>
        <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
          {errors.length} error{errors.length > 1 ? 's' : ''} found
        </span>
      </div>
      <div className="space-y-2">
        {errors.map((error, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg px-3 py-2 font-mono text-sm border
              ${isDark
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-red-50 border-red-200'
              }`}
          >
            <span className="text-red-500 mt-0.5">✕</span>
            <div className="flex-1">
              <span className="text-red-400 font-bold">
                Invalid token: "{error.lexeme}"
              </span>
              <span className={`text-xs ml-2
                ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              >
                at Line {error.line}, Column {error.col}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}