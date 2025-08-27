import { describe, it, expect } from "vitest";
import { GedcomLexer } from "./newLexer";

describe("lexer", () => {
  it("parse level and tag", () => {
    const { tokens, errors } = GedcomLexer.tokenize("1 BIRT");
    expect(errors.length).toBe(0);
    expect(tokens.length).toBe(2);
  });

  it("parse level, tag, value", () => {
    const { tokens, errors } = GedcomLexer.tokenize("1 BIRT VALU E");
    expect(errors.length).toBe(0);
    expect(tokens.length).toBe(3);
  });

  it("parse new line with level, tag, value", () => {
    const { tokens, errors } = GedcomLexer.tokenize(
      "1 NAME John /Doe/\n1 NAME John /Doe/"
    );
    expect(errors.length).toBe(0);
    expect(tokens.length).toBe(6);
  });

  it("parse level, pointer, tag", () => {
    const { tokens, errors } = GedcomLexer.tokenize(
      "1 @POINTER@ BIRT \n1 @POINTER@ BIRT"
    );
    expect(errors.length).toBe(0);
    expect(tokens.length).toBe(6);
  });

  it("parse level, pointer, tag + error", () => {
    const { tokens, errors } = GedcomLexer.tokenize("1 @POINTER@ BIRT er df");
    expect(errors.length).toBe(2);
    expect(tokens.length).toBe(3);
  });

  it("parse new level", () => {
    const { tokens, errors } = GedcomLexer.tokenize("1 BIRT VALU E\n2 TEST e");
    expect(errors.length).toBe(0);
    expect(tokens.length).toBe(6);
  });

  it("parse SAMPLE", () => {
    const SAMPLE = `0 @I1@ INDI
1 NAME John /Doe/
1 BIRT
1 BIRT
2 DATE 1 JAN 1900
0 @I2@ INDI
3 FAM @i2@
1 NAME Jane /Doe/`;
    const { tokens, errors } = GedcomLexer.tokenize(SAMPLE);
    expect(errors.length).toBe(0);
    expect(tokens.length).toBe(22);
  });
});
