// parser.ts
// Single-pass stack-based GEDCOM parser producing AST with ranges and pointer index.

import { lex } from "./lexer";
import type { Token } from "./lexer";
import type { ASTNode, ValidationError, Range } from "./types";

function rangeFromTokens(first: Token, last: Token): Range {
  return { start: first.start, end: last.end };
}

export function parseGedcom(text: string): {
  nodes: ASTNode[];
  errors: ValidationError[];
  pointerIndex: Map<string, ASTNode>;
} {
  const { perLine, errors: lexErrors } = lex(text);
  const nodes: ASTNode[] = [];
  const stack: ASTNode[] = [];
  const errors: ValidationError[] = [...lexErrors];
  const pointerIndex = new Map<string, ASTNode>();

  for (const { line, tokens } of perLine) {
    if (tokens.length === 0) continue; // empty line

    const levelTok = tokens.find((t) => t.type === "LEVEL");
    const tagTok = tokens.find((t) => t.type === "TAG");
    const ptrTok = tokens.find((t) => t.type === "POINTER");
    const valTok = tokens.find((t) => t.type === "VALUE");

    if (!levelTok || !tagTok) continue; // lexer already produced an error

    const level = parseInt(levelTok.value, 10);

    const node: ASTNode = {
      level,
      tag: tagTok.value,
      pointer: ptrTok?.value,
      value: valTok?.value,
      children: [],
      range: rangeFromTokens(levelTok, valTok ?? tagTok),
      line,
    };

    // Level jump check
    if (stack.length > 0) {
      const parent = stack[stack.length - 1];
      if (node.level > parent.level + 1) {
        errors.push({
          code: "GEDCOM006",
          message: `Level jump from ${parent.level} to ${node.level}`,
          range: {
            start: levelTok.start,
            end: levelTok.end,
          },
        });
      }
    }

    // Attach to AST using stack
    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      nodes.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);

    if (node.pointer) {
      pointerIndex.set(node.pointer, node);
    }
  }

  return { nodes, errors, pointerIndex };
}

export function findNodeByPointer(
  pointerIndex: Map<string, ASTNode>,
  id: string,
): ASTNode | undefined {
  return pointerIndex.get(id);
}
