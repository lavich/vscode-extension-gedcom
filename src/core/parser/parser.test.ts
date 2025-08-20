import { describe, it, expect } from "vitest";
import { parseGedcom } from "./parser";

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

    // на верхнем уровне должно быть два индивидуума
    expect(nodes.length).toBe(2);

    const n1 = pointerIndex.get("@I1@");
    expect(n1).toBeDefined();
    expect(n1?.tag).toBe("INDI");
    expect(n1?.parent).toBeUndefined(); // корень без parent
    expect(n1?.children.length).toBeGreaterThan(0);

    // первый ребёнок у I1 — NAME
    const nameNode = n1?.children.find(c => c.tag === "NAME");
    expect(nameNode).toBeDefined();
    expect(nameNode!.parent).toBe(n1);

    // у I1 также есть BIRT
    const birtNode = n1?.children.find(c => c.tag === "BIRT");
    expect(birtNode).toBeDefined();
    expect(birtNode!.parent).toBe(n1);

    // у BIRT должен быть DATE
    const dateNode = birtNode!.children.find(c => c.tag === "DATE");
    expect(dateNode).toBeDefined();
    expect(dateNode!.parent).toBe(birtNode);

    // второй корневой узел — I2
    const n2 = pointerIndex.get("@I2@");
    expect(n2).toBeDefined();
    expect(n2!.tag).toBe("INDI");
    expect(n2!.parent).toBeUndefined();

    const name2 = n2!.children.find(c => c.tag === "NAME");
    expect(name2).toBeDefined();
    expect(name2!.parent).toBe(n2);
  });

  it("propagates lexer errors", () => {
    const text = `0 @I1@ INDI\n1`; // missing space/tag after level on second line
    const { errors } = parseGedcom(text);
    expect(errors.length).toBeGreaterThan(0);
  });
});
