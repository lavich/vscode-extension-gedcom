import { ASTNode } from "../newParser";
import { getGedcomVersion } from "./getGedcomVersion";
import { GedcomScheme, GedcomTag, GedcomType } from "../validator/schema-types";
import g551validationJson from "../schemes/g551validation.json";
import g7validationJson from "../schemes/g7validation.json";

interface ASTGedcomNode extends ASTNode {
  reference?: GedcomType;
}

export const gedcomAstBuilder = (
  nodes: ASTNode[]
): { nodes: ASTGedcomNode[]; errors: unknown[] } => {
  const version = getGedcomVersion(nodes);
  const scheme: GedcomScheme = version?.startsWith("7")
    ? g7validationJson
    : g551validationJson;
  const errors: unknown[] = [];

  const getReference = ({
    nodes,
    scheme,
    parentRef,
  }: {
    nodes: ASTNode[];
    scheme: GedcomScheme;
    parentRef: GedcomType | undefined;
  }): ASTGedcomNode[] => {
    const substructure = scheme.substructure[GedcomType(parentRef || "")];

    const result = nodes.map((node) => {
      const reference = node.tokens.TAG?.value
        ? substructure?.[GedcomTag(node.tokens.TAG?.value)]?.type
        : undefined;
      return {
        ...node,
        reference,
        children: getReference({
          nodes: node.children,
          scheme,
          parentRef: reference,
        }),
      };
    });
    return result;
  };

  return {
    nodes: getReference({ nodes, scheme, parentRef: GedcomType("") }),
    errors,
  };
};
