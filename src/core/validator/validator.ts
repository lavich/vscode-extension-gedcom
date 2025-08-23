import { ASTNode, ValidationError } from "../index";
import { GedcomTag, GedcomType, Payload, Scheme } from "./schema-types";
import g7validationJson from "./g7validation.json";
import g551validationJson from "./g551validation.json";

enum ValidationErrorCode {
  InvalidTag = "VAL001",
  MissingTag = "VAL002",
  MissingValue = "VAL003",
  IncorrectValue = "VAL004",
  ShouldBeSetValue = "VAL005",
  MissingRef = "VAL006",
}

function parseCardinality(str: string): { min: number; max: number } | null {
  const re = /^\{(?<a>\d+):(?<b>\d+|M)}$/;
  const match = str.match(re);
  if (!match?.groups) return null;
  const min = parseInt(match.groups.a, 10);
  const max = match.groups.b === "M" ? Infinity : parseInt(match.groups.b, 10);
  return { min, max };
}

function foundVersion(nodes: ASTNode[]): number {
  const head = nodes.find(n => n.tag === "HEAD");
  const vers = head?.children.find(n => n.tag === "GEDC")
    ?.children.find(n => n.tag === "VERS")
    ?.values?.[0];
  return parseFloat(vers ?? "5.5.1");
}

export function validator(
  nodes: ASTNode[],
  parentType: GedcomType | string = "",
  _version?: number
): ValidationError[] {
  const version = _version || foundVersion(nodes);

  const scheme: Scheme = version < 7 ? g551validationJson : g7validationJson;

  const substructure = scheme.substructure[GedcomType(parentType)];
  if (!substructure) return [];

  const rules = new Map<
    GedcomTag,
    { min: number; max: number; type: GedcomType; payload: Payload }
  >();

  for (const [tagStr, { cardinality, type }] of Object.entries(substructure)) {
    const tag = GedcomTag(tagStr);
    const parsed = parseCardinality(cardinality);
    if (parsed) {
      rules.set(tag, { ...parsed, type, payload: scheme.payload[type] });
    }
  }

  const errors: ValidationError[] = [];
  const parentTag = scheme.tag[GedcomType(parentType)];

  for (const node of nodes) {
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

    if (rule.payload.type) {
      if (rule.payload.type === "Y|<NULL>") {
        if (node.values?.length && node.values[0] !== "Y") {
          errors.push({
            code: ValidationErrorCode.IncorrectValue,
            message: `Incorrect value ${node.values?.[0]} for ${tag}`,
            range: node.range,
          });
        }
      } else if (rule.payload.type === "https://gedcom.io/terms/v7/type-Enum") {
        const mapSet = scheme.set[rule.payload.set];

        if (node.values?.length !== 1 || !mapSet[node.values?.[0]]) {
          const values = Object.keys(mapSet).join(", ");
          errors.push({
            code: ValidationErrorCode.ShouldBeSetValue,
            message: `Value for ${tag} should be in set [${values}]`,
            range: node.range,
          });
        }
      } else if (rule.payload.type === "pointer") {
        if (!node.xrefs?.length) {
          errors.push({
            code: ValidationErrorCode.MissingRef,
            message: `Missing ref for ${tag}`,
            range: node.range,
          });
        }
      } else if (!node.values?.length && !node.xrefs?.length) {
        errors.push({
          code: ValidationErrorCode.MissingValue,
          message: `Missing value for ${tag}`,
          range: node.range,
        });
      }
    }

    errors.push(...validator(node.children, rule.type, version));
  }

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
