// types.ts
// Shared types for GEDCOM tooling

export type Offset = number; // absolute 0-based char offset (optional to compute)

export interface Pos {
  line: number; // 0-based
  col: number; // 0-based
  offset?: Offset; // may be omitted if not computed
}

export interface Range {
  start: Pos;
  end: Pos;
}

export interface ValidationError {
  code: string;
  message: string;
  range: Range;
}

export interface ASTNode {
  level: number;
  tag: string;
  pointer?: string; // e.g. @I1@
  value?: string; // rest of line after tag
  children: ASTNode[];
  range: Range; // covers the entire line for this node
  line: number; // convenience: start line
}
