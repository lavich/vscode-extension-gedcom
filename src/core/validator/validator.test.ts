import { describe, expect, test } from "vitest";
import { validator } from "./validator";
import { parseGedcom } from "../.";
import { GedcomType } from "./schema-types";

describe("validator", () => {
  test("basic test", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS
1 NOTE
0 TRLR
`);
    const errs = validator(nodes, GedcomType(""), 7);
    expect(errs.length).toBe(0);
  });
});
