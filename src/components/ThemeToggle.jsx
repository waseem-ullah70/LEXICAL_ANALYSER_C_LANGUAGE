import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className={`
        relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono
        border transition-all duration-300
        ${isDark
          ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:border-yellow-500/50'
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-blue-400/50'
        }
      `}
    >
      <span className="text-base">
        {isDark ? '☀️' : '🌙'}
      </span>
      <span>
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}