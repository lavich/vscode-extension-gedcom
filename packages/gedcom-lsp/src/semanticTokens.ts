import {
  SemanticTokensBuilder,
  SemanticTokensLegend,
} from "vscode-languageserver";

import { Token, TokenType } from "gedcom-core/dist/lexer";

const tokenTypes: Record<TokenType, string> = {
  LEVEL: "number",
  POINTER: "variable",
  TAG: "keyword",
  VALUE: "string",
  EOL: "comment",
  UNKNOWN: "unknown",
};

const tokenModifiers: string[] = [];

export const legend: SemanticTokensLegend = {
  tokenTypes: Object.values(tokenTypes),
  tokenModifiers,
};

function encodeTokenType(type: TokenType): number {
  return Object.values(tokenTypes).indexOf(tokenTypes[type]);
}

export function buildSemanticTokens(
  perLine: {
    line: number;
    tokens: Token[];
  }[],
) {
  const builder = new SemanticTokensBuilder();

  perLine.forEach(({ tokens, line }) => {
    tokens.forEach((token) => {
      const tokenType = encodeTokenType(token.type);
      builder.push(
        line, // строка
        token.start.col, // позиция в строке
        token.end.col - token.start.col, // длина токена
        tokenType, // индекс типа
        0, // модификаторы (пусто)
      );
    });
  });

  return builder.build();
}
