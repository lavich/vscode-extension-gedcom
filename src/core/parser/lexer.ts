import type { Position, Token, ValidationError } from "../types";

type LexResult = {
  tokens: Token[];
  errors: ValidationError[];
};

const makePos = (line: number, col: number): Position => ({
  line,
  character: col,
});

function pushError(
  errors: ValidationError[],
  code: string,
  message: string,
  line: number,
  startCol: number,
  endCol?: number
) {
  const p1 = makePos(line, startCol);
  const p2 = makePos(line, endCol ?? startCol);
  errors.push({ code, message, range: { start: p1, end: p2 } });
}

// --- READERS ---

function readLevel(
  line: string,
  i: number,
  lineNo: number,
  tokens: Token[],
  errors: ValidationError[]
) {
  const m = /^(\d+)/.exec(line.slice(i));
  if (!m) {
    pushError(errors, "LEX001", "Missing level", lineNo, i);
    return line.length;
  }
  const value = m[1];
  tokens.push({
    kind: "LEVEL",
    value,
    start: makePos(lineNo, i),
    end: makePos(lineNo, i + value.length),
  });
  return i + value.length;
}

function skipSpaces(line: string, i: number): number {
  while (i < line.length && line[i] === " ") i++;
  return i;
}

function readPointer(
  line: string,
  i: number,
  lineNo: number,
  tokens: Token[],
  errors: ValidationError[]
) {
  if (line[i] !== "@") return i;

  const m = /^(@[^@]+@)/.exec(line.slice(i));
  if (!m) {
    pushError(errors, "LEX004", "Unterminated pointer", lineNo, i);
    return line.length;
  }

  const ptr = m[1];
  tokens.push({
    kind: "POINTER",
    value: ptr,
    start: makePos(lineNo, i),
    end: makePos(lineNo, i + ptr.length),
  });
  return i + ptr.length;
}

function readTag(
  line: string,
  i: number,
  lineNo: number,
  tokens: Token[],
  errors: ValidationError[]
) {
  const m = /^([A-Z0-9_]+)/.exec(line.slice(i));
  if (!m) {
    pushError(errors, "LEX005", "Missing tag", lineNo, i);
    return line.length;
  }
  const tag = m[1];
  tokens.push({
    kind: "TAG",
    value: tag,
    start: makePos(lineNo, i),
    end: makePos(lineNo, i + tag.length),
  });
  return i + tag.length;
}

function readValue(line: string, i: number, lineNo: number, tokens: Token[]) {
  if (i >= line.length) return i;

  i = skipSpaces(line, i);
  const valStart = i;
  const rawValue = line.slice(i);

  const xrefRegex = /@[^@]+@/g;
  let lastIndex = 0;

  for (const m of rawValue.matchAll(xrefRegex)) {
    if (m.index! > lastIndex) {
      tokens.push({
        kind: "VALUE",
        value: rawValue.slice(lastIndex, m.index),
        start: makePos(lineNo, valStart + lastIndex),
        end: makePos(lineNo, valStart + m.index),
      });
    }
    tokens.push({
      kind: "XREF",
      value: m[0],
      start: makePos(lineNo, valStart + m.index!),
      end: makePos(lineNo, valStart + m.index! + m[0].length),
    });
    lastIndex = m.index! + m[0].length;
  }

  if (lastIndex < rawValue.length) {
    tokens.push({
      kind: "VALUE",
      value: rawValue.slice(lastIndex),
      start: makePos(lineNo, valStart + lastIndex),
      end: makePos(lineNo, line.length),
    });
  }

  return line.length;
}

// --- MAIN ---

export function lexLine(line: string, lineNo: number): LexResult {
  const tokens: Token[] = [];
  const errors: ValidationError[] = [];

  // --- empty line ---
  if (line.trim() === "") {
    return { tokens, errors };
  }

  let i = 0;

  // LEVEL
  i = readLevel(line, i, lineNo, tokens, errors);
  i = skipSpaces(line, i);

  // POINTER (optional)
  if (line[i] === "@") {
    i = readPointer(line, i, lineNo, tokens, errors);
    i = skipSpaces(line, i);
  }

  // TAG
  i = readTag(line, i, lineNo, tokens, errors);

  // VALUE
  readValue(line, i, lineNo, tokens);

  return { tokens, errors };
}

export function lex(text: string) {
  const lines = text.split(/\r?\n/);
  const perLine: { line: number; tokens: Token[] }[] = [];
  const errors: ValidationError[] = [];

  for (let li = 0; li < lines.length; li++) {
    const { tokens, errors: errs } = lexLine(lines[li], li);
    perLine.push({ line: li, tokens });
    errors.push(...errs);
  }

  return { perLine, errors };
}
