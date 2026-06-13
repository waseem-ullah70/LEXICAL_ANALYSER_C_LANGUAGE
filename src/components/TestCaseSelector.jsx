import { useTheme } from '../context/ThemeContext.jsx'
import { TEST_CASES } from '../engine/testCases.js'

export default function TestCaseSelector({ onSelect }) {
  const { isDark } = useTheme()

  return (
    <div className={`rounded-xl border p-4 transition-colors duration-300
      ${isDark
        ? 'bg-gray-900 border-gray-800'
        : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <h2 className={`text-sm font-bold uppercase tracking-widest mb-2
        ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
      >
        📂 Test Dataset
      </h2>
      <p className={`text-xs mb-4 font-mono
        ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
      >
        Real C programs — click to load into the analyzer
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {TEST_CASES.map(tc => (
          <button
            key={tc.id}
            onClick={() => onSelect(tc.code)}
            className={`text-left rounded-lg p-3 border transition-all group
              ${isDark
                ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-blue-500/50'
                : 'bg-gray-50 hover:bg-blue-50 border-gray-200 hover:border-blue-300'
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-mono
                ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
              >
                #{tc.id}
              </span>
              <span className={`text-sm font-bold transition-colors
                ${isDark
                  ? 'text-white group-hover:text-blue-400'
                  : 'text-gray-700 group-hover:text-blue-600'
                }`}
              >
                {tc.name}
              </span>
            </div>
            <p className={`text-xs leading-relaxed
              ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              {tc.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}