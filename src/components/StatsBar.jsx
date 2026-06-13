import { useTheme } from '../context/ThemeContext.jsx'

const STAT_COLORS = {
  KEYWORD:          'text-blue-400',
  IDENTIFIER:       'text-white',
  NUMBER:           'text-orange-400',
  OPERATOR:         'text-pink-400',
  PUNCTUATION:      'text-yellow-400',
  STRING:           'text-green-400',
  CHAR_LITERAL:     'text-lime-400',
  INVALID:          'text-red-400',
  COMMENT:          'text-gray-400',
  DIRECTIVE:        'text-purple-400',
  BUILTIN_FUNCTION: 'text-cyan-400',
}

const STAT_COLORS_LIGHT = {
  KEYWORD:          'text-blue-600',
  IDENTIFIER:       'text-gray-800',
  NUMBER:           'text-orange-600',
  OPERATOR:         'text-pink-600',
  PUNCTUATION:      'text-yellow-600',
  STRING:           'text-green-600',
  CHAR_LITERAL:     'text-lime-600',
  INVALID:          'text-red-600',
  COMMENT:          'text-gray-500',
  DIRECTIVE:        'text-purple-600',
  BUILTIN_FUNCTION: 'text-cyan-600',
}

export default function StatsBar({ tokens }) {
  const { isDark } = useTheme()
  const colors = isDark ? STAT_COLORS : STAT_COLORS_LIGHT

  const stats = tokens.reduce((acc, token) => {
    acc[token.type] = (acc[token.type] || 0) + 1
    return acc
  }, {})

  if (tokens.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-4 px-6 py-3 border-t text-xs font-mono transition-colors duration-300
      ${isDark
        ? 'bg-gray-900/80 border-gray-800'
        : 'bg-gray-100 border-gray-200'
      }`}
    >
      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
        Tokens: <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {tokens.length}
        </span>
      </span>
      <span className={isDark ? 'text-gray-700' : 'text-gray-300'}>|</span>
      {Object.entries(stats).map(([type, count]) => (
        <span key={type} className={colors[type]}>
          {type}: <span className="font-bold">{count}</span>
        </span>
      ))}
    </div>
  )
}