// Check if character is a letter (a-z or A-Z)
export function isLetter(ch) {
  return /[a-zA-Z]/.test(ch);
}

// Check if character is a digit (0-9)
export function isDigit(ch) {
  return /[0-9]/.test(ch);
}

// Check if character is whitespace
export function isWhitespace(ch) {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r';
}

// Check if character is a hex digit (0-9, a-f, A-F)
export function isHexDigit(ch) {
  return /[0-9a-fA-F]/.test(ch);
}

// DFA for Identifier
// States: S0(start) → S1(accept) → DEAD
// Rule: starts with letter or _, followed by letters/digits/_

export function identifierDFA(input, start) {
  let pos = start;
  let state = 'S0';
  let lexeme = '';

  while (pos < input.length) {
    const ch = input[pos];

    if (state === 'S0') {
      if (isLetter(ch) || ch === '_') {
        state = 'S1';
        lexeme += ch;
        pos++;
      } else {
        // Cannot start identifier — reject
        return null;
      }
    }

    else if (state === 'S1') {
      if (isLetter(ch) || isDigit(ch) || ch === '_') {
        lexeme += ch;
        pos++;
      } else {
        // Retraction — this char belongs to next token
        break;
      }
    }
  }

  if (state === 'S1') {
    return { lexeme, endPos: pos };
  }

  return null;
}

// DFA for Character Literals ('a', '\n', '0')
// Rule: single quote, one character, closing single quote

export function charLiteralDFA(input, start) {
  if (input[start] !== "'") return null;

  let pos = start + 1;
  let lexeme = "'";

  if (pos >= input.length) return null;

  // Handle escape sequences like '\n' '\t' '\\'
  if (input[pos] === '\\') {
    lexeme += input[pos];
    pos++;
    if (pos >= input.length) return null;
    lexeme += input[pos];
    pos++;
  } else {
    // Regular single character
    lexeme += input[pos];
    pos++;
  }

  // Must close with single quote
  if (pos < input.length && input[pos] === "'") {
    lexeme += "'";
    pos++;
    return { lexeme, endPos: pos };
  }

  return null; // unclosed char literal
}

// DFA for Number Literals
// States: S0 → S1(int accept) → S2(dot seen) → S3(float accept)
// Rule: digits, optional dot followed by more digits

export function numberDFA(input, start) {
  let pos   = start;
  let state = 'S0';
  let lexeme = '';

  while (pos < input.length) {
    const ch = input[pos];

    if (state === 'S0') {
      if (isDigit(ch)) {
        state = 'S1';
        lexeme += ch;
        pos++;
      } else {
        return null;
      }
    }

    else if (state === 'S1') {

      // ── Hex Detection ─────────────────────────────
      // 0x or 0X prefix
      if (lexeme === '0' && (ch === 'x' || ch === 'X')) {
        state = 'HEX1';
        lexeme += ch;
        pos++;
      }

      else if (isDigit(ch)) {
        lexeme += ch;
        pos++;
      }

      else if (ch === '.') {
        state = 'S2';
        lexeme += ch;
        pos++;
      }

      else {
        break; // retract
      }
    }

    // ── Hex States ──────────────────────────────────
    else if (state === 'HEX1') {
      // Need at least one hex digit
      if (isHexDigit(ch)) {
        state = 'HEX2';
        lexeme += ch;
        pos++;
      } else {
        return null; // 0x with no digits = invalid
      }
    }

    else if (state === 'HEX2') {
      if (isHexDigit(ch)) {
        lexeme += ch;
        pos++;
      } else {
        break; // retract — hex number complete
      }
    }

    // ── Float States ────────────────────────────────
    else if (state === 'S2') {
      if (isDigit(ch)) {
        state = 'S3';
        lexeme += ch;
        pos++;
      } else {
        return null; // dot with no digits after
      }
    }

    else if (state === 'S3') {
      if (isDigit(ch)) {
        lexeme += ch;
        pos++;
      } else {
        break; // retract
      }
    }
  }

  // Accept states: S1 (int), S3 (float), HEX2 (hex)
  if (state === 'S1' || state === 'S3' || state === 'HEX2') {
    return { lexeme, endPos: pos };
  }

  return null;
}

// DFA for Operators
// Single: + - * /
// Double: == != <= >=
// Single with optional second: = < >

export function operatorDFA(input, start) {
  const ch   = input[start];
  const next = input[start + 1];

  // ── Compound Assignment ──────────────────────────
  // += -= *= /= %=
  if (['+', '-', '*', '/', '%'].includes(ch) && next === '=') {
    return { lexeme: ch + '=', endPos: start + 2 };
  }

  // ── Increment / Decrement ────────────────────────
  // ++ --
  if (ch === '+' && next === '+') return { lexeme: '++', endPos: start + 2 };
  if (ch === '-' && next === '-') return { lexeme: '--', endPos: start + 2 };

  // ── Logical Operators ────────────────────────────
  // && ||
  if (ch === '&' && next === '&') return { lexeme: '&&', endPos: start + 2 };
  if (ch === '|' && next === '|') return { lexeme: '||', endPos: start + 2 };

  // ── Bitwise Shift ────────────────────────────────
  // << >>
  if (ch === '<' && next === '<') return { lexeme: '<<', endPos: start + 2 };
  if (ch === '>' && next === '>') return { lexeme: '>>', endPos: start + 2 };

  // ── Comparison Operators ─────────────────────────
  // == != <= >=
  if (ch === '=' && next === '=') return { lexeme: '==', endPos: start + 2 };
  if (ch === '!' && next === '=') return { lexeme: '!=', endPos: start + 2 };
  if (ch === '<' && next === '=') return { lexeme: '<=', endPos: start + 2 };
  if (ch === '>' && next === '=') return { lexeme: '>=', endPos: start + 2 };

  // ── Single Operators ─────────────────────────────
  // + - * / % ~
  if (['+', '-', '*', '/', '%', '~'].includes(ch)) {
    return { lexeme: ch, endPos: start + 1 };
  }

  // ── Single Assignment ────────────────────────────
  if (ch === '=') return { lexeme: '=',  endPos: start + 1 };

  // ── Bitwise Single ───────────────────────────────
  // & | ^ 
  if (ch === '&') return { lexeme: '&', endPos: start + 1 };
  if (ch === '|') return { lexeme: '|', endPos: start + 1 };
  if (ch === '^') return { lexeme: '^', endPos: start + 1 };

  // ── Comparison Single ────────────────────────────
  if (ch === '<') return { lexeme: '<', endPos: start + 1 };
  if (ch === '>') return { lexeme: '>', endPos: start + 1 };

  // ── Logical NOT ──────────────────────────────────
  if (ch === '!') return { lexeme: '!', endPos: start + 1 };

  return null;
}

// DFA for String Literals
// States: S0 → S1(inside string) → ACCEPT
// Rule: starts with ", anything inside, ends with "

export function stringDFA(input, start) {
  if (input[start] !== '"') return null;

  let pos = start + 1; // move past opening "
  let lexeme = '"';
  let state = 'S1';

  while (pos < input.length) {
    const ch = input[pos];

    if (state === 'S1') {
      if (ch === '\n') {
        // Unclosed string — invalid
        return null;
      } else if (ch === '"') {
        // Closing quote found — accept
        lexeme += ch;
        pos++;
        return { lexeme, endPos: pos };
      } else {
        lexeme += ch;
        pos++;
      }
    }
  }

  // Reached end of input without closing "
  return null;
}

// DFA for Single Line Comment (//)
export function singleLineCommentDFA(input, start) {
  // Must start with //
  if (input[start] !== '/' || input[start + 1] !== '/') return null;

  let pos = start + 2; // skip past //
  let lexeme = '//';
  let state = 'S2';

  while (pos < input.length) {
    const ch = input[pos];

    if (state === 'S2') {
      if (ch === '\n') {
        // End of comment — accept
        lexeme += ch;
        pos++;
        return { lexeme, endPos: pos };
      } else {
        // Keep consuming
        lexeme += ch;
        pos++;
      }
    }
  }

  // End of input — comment was last line, still valid
  return { lexeme, endPos: pos };
}

// DFA for Block Comment (/* ... */)
export function blockCommentDFA(input, start) {
  // Must start with /*
  if (input[start] !== '/' || input[start + 1] !== '*') return null;

  let pos = start + 2; // skip past /*
  let lexeme = '/*';
  let state = 'S2';

  while (pos < input.length) {
    const ch = input[pos];

    if (state === 'S2') {
      if (ch === '*') {
        state = 'S3'; // possible end coming
        lexeme += ch;
        pos++;
      } else {
        lexeme += ch;
        pos++;
      }
    }

    else if (state === 'S3') {
      if (ch === '/') {
        // Closing */ found — accept
        lexeme += ch;
        pos++;
        return { lexeme, endPos: pos };
      } else if (ch === '*') {
        // Still in S3 — another star (handles /**/)
        lexeme += ch;
        pos++;
      } else {
        // Back to consuming
        state = 'S2';
        lexeme += ch;
        pos++;
      }
    }
  }

  // End of input without closing */ — invalid unclosed comment
  return null;
}

// DFA for Preprocessor Directives (#include, #define etc)
// Rule: starts with #, followed by letter, then anything till newline

export function directiveDFA(input, start) {
  // Must start with #
  if (input[start] !== '#') return null;

  let pos = start + 1;
  let lexeme = '#';
  let state = 'S1';

  while (pos < input.length) {
    const ch = input[pos];

    if (state === 'S1') {
      if (isLetter(ch)) {
        // Valid directive name starting
        state = 'S2';
        lexeme += ch;
        pos++;
      } else {
        // # not followed by letter — invalid
        return null;
      }
    }

    else if (state === 'S2') {
      if (ch === '\n') {
        // End of directive line
        return { lexeme, endPos: pos };
      } else {
        // Keep consuming entire line
        lexeme += ch;
        pos++;
      }
    }
  }

  // End of input — directive was last line
  if (state === 'S2') {
    return { lexeme, endPos: pos };
  }

  return null;
}