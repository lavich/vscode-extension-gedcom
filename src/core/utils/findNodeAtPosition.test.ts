import { findNodeAtPosition } from "./findNodeAtPosition";
import { Position } from "../types";
import { describe, it, expect } from "vitest";
import {parseGedcom} from "../parser";

const SAMPLE = `0 @I1@ INDI
1 NAME John /Doe/
1 BIRT
2 DATE 1 JAN 1900
0 @I2@ INDI
1 NAME Jane /Doe/`;


describe("findNodeAtPosition", () => {
  const { nodes } = parseGedcom(SAMPLE);

  it("finds root node when position is at root start", () => {
    const pos: Position = { line: 0, character: 0 };
    const node = findNodeAtPosition(nodes, pos);
    expect(node?.tag).toBe("INDI");
  });

  it("finds first child node", () => {
    const pos: Position = { line: 1, character: 0 };
    const node = findNodeAtPosition(nodes, pos);
    expect(node?.tag).toBe("NAME");
  });
});
