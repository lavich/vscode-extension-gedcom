import { ASTNode, findNodeAtPosition, getGedcomVersion } from "../../core";
import { Hover, MarkupKind, Position } from "vscode-languageserver";
import { getDefinition } from "../../core/validator/getDefinition";
import g7validationJson from "../../core/validator/g7validation.json";
import g551validationJson from "../../core/validator/g551validation.json";
import { GedcomScheme } from "../../core/validator/schema-types";

export const hoverTag = (
  nodes: ASTNode[],
  position: Position
): Hover | null => {
  const node = findNodeAtPosition(nodes, position);
  if (!node) return null;

  const version = getGedcomVersion(nodes);
  const scheme: GedcomScheme =
    version >= 7 ? g7validationJson : g551validationJson;

  const def = getDefinition(node, scheme);
  if (!def) return null;

  const label = scheme.label[def]["en-US"];

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: label,
    },
    range: node.range,
  };
};
