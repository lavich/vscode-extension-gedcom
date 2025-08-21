// lexer.ts
import type { Pos, Token, ValidationError } from "../types";

export function lexLine(
  lineText: string,
  lineNumber: number,
): { tokens: Token[]; error?: ValidationError } {
  const tokens: Token[] = [];
  let i = 0;
  const len = lineText.length;

  const makePos = (col: number): Pos => ({
    line: lineNumber,
    character: col,
  });

  // --- LEVEL ---
  let levelStr = "";
  while (i < len && /[0-9]/.test(lineText.charAt(i))) {
    levelStr += lineText.charAt(i);
    i++;
  }
  if (!levelStr.length) {
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
    kind: "LEVEL",
    value: levelStr,
    start: makePos(0),
    end: makePos(i),
  });

  if (i < len && lineText.charAt(i) === " ") i++;
  else if (i < len) {
    const p = makePos(i);
    return {
      tokens,
      error: {
        code: "LEX002",
        message: "Missing space after level",
        range: { start: p, end: p },
      },
    };
  }

  // --- POINTER (start of line) ---
  if (i < len && lineText.charAt(i) === "@") {
    const startCol = i;
    i++;
    while (i < len && lineText.charAt(i) !== "@") i++;
    if (i < len && lineText.charAt(i) === "@") {
      i++;
      const ptr = lineText.slice(startCol, i);
      tokens.push({
        kind: "POINTER",
        value: ptr,
        start: makePos(startCol),
        end: makePos(i),
      });
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

  // --- TAG ---
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
    kind: "TAG",
    value: tag,
    start: makePos(tagStart),
    end: makePos(i),
  });

  // --- VALUE + XREF inside VALUE ---
  let valueToken: Token | undefined;
  if (i < len) {
    if (lineText.charAt(i) === " ") i++;
    const valStart = i;
    const val = lineText.slice(i).trim();

    const xrefRegex = /^@[^@]+@$/; // только одиночный XREF
    if (xrefRegex.test(val)) {
      // если значение - это только XREF
      tokens.push({
        kind: "XREF",
        value: val,
        start: makePos(valStart),
        end: makePos(len),
      });
    } else if (val.length) {
      valueToken = {
        kind: "VALUE",
        value: val,
        start: makePos(valStart),
        end: makePos(len),
      };
      tokens.push(valueToken);
    }
  }

  return { tokens };
}

export function lex(text: string) {
  const lines = text.split(/\r?\n/);
  const perLine: { line: number; tokens: Token[] }[] = [];
  const errors: ValidationError[] = [];
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const { tokens, error } = lexLine(line, li);
    perLine.push({ line: li, tokens });
    if (error) errors.push(error);
  }
  return { perLine, errors };
}
