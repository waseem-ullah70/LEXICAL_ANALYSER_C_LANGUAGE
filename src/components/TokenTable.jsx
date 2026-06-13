import { useTheme } from '../context/ThemeContext.jsx'

const TOKEN_COLORS = {
  KEYWORD:          'text-blue-400 bg-blue-400/10 border-blue-400/30',
  IDENTIFIER:       'text-white bg-white/10 border-white/20',
  NUMBER:           'text-orange-400 bg-orange-400/10 border-orange-400/30',
  OPERATOR:         'text-pink-400 bg-pink-400/10 border-pink-400/30',
  PUNCTUATION:      'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  STRING:           'text-green-400 bg-green-400/10 border-green-400/30',
  CHAR_LITERAL:     'text-lime-400 bg-lime-400/10 border-lime-400/30',
  INVALID:          'text-red-400 bg-red-400/10 border-red-400/30',
  COMMENT:          'text-gray-400 bg-gray-400/10 border-gray-400/30',
  DIRECTIVE:        'text-purple-400 bg-purple-400/10 border-purple-400/30',
  BUILTIN_FUNCTION: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
}

// Light mode versions
const TOKEN_COLORS_LIGHT = {
  KEYWORD:          'text-blue-600 bg-blue-50 border-blue-200',
  IDENTIFIER:       'text-gray-800 bg-gray-50 border-gray-200',
  NUMBER:           'text-orange-600 bg-orange-50 border-orange-200',
  OPERATOR:         'text-pink-600 bg-pink-50 border-pink-200',
  PUNCTUATION:      'text-yellow-600 bg-yellow-50 border-yellow-200',
  STRING:           'text-green-600 bg-green-50 border-green-200',
  CHAR_LITERAL:     'text-lime-600 bg-lime-50 border-lime-200',
  INVALID:          'text-red-600 bg-red-50 border-red-200',
  COMMENT:          'text-gray-500 bg-gray-50 border-gray-200',
  DIRECTIVE:        'text-purple-600 bg-purple-50 border-purple-200',
  BUILTIN_FUNCTION: 'text-cyan-600 bg-cyan-50 border-cyan-200',
}

export default function TokenTable({ tokens }) {
  const { isDark } = useTheme()
  const colors = isDark ? TOKEN_COLORS : TOKEN_COLORS_LIGHT

  if (tokens.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full text-sm
        ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
      >
        Enter code on the left to see tokens
      </div>
    )
  }

  return (
    <div className="space-y-1 overflow-y-auto h-full pr-2">
      {tokens.map((token, i) => (
        <div
          key={i}
          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm font-mono ${colors[token.type]}`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-xs w-6 text-right
              ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            >
              {i + 1}
            </span>
            <span className="font-bold">"{token.lexeme}"</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-40">
              {token.line}:{token.col}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full border opacity-80">
              {token.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}