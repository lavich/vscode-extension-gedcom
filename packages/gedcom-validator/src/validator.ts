import { ASTNode, ValidationError } from "gedcom-core/dist/types";
import { GedcomTag, GedcomType, Scheme } from "./schema-types";
import g7validationRaw from "./g7validation.json";

const g7validation: Scheme = g7validationRaw;

export const validator = (
  nodes: ASTNode[],
  parentType: GedcomType | string,
) => {
  const substructure = g7validation.substructure[GedcomType(parentType)];
  if (!substructure) return [];

  const requiredTags = new Set<GedcomTag>();
  const numberOfTags = new Map<GedcomTag, number>();
  const tagToType = new Map<GedcomTag, GedcomType>();
  const cardinalityRegexp = /^\{(?<a>\d+):(?<b>\d+|M)}$/;

  Object.entries(substructure).forEach(([_tag, { cardinality, type }]) => {
    const tag = GedcomTag(_tag);
    tagToType.set(tag, GedcomType(type));
    const match = cardinality.match(cardinalityRegexp);

    if (!match?.groups) return;
    const required = parseInt(match.groups.a, 10);
    const count =
      match.groups.b === "M" ? Infinity : parseInt(match.groups.b, 10);

    if (required) {
      requiredTags.add(tag);
    }
    numberOfTags.set(tag, count);
  });
  const errors: ValidationError[] = [];

  nodes.forEach((node) => {
    if (node.tag === "CONT") return;
    const tag = GedcomTag(node.tag);
    requiredTags.delete(tag);
    const numberOfTag = numberOfTags.get(tag);
    switch (numberOfTag) {
      case 0:
      case undefined:
        const parentTag = g7validation.tag[GedcomType(parentType)];
        errors.push({
          code: "VAL001",
          message: `Invalid tag ${tag} in parent ${parentTag}`,
          range: { ...node.range },
        });
        break;
      default:
        numberOfTags.set(tag, numberOfTag - 1);
        break;
    }
    const type = tagToType.get(tag);
    if (type) {
      errors.push(...validator(node.children, type));
    }
  });
  if (requiredTags.size !== 0) {
    const parentTag = g7validation.tag[GedcomType(parentType)];
    requiredTags.forEach((tag) => {
      errors.push({
        code: "VAL002",
        message: `Missing tag ${tag} in parent ${parentTag}`,
        range: {
          start: {
            line: 0,
            col: 0,
          },
          end: {
            line: 0,
            col: 0,
          },
        },
      });
    });
  }

  return errors;
};
