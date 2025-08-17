// tests/parser.test.ts
import { describe, it, expect } from "vitest";
import { parseGedcom, findNodeByPointer } from "./parser";

const SAMPLE = `0 @I1@ INDI
1 NAME John /Doe/
1 BIRT
2 DATE 1 JAN 1900
0 @I2@ INDI
1 NAME Jane /Doe/`;

describe("parser", () => {
  it("builds AST and pointer index", () => {
    const { nodes, errors, pointerIndex } = parseGedcom(SAMPLE);
    expect(errors.length).toBe(0);
    expect(nodes.length).toBe(2);
    const n1 = findNodeByPointer(pointerIndex, "@I1@");
    expect(n1).toBeDefined();
    expect(n1!.tag).toBe("INDI");
    expect(n1!.children.length).toBeGreaterThan(0);
  });

  it("detects level jumps", () => {
    const text = `0 @I1@ INDI\n1 NAME John\n3 NOTE bad level`;
    const { errors } = parseGedcom(text);
    const jump = errors.find((e) => e.code === "GEDCOM006");
    console.log(jump.range);
    expect(jump).toBeDefined();
  });

  it("propagates lexer errors", () => {
    const text = `0 @I1@ INDI\n1`; // missing space/tag after level on second line
    const { errors } = parseGedcom(text);
    expect(errors.length).toBeGreaterThan(0);
  });
});
