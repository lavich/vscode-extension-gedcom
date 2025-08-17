import { ASTNode } from "./types";

type InlayHint = {
  position: {
    line: number;
    character: number;
  };
  label: string;
  paddingRight: boolean;
};

const INDENT = "  ";

export const levelHint = (nodes: ASTNode[]): InlayHint[] => {
  return nodes.flatMap((node) => {
    const hint = levelHint(node.children);
    if (node.level > 0) {
      const indent = INDENT.repeat(node.level);
      hint.push({
        position: {
          line: node.line,
          character: 0,
        },
        label: indent,
        paddingRight: true,
      });
    }
    return hint;
  });
};
