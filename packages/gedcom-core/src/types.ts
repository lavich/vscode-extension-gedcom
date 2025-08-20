// types.ts
// Shared types for GEDCOM tooling

export interface Pos {
  line: number;
  character: number;
}

export interface Range {
  start: Pos;
  end: Pos;
}

export type TokenKind =
  | "LEVEL"
  | "POINTER"
  | "TAG"
  | "XREF"
  | "VALUE"
  | "EOL"
  | "UNKNOWN";

export interface Token {
  kind: TokenKind;
  value: string;
  start: Pos;
  end: Pos;
}

export interface LexError {
  code: string;
  message: string;
  range: Range;
}

export interface ValidationError {
  code: string;
  message: string;
  range: Range;
}

export interface ASTNode {
  tokens: Token[]; // все токены строки, в порядке появления
  range: Range; // покрывает всю строку

  // Семантические данные (связаны с токенами):
  level: number; // преобразованный level (из токена)
  tag: string; // тег
  pointer?: string;
  xref?: string; // если есть @XREF@
  value?: string; // текстовое значение

  children: ASTNode[]; // вложенные строки
  parent?: ASTNode; // ссылка на родителя (для удобства)
}
