// lexer.ts
// GEDCOM lexer: tokenize lines into LEVEL, POINTER, TAG, VALUE tokens with positions.
// Exports: Token, TokenType, lexLine, lex

import type { Pos, Range } from "./types";

export type TokenType =
  | "LEVEL"
  | "POINTER"
  | "TAG"
  | "VALUE"
  | "EOL"
  | "UNKNOWN";

export interface Token {
  type: TokenType;
  value: string;
  start: Pos;
  end: Pos;
}

export interface LexError {
  code: string;
  message: string;
  range: Range;
}

/**
 * Lex a single line of GEDCOM and return tokens + optional lexical error.
 * lineText - raw line (without trailing newline)
 * lineNumber - 0-based
 * lineOffset - absolute character offset of line start in full document
 */
export function lexLine(
  lineText: string,
  lineNumber: number,
  lineOffset: number,
): { tokens: Token[]; error?: LexError } {
  const tokens: Token[] = [];
  let i = 0;
  const len = lineText.length;

  const makePos = (col: number): Pos => ({
    line: lineNumber,
    col,
    offset: lineOffset + col,
  });

  // read level: one or more digits
  let levelStr = "";
  while (i < len && /[0-9]/.test(lineText.charAt(i))) {
    levelStr += lineText.charAt(i);
    i++;
  }

  if (levelStr.length === 0) {
    const p = makePos(0);
    return {
      tokens,
      error: {
        code: "LEX001",
        message: "Missing level",
        range: { start: p, end: p },
      },
    };
  }

  tokens.push({
    type: "LEVEL",
    value: levelStr,
    start: makePos(0),
    end: makePos(i),
  });

  // expect a space after level per GEDCOM convention
  if (i < len && lineText.charAt(i) === " ") {
    i++; // skip separator
  } else if (i < len) {
    const p = makePos(i);
    return {
      tokens,
      error: {
        code: "LEX002",
        message: "Missing space after level",
        range: { start: p, end: p },
      },
    };
  } else {
    const p = makePos(i);
    return {
      tokens,
      error: {
        code: "LEX003",
        message: "Line ends after level (missing tag)",
        range: { start: p, end: p },
      },
    };
  }

  // optional pointer: starts and ends with '@'
  if (i < len && lineText.charAt(i) === "@") {
    const startCol = i;
    i++; // skip opening @
    while (i < len && lineText.charAt(i) !== "@") i++;
    if (i < len && lineText.charAt(i) === "@") {
      i++; // include closing @
      const ptr = lineText.slice(startCol, i);
      tokens.push({
        type: "POINTER",
        value: ptr,
        start: makePos(startCol),
        end: makePos(i),
      });
      // optional single space after pointer
      if (i < len && lineText.charAt(i) === " ") i++;
    } else {
      const p = makePos(startCol);
      return {
        tokens,
        error: {
          code: "LEX004",
          message: "Unterminated pointer",
          range: { start: p, end: p },
        },
      };
    }
  }

  // tag: sequence of non-space characters
  const tagStart = i;
  while (i < len && lineText.charAt(i) !== " ") i++;
  if (i === tagStart) {
    const p = makePos(i);
    return {
      tokens,
      error: {
        code: "LEX005",
        message: "Missing tag",
        range: { start: p, end: p },
      },
    };
  }
  const tag = lineText.slice(tagStart, i);
  tokens.push({
    type: "TAG",
    value: tag,
    start: makePos(tagStart),
    end: makePos(i),
  });

  // remainder is value (may be empty)
  if (i < len) {
    // skip a single space
    if (lineText.charAt(i) === " ") i++;
    const valStart = i;
    const val = lineText.slice(i);
    tokens.push({
      type: "VALUE",
      value: val,
      start: makePos(valStart),
      end: makePos(len),
    });
  }

  return { tokens };
}

/**
 * Lex full text (split into lines). Returns per-line tokens and collected errors.
 * Keeps empty lines as entries with empty token arrays.
 */
export function lex(text: string) {
  const lines = text.split(/\r?\n/);
  const perLine: { line: number; tokens: Token[] }[] = [];
  const errors: LexError[] = [];
  let offset = 0;
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const { tokens, error } = lexLine(line, li, offset);
    perLine.push({ line: li, tokens });
    if (error) errors.push(error);
    offset += line.length + 1; // +1 for newline
  }
  return { perLine, errors };
}
