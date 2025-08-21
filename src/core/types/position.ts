export interface Pos {
  line: number;
  character: number;
}

export interface Range {
  start: Pos;
  end: Pos;
}