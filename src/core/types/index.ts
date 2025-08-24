export { Position, Range } from "./position";
export { ValidationError } from "./errors";
import { Range } from "./position";

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
  range: Range;
}

export interface ASTNode {
  tokens: Token[]; // все токены строки, в порядке появления
  range: Range; // покрывает всю строку

  // Семантические данные (связаны с токенами):
  level: number; // преобразованный level (из токена)
  tag: string; // тег
  pointer?: string;
  xrefs?: string[]; // если есть @XREF@
  values?: string[]; // текстовое значение

  children: ASTNode[]; // вложенные строки
  parent?: ASTNode; // ссылка на родителя (для удобства)
}
