import { ASTNode } from "../types";
import { GedcomScheme, GedcomTag, GedcomType } from "./schema-types";

export function getDefinition(
  node: ASTNode,
  schema: GedcomScheme
): GedcomType | undefined {
  const gedcomTags: GedcomTag[] = [];

  let tempNode: ASTNode | undefined = node;
  while (tempNode) {
    gedcomTags.push(GedcomTag(tempNode.tag));
    tempNode = tempNode.parent;
  }
  let gedcomType: GedcomType | undefined = GedcomType("");

  while (gedcomTags.length > 0 && gedcomType !== undefined) {
    const tag = gedcomTags.pop();
    gedcomType = tag && schema.substructure[gedcomType]?.[tag]?.type;
  }

  return gedcomType;
}
