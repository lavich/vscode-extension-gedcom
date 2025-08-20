import { ASTNode, TokenKind, Token } from "../types";

const tokenTypes = [
  "number",
  "variable",
  "keyword",
  "string",
  "comment",
  "unknown",
];

const tokenModifiers: string[] = [];

export const legend = {
  tokenTypes,
  tokenModifiers,
};

const tokenMap: Record<TokenKind, string> = {
  LEVEL: "number",
  POINTER: "variable",
  XREF: "variable",
  TAG: "keyword",
  VALUE: "string",
  EOL: "comment",
  UNKNOWN: "unknown",
};

function encodeTokenType(type: TokenKind): number {
  return tokenTypes.indexOf(tokenMap[type]);
}

type SemanticToken = {
  line: number;
  char: number;
  length: number;
  tokenType: number;
  tokenModifiers: number;
};

const tokenToSemanticToken = (token: Token): SemanticToken => ({
  line: token.start.line,
  char: token.start.character,
  length: token.end.character - token.start.character,
  tokenType: encodeTokenType(token.kind),
  tokenModifiers: 0,
});

export function semanticTokens(nodes: ASTNode[]): SemanticToken[] {
  return nodes.flatMap((node) => {
    return [...node.tokens.map(tokenToSemanticToken), ...semanticTokens(node.children)];
  });
}
