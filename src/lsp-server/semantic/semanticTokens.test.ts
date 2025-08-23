import { describe, it, expect } from "vitest";
import { semanticTokens, legend } from "./index";
import type { ASTNode } from "../../core";

describe("buildSemanticTokens", () => {
  it("должен возвращать пустой массив для пустого AST", () => {
    const result = semanticTokens([]);
    expect(result).toEqual([]);
  });

  it("должен корректно кодировать токены одного уровня", () => {
    const nodes: ASTNode[] = [
      {
        tokens: [
          {
            kind: "LEVEL",
            value: "0",
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 },
          },
          {
            kind: "TAG",
            value: "HEAD",
            start: { line: 0, character: 2 },
            end: { line: 0, character: 6 },
          },
          {
            kind: "VALUE",
            value: "Some value",
            start: { line: 0, character: 7 },
            end: { line: 0, character: 17 },
          },
        ],
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 17 },
        },
        level: 0,
        tag: "HEAD",
        children: [],
      },
    ];

    const result = semanticTokens(nodes);

    expect(result).toEqual([
      {
        line: 0,
        char: 0,
        length: 1,
        tokenType: legend.tokenTypes.indexOf("number"),
        tokenModifiers: 0,
      },
      {
        line: 0,
        char: 2,
        length: 4,
        tokenType: legend.tokenTypes.indexOf("keyword"),
        tokenModifiers: 0,
      },
      {
        line: 0,
        char: 7,
        length: 10,
        tokenType: legend.tokenTypes.indexOf("string"),
        tokenModifiers: 0,
      },
    ]);
  });

  it("должен работать с несколькими ASTNode", () => {
    const nodes: ASTNode[] = [
      {
        tokens: [
          {
            kind: "LEVEL",
            value: "0",
            start: { line: 0, character: 0 },
            end: { line: 0, character: 1 },
          },
          {
            kind: "TAG",
            value: "HEAD",
            start: { line: 0, character: 2 },
            end: { line: 0, character: 6 },
          },
        ],
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 6 },
        },
        level: 0,
        tag: "HEAD",
        children: [],
      },
      {
        tokens: [
          {
            kind: "LEVEL",
            value: "1",
            start: { line: 1, character: 0 },
            end: { line: 1, character: 1 },
          },
          {
            kind: "TAG",
            value: "NAME",
            start: { line: 1, character: 2 },
            end: { line: 1, character: 6 },
          },
          {
            kind: "VALUE",
            value: "John Doe",
            start: { line: 1, character: 7 },
            end: { line: 1, character: 15 },
          },
        ],
        range: {
          start: { line: 1, character: 0 },
          end: { line: 1, character: 15 },
        },
        level: 1,
        tag: "NAME",
        children: [],
      },
    ];

    const result = semanticTokens(nodes);

    expect(result).toEqual([
      {
        line: 0,
        char: 0,
        length: 1,
        tokenType: legend.tokenTypes.indexOf("number"),
        tokenModifiers: 0,
      },
      {
        line: 0,
        char: 2,
        length: 4,
        tokenType: legend.tokenTypes.indexOf("keyword"),
        tokenModifiers: 0,
      },
      {
        line: 1,
        char: 0,
        length: 1,
        tokenType: legend.tokenTypes.indexOf("number"),
        tokenModifiers: 0,
      },
      {
        line: 1,
        char: 2,
        length: 4,
        tokenType: legend.tokenTypes.indexOf("keyword"),
        tokenModifiers: 0,
      },
      {
        line: 1,
        char: 7,
        length: 8,
        tokenType: legend.tokenTypes.indexOf("string"),
        tokenModifiers: 0,
      },
    ]);
  });

  it("должен кодировать UNKNOWN токен", () => {
    const nodes: ASTNode[] = [
      {
        tokens: [
          {
            kind: "UNKNOWN",
            value: "???",
            start: { line: 0, character: 0 },
            end: { line: 0, character: 3 },
          },
        ],
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 3 },
        },
        level: 0,
        tag: "",
        children: [],
      },
    ];

    const result = semanticTokens(nodes);
    expect(result[0].tokenType).toBe(legend.tokenTypes.indexOf("unknown"));
  });
});
