// lexer.test.ts
import { describe, it, expect } from "vitest";
import { lexLine } from "./lexer";

describe("lexer", () => {
  it("parses level, pointer, tag", () => {
    const line = "0 @I1@ INDI";
    const { tokens, errors } = lexLine(line, 0);
    expect(errors.length).toBe(0);
    expect(tokens.map((t) => t.kind)).toEqual(["LEVEL", "POINTER", "TAG"]);
    expect(tokens[0].start.character).toBe(0);
    expect(tokens[0].end.character).toBe(1);
    expect(tokens[1].value).toBe("@I1@");
  });

  it("parses tag and value", () => {
    const line = "1 NAME John /Doe/";
    const { tokens, errors } = lexLine(line, 1);
    expect(errors.length).toBe(0);
    expect(tokens.map((t) => t.kind)).toEqual(["LEVEL", "TAG", "VALUE"]);
    expect(tokens[2].value).toBe("John /Doe/");
  });

  it("returns errors for missing level", () => {
    const { errors } = lexLine(" NOPE", 0);
    expect(errors.length).not.toBe(0);
    expect(errors[0].code).toBe("LEX001");
  });

  it("detects XREF inside VALUE", () => {
    const line = "1 FAMC @F1@";
    const { tokens, errors } = lexLine(line, 2);
    expect(errors.length).toBe(0);
    expect(tokens.map((t) => t.kind)).toEqual(["LEVEL", "TAG", "XREF"]);
    expect(tokens[2].value).toBe("@F1@");
    expect(tokens[2].start.character).toBe(7);
    expect(tokens[2].end.character).toBe(11);
  });
});
