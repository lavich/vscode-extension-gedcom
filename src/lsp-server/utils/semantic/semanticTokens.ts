import { ASTNode, Token } from "../../../core";
import { tokenTypeIndex, modifierMask } from "./legend";

type SemanticToken = {
  line: number;
  char: number;
  length: number;
  tokenType: number;
  tokenModifiers: number;
};

const tokenToSemanticToken = (token: Token): SemanticToken => ({
  line: token.range.start.line,
  char: token.range.start.character,
  length: token.range.end.character - token.range.start.character,
  tokenType: tokenTypeIndex(token.kind),
  tokenModifiers: modifierMask(token.kind),
});

export function semanticTokens(nodes: ASTNode[]): SemanticToken[] {
  return nodes.flatMap((node) => {
    return [
      ...node.tokens.map(tokenToSemanticToken),
      ...semanticTokens(node.children),
    ];
  });
}
