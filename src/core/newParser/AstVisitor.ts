import { CstNode } from "chevrotain";
import { CstElement, IToken } from "@chevrotain/types";
import { parser } from "./parser";
import { TokenNames } from "./lexer";

const BaseGedcomVisitor = parser.getBaseCstVisitorConstructor();

export interface Range {
  startCharacter: number;
  endCharacter: number;
}

interface ASTToken {
  range: Range;
  value: string;
}

export interface ASTNode {
  line: number;
  tokens: Partial<Record<TokenNames, ASTToken>>;
  parent?: ASTNode;
  children: ASTNode[];
}

const isCstNode = (v: CstElement): v is CstNode => "name" in v;
const isIToken = (v: CstElement): v is IToken => "image" in v;

export class AstVisitor extends BaseGedcomVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  root(ctx: CstNode): ASTNode[] {
    const nodes: ASTNode[] = [];
    if (!ctx.children.line) return nodes;
    ctx.children.line.forEach((lineCst, index) => {
      if (isCstNode(lineCst)) nodes.push(this.line(lineCst, index));
    });
    return this.buildHierarchy(nodes);
  }

  line({ children }: CstNode, line: number): ASTNode {
    const tokens: ASTNode["tokens"] = {};
    Object.keys(children).map((tokenName) => {
      tokens[tokenName as TokenNames] = this.getFirstToken(children[tokenName]);
    });
    return {
      line,
      tokens,
      children: [],
    };
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

  buildHierarchy(nodes: ASTNode[]): ASTNode[] {
    const stack: ASTNode[] = [];
    const result: ASTNode[] = [];

    for (const node of nodes) {
      const levelValue = node.tokens.LEVEL?.value;
      const level = levelValue ? parseInt(levelValue) : 0;

      while (
        stack.length > 0 &&
        parseInt(stack[stack.length - 1].tokens.LEVEL?.value || "0") >= level
      ) {
        stack.pop();
      }

      if (stack.length === 0) {
        result.push(node);
      } else {
        const parent = stack[stack.length - 1];
        parent.children.push(node);
        node.parent = parent;
      }

      stack.push(node);
    }

    return result;
  }
}
