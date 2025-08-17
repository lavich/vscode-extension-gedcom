import { ASTNode } from "./types";

type FoldingRange = { startLine: number; endLine: number };

export const levelFolding = (nodes: ASTNode[]): FoldingRange[] => {
  return nodes.flatMap((node) => {
    const ranges = levelFolding(node.children);
    if (node.children.length > 0) {
      const startLine = node.line;
      const endLine = Math.max(...node.children.map((c) => getEndLine(c)));
      ranges.push({ startLine, endLine });
    }
    return ranges;
  });
};

const getEndLine = (node: ASTNode): number => {
  if (node.children.length === 0) return node.line;
  return Math.max(...node.children.map(getEndLine));
};
