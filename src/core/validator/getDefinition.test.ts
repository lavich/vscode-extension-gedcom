import { describe, expect, test } from "vitest";

import { parseGedcom } from "../.";
import { getDefinition } from "./getDefinition";
import g7validationJson from "./g7validation.json";

describe("getDefinition", () => {
  test("positive test", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
0 TRLR
`);

    const versNode = nodes[0].children[0].children[0];
    expect(versNode.tag).toBe("VERS");

    const definition = getDefinition(versNode, g7validationJson);

    expect(definition).toBe("https://gedcom.io/terms/v7/GEDC-VERS");
  });

  test("negative test", async () => {
    const { nodes } = parseGedcom(`0 HEAD
1 GEDC
2 VERS 7.0
3 CONC
0 TRLR
`);

    const concNode = nodes[0].children[0].children[0].children[0];
    expect(concNode.tag).toBe("CONC");

    const definition = getDefinition(concNode, g7validationJson);

    expect(definition).toBe(undefined);
  });
});
