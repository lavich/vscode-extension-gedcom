import { FoldingRange } from "vscode-languageserver";
import { ASTNode } from "../../../core";

export const levelFolding = (nodes: ASTNode[]): FoldingRange[] => {
  return nodes.flatMap((node) => {
    if (node.children.length === 0) return [];

    const nodeFoldingRange = {
      startLine: node.range.start.line,
      endLine: node.range.end.line,
    };
    return [nodeFoldingRange, ...levelFolding(node.children)];
  });
};
