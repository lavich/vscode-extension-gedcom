// parser.ts
import { lex } from "./lexer";
import type { Token } from "./lexer";
import type { ASTNode, ValidationError, Range } from "./types";

function rangeFromTokens(first: Token, last: Token): Range {
  return { start: first.start, end: last.end };
}

function attachNode(stack: ASTNode[], root: ASTNode[], node: ASTNode) {
  while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
    stack.pop();
  }

  if (stack.length === 0) {
    root.push(node);
  } else {
    stack[stack.length - 1].children.push(node);
  }

  stack.push(node);
}

export interface ParseResult {
  nodes: ASTNode[];
  errors: ValidationError[];
  pointerIndex: Map<string, ASTNode>;
}

export function parseGedcom(text: string): ParseResult {
  const { perLine, errors: lexErrors } = lex(text);
  const nodes: ASTNode[] = [];
  const stack: ASTNode[] = [];
  const pointerIndex = new Map<string, ASTNode>();

  for (const { line, tokens } of perLine) {
    if (tokens.length === 0) continue;

    let levelTok: Token | undefined;
    let tagTok: Token | undefined;
    let ptrTok: Token | undefined;
    let valTok: Token | undefined;

    for (const t of tokens) {
      switch (t.type) {
        case "LEVEL":
          levelTok = t;
          break;
        case "TAG":
          tagTok = t;
          break;
        case "POINTER":
          ptrTok = t;
          break;
        case "VALUE":
          valTok = t;
          break;
      }
    }

    if (!levelTok || !tagTok) continue;

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

    attachNode(stack, nodes, node);

    if (node.pointer) {
      pointerIndex.set(node.pointer, node);
    }
  }

  return { nodes, errors: [...lexErrors], pointerIndex };
}
