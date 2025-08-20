import { ASTNode, ValidationError } from "../index";
import { GedcomTag, GedcomType, Scheme } from "./schema-types";
import g7validationRaw from "./g7validation.json";

const g7validation: Scheme = g7validationRaw;
enum ValidationErrorCode {
  InvalidTag = "VAL001",
  MissingTag = "VAL002",
}

function parseCardinality(str: string): { min: number; max: number } | null {
  const re = /^\{(?<a>\d+):(?<b>\d+|M)}$/;
  const match = str.match(re);
  if (!match?.groups) return null;
  const min = parseInt(match.groups.a, 10);
  const max = match.groups.b === "M" ? Infinity : parseInt(match.groups.b, 10);
  return { min, max };
}

export function validator(
  nodes: ASTNode[],
  parentType: GedcomType | string,
): ValidationError[] {
  const substructure = g7validation.substructure[GedcomType(parentType)];
  if (!substructure) return [];

  const rules = new Map<
    GedcomTag,
    { min: number; max: number; type: GedcomType }
  >();

  for (const [tagStr, { cardinality, type }] of Object.entries(substructure)) {
    const tag = GedcomTag(tagStr);
    const parsed = parseCardinality(cardinality);
    if (parsed) {
      rules.set(tag, { ...parsed, type: GedcomType(type) });
    }
  }

  const errors: ValidationError[] = [];
  const parentTag = g7validation.tag[GedcomType(parentType)];

  for (const node of nodes) {
    if (node.tag === "CONT") continue;

    const tag = GedcomTag(node.tag);
    const rule = rules.get(tag);

    if (!rule) {
      errors.push({
        code: ValidationErrorCode.InvalidTag,
        message: `Invalid tag ${tag} in parent ${parentTag}`,
        range: node.range,
      });
      continue;
    }

    // учёт встретившегося тега
    if (rule.max === 0) {
      errors.push({
        code: ValidationErrorCode.InvalidTag,
        message: `Too many occurrences of ${tag} in parent ${parentTag}`,
        range: node.range,
      });
    } else {
      rule.max--;
    }

    if (rule.min > 0) {
      rule.min--;
    }

    // рекурсия
    errors.push(...validator(node.children, rule.type));
  }

  // проверка на обязательные
  for (const [tag, rule] of rules) {
    if (rule.min > 0) {
      errors.push({
        code: ValidationErrorCode.MissingTag,
        message: `Missing required tag ${tag} in parent ${parentTag}`,
        range: nodes[0]?.range ?? {
          start: { line: 0, col: 0 },
          end: { line: 0, col: 0 },
        },
      });
    }
  }

  return errors;
}
