import { TokenKind } from "../types";

export const tokenTypes = [
  "number",
  "variable",
  "keyword",
  "string",
  "comment",
  "unknown",
] as const;

export const tokenModifiers = ["declaration", "readonly", "reference"] as const;

export const legend = {
  tokenTypes: [...tokenTypes],
  tokenModifiers: [...tokenModifiers],
};

const tokenTypeMap = new Map(tokenTypes.map((t, i) => [t, i]));
const tokenModifierMap = new Map(tokenModifiers.map((m, i) => [m, i]));

const tokenMap: Record<TokenKind, (typeof tokenTypes)[number]> = {
  LEVEL: "number",
  POINTER: "variable",
  XREF: "variable",
  TAG: "keyword",
  VALUE: "string",
  EOL: "comment",
  UNKNOWN: "unknown",
};

const tokenModifiersMap: Record<TokenKind, (typeof tokenModifiers)[number][]> =
  {
    LEVEL: [],
    POINTER: ["declaration"],
    XREF: ["reference"],
    TAG: [],
    VALUE: [],
    EOL: [],
    UNKNOWN: [],
  };

export function tokenTypeIndex(kind: TokenKind): number {
  const idx = tokenTypeMap.get(tokenMap[kind]);
  if (idx === undefined) {
    throw new Error(`Unknown token type: ${tokenMap[kind]}`);
  }
  return idx;
}

export function modifierMask(
  kind: TokenKind
): number {
  let mask = 0;
  for (const m of tokenModifiersMap[kind]) {
    const idx = tokenModifierMap.get(m);
    if (idx !== undefined) {
      mask |= 1 << idx;
    }
  }
  return mask;
}
