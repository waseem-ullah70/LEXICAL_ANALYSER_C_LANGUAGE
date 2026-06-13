import { useState } from 'react'
import { tokenize } from './engine/tokenizer.js'
import TokenTable from './components/TokenTable.jsx'
import StatsBar from './components/StatsBar.jsx'
import DFAVisualizer from './components/DFAVisualizer.jsx'
import ErrorPanel from './components/ErrorPanel.jsx'
import TestCaseSelector from './components/TestCaseSelector.jsx'

const SAMPLE_CODE = `#include <stdio.h>
#include <string.h>
#define MAX 100

/* Lexical Analyzer Demo Program */
int main(){
  // declare variables
  int x = 10;
  float pi = 3.14;
  char grade = 'A';
  char name[MAX];

  printf("Enter name: ");
  scanf("%s", name);

  int len = strlen(name);
  printf("Length: %d", len);

  if(x != 0){
    return x + 1;
  }

  return 0;
}`

import { useTheme } from './context/ThemeContext.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'

export default function App() {
  const { isDark } = useTheme()
  const [code, setCode]           = useState(SAMPLE_CODE)
  const [activeTab, setActiveTab] = useState('tokens')

  const tokens     = tokenize(code)
  const errorCount = tokens.filter(t => t.type === 'INVALID').length

  const handleClear = () => setCode('')
  const handleCopy  = () => {
    const text = tokens
      .map((t, i) => `${i + 1}. ${t.type} → "${t.lexeme}" [${t.line}:${t.col}]`)
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300
      ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}
    >

      {/* ── Header ── */}
      <header className={`px-6 py-4 border-b transition-colors duration-300
        ${isDark
          ? 'border-gray-800 bg-gray-900'
          : 'border-gray-200 bg-white shadow-sm'
        }`}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚙️</span>
              <h1 className="text-xl font-bold text-blue-500 tracking-wide">
                Lexical Analyzer Engine
              </h1>
              <span className={`text-xs px-2 py-0.5 rounded-full border
                ${isDark
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : 'bg-blue-100 text-blue-600 border-blue-200'
                }`}
              >
                v1.0
              </span>
            </div>
            <p className={`text-xs mt-1 ml-9
              ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Theory of Automata — DFA Based C Language Tokenizer
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono
              ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              {tokens.length} tokens
            </span>

            {errorCount > 0 ? (
              <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-mono">
                ⚠ {errorCount} error{errorCount > 1 ? 's' : ''}
              </span>
            ) : tokens.length > 0 ? (
              <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-mono">
                ✓ Clean
              </span>
            ) : null}

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Editor Panel ── */}
      <div className={`flex border-b transition-colors duration-300
        ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
        style={{ height: '420px' }}
      >

        {/* Left — Code Editor */}
        <div className={`w-1/2 flex flex-col border-r transition-colors duration-300
          ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
        >
          <div className={`px-4 py-2 border-b flex items-center justify-between transition-colors duration-300
            ${isDark
              ? 'bg-gray-900 border-gray-800'
              : 'bg-gray-100 border-gray-200'
            }`}
          >
            <span className={`text-xs font-mono uppercase tracking-widest
              ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              📝 Source Code
            </span>
            <button
              onClick={handleClear}
              className={`text-xs transition-colors px-2 py-0.5 rounded border
                ${isDark
                  ? 'text-gray-500 hover:text-red-400 border-gray-700 hover:border-red-500/50'
                  : 'text-gray-400 hover:text-red-500 border-gray-300 hover:border-red-300'
                }`}
            >
              Clear
            </button>
          </div>

          {/* Editor with line numbers */}
          <div className={`flex flex-1 overflow-hidden font-mono text-sm transition-colors duration-300
            ${isDark ? 'bg-gray-950' : 'bg-white'}`}
          >
            <div className={`text-right px-3 py-4 select-none leading-relaxed min-w-10 border-r
              ${isDark
                ? 'bg-gray-900/50 text-gray-600 border-gray-800/50'
                : 'bg-gray-50 text-gray-300 border-gray-200'
              }`}
            >
              {code.split('\n').map((_, i) => (
                <div key={i} className="leading-relaxed">{i + 1}</div>
              ))}
            </div>
            <textarea
              className={`flex-1 text-sm p-4 resize-none outline-none leading-relaxed transition-colors duration-300
                ${isDark
                  ? 'bg-gray-950 text-green-300'
                  : 'bg-white text-gray-800'
                }`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter C code here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right — Token Stream */}
        <div className="w-1/2 flex flex-col">
          <div className={`px-4 py-2 border-b flex items-center justify-between transition-colors duration-300
            ${isDark
              ? 'bg-gray-900 border-gray-800'
              : 'bg-gray-100 border-gray-200'
            }`}
          >
            <span className={`text-xs font-mono uppercase tracking-widest
              ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              🔢 Token Stream
            </span>
            <button
              onClick={handleCopy}
              className={`text-xs transition-colors px-2 py-0.5 rounded border
                ${isDark
                  ? 'text-gray-500 hover:text-blue-400 border-gray-700 hover:border-blue-500/50'
                  : 'text-gray-400 hover:text-blue-500 border-gray-300 hover:border-blue-300'
                }`}
            >
              Copy
            </button>
          </div>
          <div className="flex-1 overflow-hidden p-3">
            <TokenTable tokens={tokens} />
          </div>
        </div>

      </div>

      {/* ── Stats Bar ── */}
      <StatsBar tokens={tokens} />

      {/* ── Bottom Tab Panel ── */}
      <div className="flex-1 p-6">
        <div className="flex gap-2 mb-5">
          {[
            { id: 'tokens', label: '📂 Test Dataset'   },
            { id: 'errors', label: '🔴 Error Report'   },
            { id: 'dfa',    label: '🔵 DFA Visualizer' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-mono border transition-all
                ${activeTab === tab.id
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                  : isDark
                    ? 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-400'
                }`}
            >
              {tab.label}
              {tab.id === 'errors' && errorCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {errorCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'tokens' && <TestCaseSelector onSelect={setCode} />}
        {activeTab === 'errors' && <ErrorPanel tokens={tokens} />}
        {activeTab === 'dfa'    && <DFAVisualizer />}
      </div>

    </div>
  )
}