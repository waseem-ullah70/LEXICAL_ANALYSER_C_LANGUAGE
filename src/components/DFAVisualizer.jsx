import { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

// ─── Formal DFA Definitions (Course Book Rules) ───────────────────────────────
// Each DFA follows 5-tuple: (Q, Σ, δ, q0, F)
// Every state has exactly one transition per symbol — strict determinism

const DFA_DEFINITIONS = {

  IDENTIFIER: {
    title: "Identifier DFA",
    formal: "M = (Q, Σ, δ, S0, {S1})",
    alphabet: "Σ = { letter, digit, underscore(_), other }",
    description: "Recognizes identifiers and keywords. Rule: must start with letter or _, followed by any combination of letters, digits, or underscores.",
    states: [
      { id: 'S0',   label: 'S0',   x: 100,  y: 160, isStart: true,  isAccept: false, description: 'Initial state' },
      { id: 'S1',   label: 'S1',   x: 320,  y: 160, isStart: false, isAccept: true,  description: 'Accept: valid identifier' },
      { id: 'DEAD', label: 'DEAD', x: 210,  y: 300, isStart: false, isAccept: false, description: 'Trap/Dead state' },
    ],
    transitions: [
      { from: 'S0',   to: 'S1',   label: 'letter | _',         labelX: 210, labelY: 130 },
      { from: 'S0',   to: 'DEAD', label: 'digit | other',      labelX: 120, labelY: 255 },
      { from: 'S1',   to: 'S1',   label: 'letter | digit | _', isSelf: true },
      { from: 'S1',   to: 'DEAD', label: 'other',              labelX: 340, labelY: 255 },
      { from: 'DEAD', to: 'DEAD', label: 'any',                isSelf: true },
    ],
    table: {
      headers: ['State', 'letter / _', 'digit', 'other', 'Accept?'],
      rows: [
        ['→ S0', 'S1', 'DEAD', 'DEAD', '❌'],
        ['* S1', 'S1', 'S1',   'DEAD', '✅'],
        ['DEAD', 'DEAD','DEAD','DEAD', '❌'],
      ]
    }
  },

  NUMBER: {
    title: "Number Literal DFA",
    formal: "M = (Q, Σ, δ, S0, {S1, S3, HEX2})",
    alphabet: "Σ = { digit(0-9), dot(.), x/X, hex_digit(0-9,a-f,A-F), other }",
    description: "Recognizes integers (10, 99), floats (3.14), and hexadecimal (0xFF, 0x1A). Two accept paths: decimal digits and 0x-prefixed hex.",
    states: [
      { id: 'S0',   label: 'S0',   x: 80,  y: 150, isStart: true,  isAccept: false, description: 'Start' },
      { id: 'S1',   label: 'S1',   x: 240, y: 150, isStart: false, isAccept: true,  description: 'Accept: integer' },
      { id: 'S2',   label: 'S2',   x: 400, y: 150, isStart: false, isAccept: false, description: 'Dot seen' },
      { id: 'S3',   label: 'S3',   x: 560, y: 150, isStart: false, isAccept: true,  description: 'Accept: float' },
      { id: 'HEX1', label: 'HEX1', x: 240, y: 290, isStart: false, isAccept: false, description: '0x seen' },
      { id: 'HEX2', label: 'HEX2', x: 400, y: 290, isStart: false, isAccept: true,  description: 'Accept: hex' },
      { id: 'DEAD', label: 'DEAD', x: 560, y: 290, isStart: false, isAccept: false, description: 'Trap state' },
    ],
    transitions: [
      { from: 'S0',   to: 'S1',   label: 'digit',         labelX: 155, labelY: 128 },
      { from: 'S0',   to: 'DEAD', label: 'other',         labelX: 60,  labelY: 230 },
      { from: 'S1',   to: 'S1',   label: 'digit',         isSelf: true },
      { from: 'S1',   to: 'S2',   label: '.',             labelX: 315, labelY: 128 },
      { from: 'S1',   to: 'HEX1', label: 'x|X',          labelX: 195, labelY: 225 },
      { from: 'S2',   to: 'S3',   label: 'digit',         labelX: 475, labelY: 128 },
      { from: 'S2',   to: 'DEAD', label: 'other',         labelX: 470, labelY: 225 },
      { from: 'S3',   to: 'S3',   label: 'digit',         isSelf: true },
      { from: 'S3',   to: 'DEAD', label: 'other',         labelX: 570, labelY: 225 },
      { from: 'HEX1', to: 'HEX2', label: 'hex digit',    labelX: 315, labelY: 268 },
      { from: 'HEX1', to: 'DEAD', label: 'other',        labelX: 390, labelY: 320 },
      { from: 'HEX2', to: 'HEX2', label: 'hex digit',   isSelf: true },
      { from: 'HEX2', to: 'DEAD', label: 'other',        labelX: 475, labelY: 268 },
      { from: 'DEAD', to: 'DEAD', label: 'any',          isSelf: true },
    ],
    table: {
      headers: ['State', 'digit', '.', 'x/X', 'hex digit', 'other', 'Accept?'],
      rows: [
        ['→ S0',   'S1',   'DEAD', 'DEAD', 'DEAD', 'DEAD', '❌'],
        ['* S1',   'S1',   'S2',   'HEX1', 'S1',   'DEAD', '✅'],
        ['  S2',   'S3',   'DEAD', 'DEAD', 'DEAD', 'DEAD', '❌'],
        ['* S3',   'S3',   'DEAD', 'DEAD', 'DEAD', 'DEAD', '✅'],
        ['  HEX1', 'HEX2', 'DEAD', 'DEAD', 'HEX2', 'DEAD', '❌'],
        ['* HEX2', 'HEX2', 'DEAD', 'DEAD', 'HEX2', 'DEAD', '✅'],
        ['  DEAD', 'DEAD', 'DEAD', 'DEAD', 'DEAD', 'DEAD', '❌'],
      ]
    }
  },

  OPERATOR: {
    title: "Operator DFA",
    formal: "M = (Q, Σ, δ, S0, {ACC, S1, S3, S4})",
    alphabet: "Σ = { +−*/%, ~, =, !, <>, &|^, same(++/--), other }",
    description: "Recognizes single (+−*/%), compound (+=, ==, !=, <=, >=, &&, ||, ++, --) and bitwise (&, |, ^, ~) operators.",
    states: [
      { id: 'S0',  label: 'S0',  x: 80,  y: 190, isStart: true,  isAccept: false, description: 'Start' },
      { id: 'S1',  label: 'S1',  x: 280, y: 80,  isStart: false, isAccept: true,  description: 'Accept: =,<,>,&,|' },
      { id: 'S2',  label: 'S2',  x: 280, y: 190, isStart: false, isAccept: false, description: '! seen' },
      { id: 'S3',  label: 'S3',  x: 280, y: 300, isStart: false, isAccept: true,  description: 'Accept: + - * /' },
      { id: 'ACC', label: 'ACC', x: 480, y: 190, isStart: false, isAccept: true,  description: 'Accept: compound' },
      { id: 'DEAD',label: 'DEAD',x: 480, y: 330, isStart: false, isAccept: false, description: 'Trap state' },
    ],
    transitions: [
      { from: 'S0',  to: 'S1',   label: '= < > & | ^',  labelX: 148, labelY: 118 },
      { from: 'S0',  to: 'S2',   label: '!',             labelX: 148, labelY: 195 },
      { from: 'S0',  to: 'S3',   label: '+ - * / % ~',  labelX: 148, labelY: 268 },
      { from: 'S0',  to: 'DEAD', label: 'other',         labelX: 60,  labelY: 340 },
      { from: 'S1',  to: 'ACC',  label: '= or same',     labelX: 370, labelY: 118 },
      { from: 'S1',  to: 'DEAD', label: 'other',         labelX: 295, labelY: 215 },
      { from: 'S2',  to: 'ACC',  label: '=',             labelX: 370, labelY: 185 },
      { from: 'S2',  to: 'DEAD', label: 'other',         labelX: 370, labelY: 268 },
      { from: 'S3',  to: 'ACC',  label: '=  or same',   labelX: 370, labelY: 310 },
      { from: 'S3',  to: 'DEAD', label: 'other',         labelX: 400, labelY: 338 },
      { from: 'ACC', to: 'DEAD', label: 'any',           isSelf: false, labelX: 490, labelY: 268 },
      { from: 'DEAD',to: 'DEAD', label: 'any',           isSelf: true },
    ],
    table: {
      headers: ['State', '+−*/% ~', '= < > & |', '!', 'same(++)', 'other', 'Accept?'],
      rows: [
        ['→ S0',  'S3',   'S1',   'S2',  'S3',  'DEAD', '❌'],
        ['* S1',  'DEAD', 'ACC',  'DEAD','ACC',  'DEAD', '✅'],
        ['  S2',  'DEAD', 'ACC',  'DEAD','DEAD', 'DEAD', '❌'],
        ['* S3',  'DEAD', 'ACC',  'DEAD','ACC',  'DEAD', '✅'],
        ['* ACC', 'DEAD', 'DEAD', 'DEAD','DEAD', 'DEAD', '✅'],
        ['  DEAD','DEAD', 'DEAD', 'DEAD','DEAD', 'DEAD', '❌'],
      ]
    }
  },

  STRING: {
    title: "String Literal DFA",
    formal: 'M = (Q, Σ, δ, S0, {ACC})',
    alphabet: 'Σ = { "(double quote), \\n(newline), other }',
    description: 'Recognizes string literals like "hello", "world". Opens with double quote, accepts any character except newline, closes with double quote.',
    states: [
      { id: 'S0',  label: 'S0',  x: 80,  y: 170, isStart: true,  isAccept: false, description: 'Start' },
      { id: 'S1',  label: 'S1',  x: 280, y: 170, isStart: false, isAccept: false, description: 'Inside string' },
      { id: 'ACC', label: 'ACC', x: 480, y: 170, isStart: false, isAccept: true,  description: 'Accept: closed string' },
      { id: 'DEAD',label: 'DEAD',x: 280, y: 310, isStart: false, isAccept: false, description: 'Trap state' },
    ],
    transitions: [
      { from: 'S0',  to: 'S1',   label: '"',       labelX: 175, labelY: 148 },
      { from: 'S0',  to: 'DEAD', label: 'other',   labelX: 120, labelY: 258 },
      { from: 'S1',  to: 'S1',   label: 'other',   isSelf: true },
      { from: 'S1',  to: 'ACC',  label: '"',       labelX: 375, labelY: 148 },
      { from: 'S1',  to: 'DEAD', label: '\\n',     labelX: 290, labelY: 248 },
      { from: 'ACC', to: 'DEAD', label: 'any',     labelX: 430, labelY: 258 },
      { from: 'DEAD',to: 'DEAD', label: 'any',     isSelf: true },
    ],
    table: {
      headers: ['State', '" (quote)', '\\n (newline)', 'other', 'Accept?'],
      rows: [
        ['→ S0',  'S1',   'DEAD', 'DEAD', '❌'],
        ['  S1',  'ACC',  'DEAD', 'S1',   '❌'],
        ['* ACC', 'DEAD', 'DEAD', 'DEAD', '✅'],
        ['  DEAD','DEAD', 'DEAD', 'DEAD', '❌'],
      ]
    }
  },

  CHAR_LITERAL: {
    title: "Character Literal DFA",
    formal: "M = (Q, Σ, δ, S0, {ACC})",
    alphabet: "Σ = { '(single quote), \\(backslash), char, other }",
    description: "Recognizes character literals like 'a', '\\n', '\\t'. Handles both regular single characters and escape sequences.",
    states: [
      { id: 'S0',  label: 'S0',  x: 80,  y: 170, isStart: true,  isAccept: false, description: 'Start' },
      { id: 'S1',  label: 'S1',  x: 230, y: 170, isStart: false, isAccept: false, description: "Opening ' seen" },
      { id: 'S2',  label: 'S2',  x: 380, y: 170, isStart: false, isAccept: false, description: 'Char read' },
      { id: 'S3',  label: 'S3',  x: 230, y: 300, isStart: false, isAccept: false, description: 'Escape \\ seen' },
      { id: 'ACC', label: 'ACC', x: 530, y: 170, isStart: false, isAccept: true,  description: "Accept: closing '" },
      { id: 'DEAD',label: 'DEAD',x: 380, y: 300, isStart: false, isAccept: false, description: 'Trap state' },
    ],
    transitions: [
      { from: 'S0',  to: 'S1',   label: "'",          labelX: 150, labelY: 148 },
      { from: 'S0',  to: 'DEAD', label: 'other',      labelX: 100, labelY: 255 },
      { from: 'S1',  to: 'S2',   label: 'char',       labelX: 298, labelY: 148 },
      { from: 'S1',  to: 'S3',   label: '\\',         labelX: 175, labelY: 248 },
      { from: 'S1',  to: 'DEAD', label: "'",          labelX: 250, labelY: 328 },
      { from: 'S2',  to: 'ACC',  label: "'",          labelX: 448, labelY: 148 },
      { from: 'S2',  to: 'DEAD', label: 'other',      labelX: 378, labelY: 248 },
      { from: 'S3',  to: 'S2',   label: 'escape char',labelX: 298, labelY: 328 },
      { from: 'S3',  to: 'DEAD', label: 'other',      labelX: 310, labelY: 295 },
      { from: 'ACC', to: 'DEAD', label: 'any',        labelX: 490, labelY: 255 },
      { from: 'DEAD',to: 'DEAD', label: 'any',        isSelf: true },
    ],
    table: {
      headers: ['State', "' (quote)", '\\ (backslash)', 'char', 'other', 'Accept?'],
      rows: [
        ['→ S0',  'S1',   'DEAD', 'DEAD', 'DEAD', '❌'],
        ['  S1',  'DEAD', 'S3',   'S2',   'DEAD', '❌'],
        ['  S2',  'ACC',  'DEAD', 'DEAD', 'DEAD', '❌'],
        ['  S3',  'DEAD', 'DEAD', 'S2',   'DEAD', '❌'],
        ['* ACC', 'DEAD', 'DEAD', 'DEAD', 'DEAD', '✅'],
        ['  DEAD','DEAD', 'DEAD', 'DEAD', 'DEAD', '❌'],
      ]
    }
  },

  COMMENT: {
    title: "Comment DFA",
    formal: "M = (Q, Σ, δ, S0, {ACC})",
    alphabet: "Σ = { /(slash), *(asterisk), \\n(newline), other }",
    description: "Recognizes both // single-line and /* block */ comments. S1→S2 path: single line. S1→S3 path: block comment.",
    states: [
      { id: 'S0',  label: 'S0',  x: 80,  y: 190, isStart: true,  isAccept: false, description: 'Start' },
      { id: 'S1',  label: 'S1',  x: 230, y: 190, isStart: false, isAccept: false, description: 'First / seen' },
      { id: 'S2',  label: 'S2',  x: 390, y: 90,  isStart: false, isAccept: false, description: '// seen: single line' },
      { id: 'S3',  label: 'S3',  x: 390, y: 290, isStart: false, isAccept: false, description: '/* seen: block' },
      { id: 'S4',  label: 'S4',  x: 540, y: 290, isStart: false, isAccept: false, description: '* seen in block' },
      { id: 'ACC', label: 'ACC', x: 540, y: 90,  isStart: false, isAccept: true,  description: 'Accept: comment closed' },
      { id: 'DEAD',label: 'DEAD',x: 230, y: 330, isStart: false, isAccept: false, description: 'Trap state' },
    ],
    transitions: [
      { from: 'S0',  to: 'S1',   label: '/',      labelX: 148, labelY: 168 },
      { from: 'S0',  to: 'DEAD', label: 'other',  labelX: 90,  labelY: 278 },
      { from: 'S1',  to: 'S2',   label: '/',      labelX: 295, labelY: 118 },
      { from: 'S1',  to: 'S3',   label: '*',      labelX: 295, labelY: 268 },
      { from: 'S1',  to: 'DEAD', label: 'other',  labelX: 218, labelY: 278 },
      { from: 'S2',  to: 'S2',   label: 'other',  isSelf: true },
      { from: 'S2',  to: 'ACC',  label: '\\n',    labelX: 458, labelY: 68 },
      { from: 'S3',  to: 'S3',   label: 'other',  isSelf: true },
      { from: 'S3',  to: 'S4',   label: '*',      labelX: 458, labelY: 268 },
      { from: 'S4',  to: 'ACC',  label: '/',      labelX: 548, labelY: 178 },
      { from: 'S4',  to: 'S4',   label: '*',      isSelf: true },
      { from: 'S4',  to: 'S3',   label: 'other',  labelX: 468, labelY: 318 },
      { from: 'ACC', to: 'DEAD', label: 'any',    labelX: 550, labelY: 215 },
      { from: 'DEAD',to: 'DEAD', label: 'any',    isSelf: true },
    ],
    table: {
      headers: ['State', '/ (slash)', '* (asterisk)', '\\n', 'other', 'Accept?'],
      rows: [
        ['→ S0',  'S1',   'DEAD', 'DEAD', 'DEAD', '❌'],
        ['  S1',  'S2',   'S3',   'DEAD', 'DEAD', '❌'],
        ['  S2',  'S2',   'S2',   'ACC',  'S2',   '❌'],
        ['  S3',  'S3',   'S4',   'S3',   'S3',   '❌'],
        ['  S4',  'ACC',  'S4',   'DEAD', 'S3',   '❌'],
        ['* ACC', 'DEAD', 'DEAD', 'DEAD', 'DEAD', '✅'],
        ['  DEAD','DEAD', 'DEAD', 'DEAD', 'DEAD', '❌'],
      ]
    }
  },

  DIRECTIVE: {
    title: "Preprocessor Directive DFA",
    formal: "M = (Q, Σ, δ, S0, {ACC})",
    alphabet: "Σ = { #(hash), letter(a-z,A-Z), \\n(newline), other }",
    description: "Recognizes preprocessor directives: #include, #define, #ifndef, etc. Consumes entire line after # as one token.",
    states: [
      { id: 'S0',  label: 'S0',  x: 80,  y: 180, isStart: true,  isAccept: false, description: 'Start' },
      { id: 'S1',  label: 'S1',  x: 260, y: 180, isStart: false, isAccept: false, description: '# seen' },
      { id: 'S2',  label: 'S2',  x: 440, y: 180, isStart: false, isAccept: false, description: 'Consuming line' },
      { id: 'ACC', label: 'ACC', x: 440, y: 310, isStart: false, isAccept: true,  description: 'Accept: directive' },
      { id: 'DEAD',label: 'DEAD',x: 260, y: 310, isStart: false, isAccept: false, description: 'Trap state' },
    ],
    transitions: [
      { from: 'S0',  to: 'S1',   label: '#',      labelX: 165, labelY: 158 },
      { from: 'S0',  to: 'DEAD', label: 'other',  labelX: 100, labelY: 265 },
      { from: 'S1',  to: 'S2',   label: 'letter', labelX: 345, labelY: 158 },
      { from: 'S1',  to: 'DEAD', label: 'other',  labelX: 258, labelY: 258 },
      { from: 'S2',  to: 'S2',   label: 'other',  isSelf: true },
      { from: 'S2',  to: 'ACC',  label: '\\n',    labelX: 458, labelY: 248 },
      { from: 'ACC', to: 'DEAD', label: 'any',    labelX: 345, labelY: 335 },
      { from: 'DEAD',to: 'DEAD', label: 'any',    isSelf: true },
    ],
    table: {
      headers: ['State', '# (hash)', 'letter', '\\n', 'other', 'Accept?'],
      rows: [
        ['→ S0',  'S1',   'DEAD', 'DEAD', 'DEAD', '❌'],
        ['  S1',  'DEAD', 'S2',   'DEAD', 'DEAD', '❌'],
        ['  S2',  'S2',   'S2',   'ACC',  'S2',   '❌'],
        ['* ACC', 'DEAD', 'DEAD', 'DEAD', 'DEAD', '✅'],
        ['  DEAD','DEAD', 'DEAD', 'DEAD', 'DEAD', '❌'],
      ]
    }
  },
}

const TABS = Object.keys(DFA_DEFINITIONS)

// ─── SVG Arrow Helper ─────────────────────────────────────────────────────────
function drawArrow(from, to, label, isDark, index) {
  const stroke = isDark ? '#4B5563' : '#9CA3AF'
  const textFill = isDark ? '#9CA3AF' : '#6B7280'
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2 - 18

  return (
    <g key={index}>
      <line
        x1={from.x + 32} y1={from.y}
        x2={to.x - 32}   y2={to.y}
        stroke={stroke} strokeWidth="1.5"
        markerEnd="url(#arr)"
      />
      <text x={label?.labelX ?? mx} y={label?.labelY ?? my}
        textAnchor="middle" fill={textFill}
        fontSize="9" fontFamily="monospace"
      >
        {label.label}
      </text>
    </g>
  )
}

// ─── Self Loop Helper ─────────────────────────────────────────────────────────
function drawSelfLoop(state, label, isDark, index) {
  const stroke = isDark ? '#4B5563' : '#9CA3AF'
  const textFill = isDark ? '#9CA3AF' : '#6B7280'
  return (
    <g key={index}>
      <path
        d={`M ${state.x - 15} ${state.y - 28}
            C ${state.x - 50} ${state.y - 80},
              ${state.x + 50} ${state.y - 80},
              ${state.x + 15} ${state.y - 28}`}
        fill="none" stroke={stroke} strokeWidth="1.5"
        markerEnd="url(#arr)"
      />
      <text x={state.x} y={state.y - 85}
        textAnchor="middle" fill={textFill}
        fontSize="9" fontFamily="monospace"
      >
        {label}
      </text>
    </g>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DFAVisualizer() {
  const [active, setActive]     = useState('IDENTIFIER')
  const [showTable, setShowTable] = useState(true)
  const { isDark }              = useTheme()
  const dfa                     = DFA_DEFINITIONS[active]

  const bg      = isDark ? '#030712' : '#F9FAFB'
  const cardBg  = isDark ? '#111827' : '#FFFFFF'
  const border  = isDark ? '#1F2937' : '#E5E7EB'
  const stroke  = isDark ? '#4B5563' : '#9CA3AF'
  const textMid = isDark ? '#9CA3AF' : '#6B7280'

  return (
    <div className={`rounded-xl border p-5 transition-colors duration-300`}
      style={{ background: cardBg, borderColor: border }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className={`text-sm font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            DFA State Diagram Visualizer
          </h2>
          <p className={`text-xs font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {dfa.formal}
          </p>
          <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
            {dfa.alphabet}
          </p>
        </div>
        <button
          onClick={() => setShowTable(p => !p)}
          className={`text-xs px-3 py-1 rounded-lg border font-mono transition-all
            ${isDark
              ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-blue-500/50'
              : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-blue-400'
            }`}
        >
          {showTable ? 'Hide Table' : 'Show Table'}
        </button>
      </div>

      {/* ── DFA Tabs ── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActive(tab)}
            className={`px-3 py-1 rounded-full text-xs font-mono border transition-all
              ${active === tab
                ? 'bg-blue-500 border-blue-400 text-white'
                : isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-gray-400'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Description ── */}
      <p className={`text-xs mb-4 font-mono leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {dfa.description}
      </p>

      {/* ── SVG Diagram ── */}
      <div className={`rounded-lg border overflow-x-auto mb-4`}
        style={{ background: bg, borderColor: border }}
      >
        <svg width="680" height="390" viewBox="0 0 680 390" className="w-full">
          <defs>
            <marker id="arr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={stroke} />
            </marker>
            <marker id="startArr" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>
          </defs>

          {/* ── Transitions ── */}
          {dfa.transitions.map((t, i) => {
            const from = dfa.states.find(s => s.id === t.from)
            const to   = dfa.states.find(s => s.id === t.to)
            if (!from || !to) return null
            if (t.isSelf) return drawSelfLoop(from, t.label, isDark, i)

            // Curved line for transitions going backwards or overlapping
            const dx = to.x - from.x
            const dy = to.y - from.y
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2

            return (
              <g key={i}>
                <line
                  x1={from.x + (dx > 0 ? 30 : -30)} y1={from.y + (dy > 0 ? 10 : dy < 0 ? -10 : 0)}
                  x2={to.x   - (dx > 0 ? 30 : -30)} y2={to.y   - (dy > 0 ? 10 : dy < 0 ? -10 : 0)}
                  stroke={stroke} strokeWidth="1.5"
                  markerEnd="url(#arr)"
                />
                <text
                  x={t.labelX ?? mx}
                  y={t.labelY ?? (my - 12)}
                  textAnchor="middle"
                  fill={textMid}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {t.label}
                </text>
              </g>
            )
          })}

          {/* ── States ── */}
          {dfa.states.map((state) => (
            <g key={state.id}>
              {/* Double ring for accept */}
              {state.isAccept && (
                <circle cx={state.x} cy={state.y} r={36}
                  fill="none" stroke="#22C55E" strokeWidth="1.5" opacity="0.6"
                />
              )}

              {/* Main circle */}
              <circle
                cx={state.x} cy={state.y} r={28}
                fill={
                  state.isAccept    ? (isDark ? '#14532D' : '#DCFCE7') :
                  state.id ==='DEAD'? (isDark ? '#450a0a' : '#FEE2E2') :
                  state.isStart     ? (isDark ? '#1e3a5f' : '#DBEAFE') :
                  isDark ? '#1F2937' : '#F3F4F6'
                }
                stroke={
                  state.isAccept    ? '#22C55E' :
                  state.id ==='DEAD'? '#EF4444' :
                  state.isStart     ? '#3B82F6' :
                  isDark ? '#374151' : '#D1D5DB'
                }
                strokeWidth="2"
              />

              {/* State label */}
              <text
                x={state.x} y={state.y + 4}
                textAnchor="middle"
                fill={
                  state.isAccept    ? '#22C55E' :
                  state.id ==='DEAD'? '#EF4444' :
                  isDark ? '#E5E7EB' : '#1F2937'
                }
                fontSize="11" fontWeight="bold" fontFamily="monospace"
              >
                {state.label}
              </text>

              {/* Start arrow */}
              {state.isStart && (
                <g>
                  <line
                    x1={state.x - 58} y1={state.y}
                    x2={state.x - 32} y2={state.y}
                    stroke="#3B82F6" strokeWidth="2"
                    markerEnd="url(#startArr)"
                  />
                  <text x={state.x - 61} y={state.y - 8}
                    textAnchor="middle" fill="#3B82F6"
                    fontSize="8" fontFamily="monospace"
                  >
                    start
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* ── Legend ── */}
          <g transform="translate(12, 350)">
            <circle cx="10" cy="10" r="8" fill={isDark ? '#1e3a5f':'#DBEAFE'} stroke="#3B82F6" strokeWidth="1.5"/>
            <text x="22" y="14" fill={textMid} fontSize="9" fontFamily="monospace">→ Start State (q₀)</text>

            <circle cx="130" cy="10" r="8" fill={isDark?'#14532D':'#DCFCE7'} stroke="#22C55E" strokeWidth="1.5"/>
            <circle cx="130" cy="10" r="12" fill="none" stroke="#22C55E" strokeWidth="1" opacity="0.5"/>
            <text x="146" y="14" fill={textMid} fontSize="9" fontFamily="monospace">* Accept State (F)</text>

            <circle cx="270" cy="10" r="8" fill={isDark?'#450a0a':'#FEE2E2'} stroke="#EF4444" strokeWidth="1.5"/>
            <text x="282" y="14" fill={textMid} fontSize="9" fontFamily="monospace">DEAD / Trap State</text>

            <text x="400" y="14" fill={textMid} fontSize="9" fontFamily="monospace">→ = Start Arrow (from nowhere)</text>
          </g>

        </svg>
      </div>

      {/* ── Transition Table ── */}
      {showTable && (
        <div className="overflow-x-auto">
          <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            δ — Transition Function Table
          </p>
          <table className={`w-full text-xs font-mono border-collapse`}>
            <thead>
              <tr className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>
                {dfa.table.headers.map((h, i) => (
                  <th key={i}
                    className={`px-3 py-2 text-left border font-bold
                      ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-600'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dfa.table.rows.map((row, i) => (
                <tr key={i}
                  className={`transition-colors
                    ${row[row.length-1] === '✅'
                      ? isDark ? 'bg-green-900/20' : 'bg-green-50'
                      : i % 2 === 0
                        ? isDark ? 'bg-gray-900/40' : 'bg-white'
                        : isDark ? 'bg-gray-800/30' : 'bg-gray-50'
                    }`}
                >
                  {row.map((cell, j) => (
                    <td key={j}
                      className={`px-3 py-1.5 border
                        ${isDark ? 'border-gray-800' : 'border-gray-200'}
                        ${j === 0
                          ? isDark ? 'text-blue-400 font-bold' : 'text-blue-600 font-bold'
                          : cell === 'DEAD'
                            ? 'text-red-400'
                            : cell === '✅'
                              ? 'text-green-500'
                              : cell === '❌'
                                ? isDark ? 'text-gray-600' : 'text-gray-400'
                                : isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            → = start state &nbsp;|&nbsp; * = accept state &nbsp;|&nbsp; DEAD = trap/reject state
          </p>
        </div>
      )}

    </div>
  )
}