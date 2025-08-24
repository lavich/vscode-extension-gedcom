import { lex } from "./lexer";
import type { ASTNode, ValidationError, Range, Token } from "../types";

function rangeFromTokens(first: Token, last: Token): Range {
  return { start: first.range.start, end: last.range.end };
}

const fixRangeEndForParent = (node: ASTNode) => {
  if (node.parent) {
    node.parent.range.end = { ...node.range.end };
    fixRangeEndForParent(node.parent);
  }
};

function attachNode(
  stack: ASTNode[],
  root: ASTNode[],
  node: ASTNode,
  errors: ValidationError[]
) {
  if (stack.length > 0 && node.level > stack[stack.length - 1].level + 1) {
    errors.push({
      code: "PAR001",
      message: `Invalid level jump: from ${stack[stack.length - 1].level} to ${
        node.level
      }`,
      level: "error",
      range: node.range,
    });
  }

  while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
    stack.pop();
  }

  if (stack.length === 0) {
    root.push(node);
    node.parent = undefined;
  } else {
    const parent = stack[stack.length - 1];
    parent.children.push(node);
    node.parent = parent;
    fixRangeEndForParent(node);
  }

  stack.push(node);
}

export interface ParseResult {
  nodes: ASTNode[];
  errors: ValidationError[];
  pointerIndex: Map<string, ASTNode>;
  xrefsIndex: Map<string, ASTNode[]>;
}

type Pointer = string;

export function parseGedcom(text: string): ParseResult {
  const { perLine, errors: lexErrors } = lex(text);
  const nodes: ASTNode[] = [];
  const stack: ASTNode[] = [];
  const pointerIndex = new Map<Pointer, ASTNode>();
  const xrefsIndex = new Map<Pointer, ASTNode[]>();
  const errors: ValidationError[] = [...lexErrors];

  for (const { tokens } of perLine) {
    if (tokens.length === 0) continue;

    const levelToken = tokens.find((t) => t.kind === "LEVEL");
    const tagToken = tokens.find((t) => t.kind === "TAG");
    const pointerToken = tokens.find((t) => t.kind === "POINTER");
    const valueTokens = tokens.filter((t) => t.kind === "VALUE");
    const xrefTokens = tokens.filter((t) => t.kind === "XREF");

    if (!levelToken || !tagToken) {
      continue;
    }

    const level = parseInt(levelToken.value, 10);
    const lastTok = tokens[tokens.length - 1];

    const node: ASTNode = {
      tokens,
      range: rangeFromTokens(levelToken, lastTok),
      level,
      tag: tagToken.value,
      pointer: pointerToken?.value,
      values: valueTokens.map((t) => t.value),
      xrefs: xrefTokens.map((t) => t.value),
      children: [],
      parent: undefined,
    };

    attachNode(stack, nodes, node, errors);

    if (pointerToken) {
      if (pointerIndex.has(pointerToken.value)) {
        errors.push({
          code: "PAR002",
          message: `Duplicate pointer ${node.pointer}`,
          level: "error",
          range: pointerToken.range,
        });
      } else {
        pointerIndex.set(pointerToken.value, node);
      }
    }

    xrefTokens?.forEach((xref) => {
      const nodes = xrefsIndex.get(xref.value) || [];
      xrefsIndex.set(xref.value, [...nodes, node]);
    });
  }

  return { nodes, errors, pointerIndex, xrefsIndex };
}
