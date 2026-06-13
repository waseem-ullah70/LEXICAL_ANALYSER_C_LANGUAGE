import {
    isLetter,
    isDigit,
    isWhitespace,
    identifierDFA,
    numberDFA,
    operatorDFA,
    charLiteralDFA,
    stringDFA,
    singleLineCommentDFA,
    blockCommentDFA,
    directiveDFA
} from './dfa.js';

import {
    KEYWORDS,
    PUNCTUATIONS,
    SINGLE_OPERATORS,
    DOUBLE_OPERATOR_STARTERS,
    BUILTIN_FUNCTIONS
} from './keywords.js';

export function tokenize(input) {
    const tokens = [];
    let pos = 0;
    let line = 1;      // ← track line
    let col = 1;       // ← track column

    while (pos < input.length) {

        // ─── Skip Whitespace ─────────────────────────────
        if (isWhitespace(input[pos])) {
            if (input[pos] === '\n') {
                line++;        // new line found
                col = 1;       // reset column
            } else {
                col++;
            }
            pos++;
            continue;
        }

        const ch = input[pos];
        const tokenStart = { line, col };  // ← save start position

        // ─── Preprocessor Directives ─────────────────────
        if (ch === '#') {
            const result = directiveDFA(input, pos);
            if (result) {
                tokens.push({
                    type: 'DIRECTIVE',
                    lexeme: result.lexeme,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                // Update line/col after consuming
                for (let i = pos; i < result.endPos; i++) {
                    if (input[i] === '\n') { line++; col = 1; }
                    else col++;
                }
                pos = result.endPos;
            } else {
                tokens.push({
                    type: 'INVALID',
                    lexeme: ch,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                pos++; col++;
            }
            continue;
        }

        // ─── Comments ────────────────────────────────────
        if (ch === '/' && (input[pos + 1] === '/' || input[pos + 1] === '*')) {
            if (input[pos + 1] === '*') {
                const result = blockCommentDFA(input, pos);
                if (result) {
                    tokens.push({
                        type: 'COMMENT',
                        lexeme: result.lexeme,
                        line: tokenStart.line,
                        col: tokenStart.col
                    });
                    for (let i = pos; i < result.endPos; i++) {
                        if (input[i] === '\n') { line++; col = 1; }
                        else col++;
                    }
                    pos = result.endPos;
                } else {
                    tokens.push({
                        type: 'INVALID',
                        lexeme: '/*',
                        line: tokenStart.line,
                        col: tokenStart.col
                    });
                    pos += 2; col += 2;
                }
                continue;
            }
            if (input[pos + 1] === '/') {
                const result = singleLineCommentDFA(input, pos);
                if (result) {
                    tokens.push({
                        type: 'COMMENT',
                        lexeme: result.lexeme,
                        line: tokenStart.line,
                        col: tokenStart.col
                    });
                    for (let i = pos; i < result.endPos; i++) {
                        if (input[i] === '\n') { line++; col = 1; }
                        else col++;
                    }
                    pos = result.endPos;
                }
                continue;
            }
        }

        // ─── Character Literal ───────────────────────────
        if (ch === "'") {
            const result = charLiteralDFA(input, pos);
            if (result) {
                tokens.push({
                    type: 'CHAR_LITERAL',
                    lexeme: result.lexeme,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                col += result.lexeme.length;
                pos = result.endPos;
            } else {
                tokens.push({
                    type: 'INVALID',
                    lexeme: ch,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                pos++; col++;
            }
            continue;
        }
        // ─── String Literal ──────────────────────────────
        if (ch === '"') {
            const result = stringDFA(input, pos);
            if (result) {
                tokens.push({
                    type: 'STRING',
                    lexeme: result.lexeme,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                col += result.lexeme.length;
                pos = result.endPos;
            } else {
                tokens.push({
                    type: 'INVALID',
                    lexeme: ch,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                pos++; col++;
            }
            continue;
        }

        // ─── Identifier or Keyword ───────────────────────
        if (isLetter(ch) || ch === '_') {
            const result = identifierDFA(input, pos);
            if (result) {
                let type = 'IDENTIFIER';
                if (KEYWORDS.includes(result.lexeme)) {
                    type = 'KEYWORD';
                } else if (BUILTIN_FUNCTIONS.includes(result.lexeme)) {
                    type = 'BUILTIN_FUNCTION';
                }
                tokens.push({
                    type,
                    lexeme: result.lexeme,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                col += result.lexeme.length;
                pos = result.endPos;
            } else {
                tokens.push({
                    type: 'INVALID',
                    lexeme: ch,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                pos++; col++;
            }
            continue;
        }

        // ─── Number Literal ──────────────────────────────
        if (isDigit(ch)) {
            const result = numberDFA(input, pos);
            if (result) {
                const nextChar = input[result.endPos];
                if (nextChar && isLetter(nextChar)) {
                    let invalidLexeme = '';
                    let tempPos = pos;
                    while (
                        tempPos < input.length &&
                        (isDigit(input[tempPos]) || isLetter(input[tempPos]) || input[tempPos] === '_')
                    ) {
                        invalidLexeme += input[tempPos];
                        tempPos++;
                    }
                    tokens.push({
                        type: 'INVALID',
                        lexeme: invalidLexeme,
                        line: tokenStart.line,
                        col: tokenStart.col
                    });
                    col += invalidLexeme.length;
                    pos = tempPos;
                } else {
                    tokens.push({
                        type: 'NUMBER',
                        lexeme: result.lexeme,
                        line: tokenStart.line,
                        col: tokenStart.col
                    });
                    col += result.lexeme.length;
                    pos = result.endPos;
                }
            } else {
                tokens.push({
                    type: 'INVALID',
                    lexeme: ch,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                pos++; col++;
            }
            continue;
        }

        // ─── Operator ────────────────────────────────────
        // ─── Operator ────────────────────────────────────
        if (
            SINGLE_OPERATORS.includes(ch) ||
            DOUBLE_OPERATOR_STARTERS.includes(ch) ||
            ch === '&' || ch === '|' || ch === '^' ||
            ch === '!' || ch === '~'
        ) {
            const result = operatorDFA(input, pos);
            if (result) {
                tokens.push({
                    type: 'OPERATOR',
                    lexeme: result.lexeme,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                col += result.lexeme.length;
                pos = result.endPos;
            } else {
                tokens.push({
                    type: 'INVALID',
                    lexeme: ch,
                    line: tokenStart.line,
                    col: tokenStart.col
                });
                pos++; col++;
            }
            continue;
        }

        // ─── Punctuation ─────────────────────────────────
        if (PUNCTUATIONS.includes(ch)) {
            tokens.push({
                type: 'PUNCTUATION',
                lexeme: ch,
                line: tokenStart.line,
                col: tokenStart.col
            });
            pos++; col++;
            continue;
        }

        // ─── Invalid Token ────────────────────────────────
        tokens.push({
            type: 'INVALID',
            lexeme: ch,
            line: tokenStart.line,
            col: tokenStart.col
        });
        pos++; col++;
    }

    return tokens;
}