import { ASTNode, Position } from "../types";

function positionInRange(
  pos: Position,
  { start, end }: { start: Position; end: Position }
): boolean {
  if (pos.line < start.line || pos.line > end.line) return false;
  if (pos.line === start.line && pos.character < start.character) return false;
  if (pos.line === end.line && pos.character > end.character) return false;
  return true;
}

export function findNodeAtPosition(
  nodes: ASTNode[],
  pos: Position
): ASTNode | null {
  let found: ASTNode | null = null;

  function visit(node: ASTNode) {
    if (positionInRange(pos, node.range)) {
      found = node;
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  for (const root of nodes) {
    visit(root);
  }

  return found;
}
