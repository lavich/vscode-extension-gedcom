import { CstNode } from "chevrotain";
import { CstElement, IToken } from "@chevrotain/types";
import { parser } from "./parser";

const BaseGedcomVisitor = parser.getBaseCstVisitorConstructor();

export interface Range {
  startCharacter: number;
  endCharacter: number;
}

interface ASTToken {
  range: Range;
  value: string;
}

interface GedcomNode {
  line?: number;
  level?: ASTToken;
  tag?: ASTToken;
  pointer?: ASTToken;
  xref?: ASTToken;
  value?: ASTToken;
  children: GedcomNode[];
}

const isCstNode = (v: CstElement): v is CstNode => "name" in v;
const isIToken = (v: CstElement): v is IToken => "image" in v;

export class AstVisitor extends BaseGedcomVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  root(ctx: CstNode): GedcomNode[] {
    const nodes: GedcomNode[] = [];
    if (!ctx.children.line) return nodes;
    for (const lineCst of ctx.children.line) {
      if (isCstNode(lineCst)) nodes.push(this.line(lineCst));
    }
    return this.buildHierarchy(nodes);
  }

  line({ children }: CstNode): GedcomNode {
    return {
      line: this.getLine(children.LEVEL),
      level: this.getFirstToken(children.LEVEL),
      pointer: this.getFirstToken(children.POINTER),
      tag:
        this.getFirstToken(children.TAG) ||
        this.getFirstToken(children.TagWithoutPointer),
      xref: this.getFirstToken(children.XREF),
      value: this.getFirstToken(children.VALUE),
      children: [],
    };
  }

  getLine(elements?: CstElement[]): number | undefined {
    const token = elements?.find((element) => isIToken(element));
    if (!token) return undefined;
    return token.startLine;
  }

  getFirstToken(elements?: CstElement[]): ASTToken | undefined {
    const token = elements?.find((element) => isIToken(element));
    if (!token) return undefined;

    return {
      value: token.image,
      range: {
        startCharacter: token.startColumn || 0,
        endCharacter: token.endColumn || 0,
      },
    };
  }

  buildHierarchy(nodes: GedcomNode[]): GedcomNode[] {
    const stack: GedcomNode[] = [];
    const result: GedcomNode[] = [];

    for (const node of nodes) {
      const level = node.level?.value ? parseInt(node.level?.value) : 0;

      while (
        stack.length > 0 &&
        parseInt(stack[stack.length - 1].level?.value || "0") >= level
      ) {
        stack.pop();
      }

      if (stack.length === 0) {
        result.push(node);
      } else {
        stack[stack.length - 1].children.push(node);
      }

      stack.push(node);
    }

    return result;
  }
}
