import { createToken, Lexer } from "chevrotain";
import { IMultiModeLexerDefinition } from "@chevrotain/types";

enum TokenNames {
  LEVEL = "LEVEL",
  POINTER = "POINTER",
  TAG = "TAG",
  XREF = "XREF",
  VALUE = "VALUE",
}

// --- Служебные ---
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /[ \t]+/,
  group: Lexer.SKIPPED,
});

const Newline = createToken({
  name: "Newline",
  pattern: /\r?\n/,
  group: Lexer.SKIPPED,
  line_breaks: true,
  push_mode: "main",
});

// --- GEDCOM ---
export const Level = createToken({
  name: TokenNames.LEVEL,
  pattern: /[0-9]+/,
  start_chars_hint: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
});

export const Pointer = createToken({
  name: TokenNames.POINTER,
  pattern: /@[A-Za-z0-9]+@/,
  start_chars_hint: ["@"],
  push_mode: "hasPointer",
});

export const TagWithoutPointer = createToken({
  name: TokenNames.TAG,
  pattern: /[A-Z0-9_]+/,
  start_chars_hint: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"],
  push_mode: "hasNotPointer",
});

export const TagWithPointer = createToken({
  name: TokenNames.TAG,
  pattern: /[A-Z0-9_]+/,
  start_chars_hint: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"],
  pop_mode: true,
});

export const Xref = createToken({
  name: TokenNames.XREF,
  pattern: /@[A-Za-z0-9]+@/,
  start_chars_hint: ["@"],
  pop_mode: true,
});

export const Value = createToken({
  name: TokenNames.VALUE,
  pattern: /.+/,
  line_breaks: false,
  pop_mode: true,
});

export const gedcomLexerDefinition: IMultiModeLexerDefinition = {
  defaultMode: "main",
  modes: {
    main: [Newline, WhiteSpace, Level, Pointer, TagWithoutPointer],
    hasPointer: [WhiteSpace, TagWithPointer],
    hasNotPointer: [Newline, WhiteSpace, Xref, Value],
  },
};

export const tokens = {
  Level,
  Pointer,
  TagWithPointer,
  TagWithoutPointer,
  Xref,
  Value,
};
export const GedcomLexer = new Lexer(gedcomLexerDefinition);
