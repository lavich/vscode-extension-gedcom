import { describe, it, expect } from "vitest";
import { lexLine, lex } from "./lexer";

describe("lexer", () => {
  it("parses level, pointer, tag", () => {
    const line = "0 @I1@ INDI";
    const { tokens, error } = lexLine(line, 0, 0);
    expect(error).toBeUndefined();
    expect(tokens.map((t) => t.type)).toEqual(["LEVEL", "POINTER", "TAG"]);
    expect(tokens[0].start.col).toBe(0);
    expect(tokens[0].end.col).toBe(1);
    expect(tokens[1].value).toBe("@I1@");
  });

  it("parses tag and value", () => {
    const line = "1 NAME John /Doe/";
    const { tokens, error } = lexLine(line, 1, 10);
    expect(error).toBeUndefined();
    expect(tokens.map((t) => t.type)).toEqual(["LEVEL", "TAG", "VALUE"]);
    expect(tokens[2].value).toBe("John /Doe/");
  });

  it("returns errors for missing level", () => {
    const { tokens, error } = lexLine(" NOPE", 0, 0);
    expect(error).toBeDefined();
    expect(error!.code).toBe("LEX001");
  });
});
