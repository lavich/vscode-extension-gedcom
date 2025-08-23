import { describe, expect, test } from "vitest";
import { validator } from "./validator";
import { parseGedcom } from "../.";

describe("validator", () => {
  test("minimum required tags", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
0 TRLR
`);
    const errs = validator(nodes);
    expect(errs.length).toBe(0);
  });

  test("minimum required INDI", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
0 @i1@ INDI
0 TRLR
`);
    const errs = validator(nodes);
    expect(errs.length).toBe(0);
  });

  test("minimum required FAM", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
0 @f1@ FAM
0 TRLR
`);
    const errs = validator(nodes);
    expect(errs.length).toBe(0);
  });

  test("required text value", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
1 SOUR
0 TRLR
`);
    const errs = validator(nodes);
    expect(errs.length).toBe(1);
    expect(errs[0].code).toBe("VAL003");
  });

  test("required enum value", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
0 @i1@ INDI
1 SEX NON_ENUM_TAG
0 TRLR
`);
    const errs = validator(nodes);
    expect(errs.length).toBe(1);
    expect(errs[0].code).toBe("VAL005");
  });

  test("correct enum value", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
0 @i1@ INDI
1 SEX M
0 TRLR
`);
    const errs = validator(nodes);
    expect(errs.length).toBe(0);
  });

  test("required pointer value", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
0 @X3@ FAM
1 HUSB NON_POINTER
0 TRLR
`);
    const errs = validator(nodes);
    expect(errs.length).toBe(1);
    expect(errs[0].code).toBe("VAL006");
  });
});
