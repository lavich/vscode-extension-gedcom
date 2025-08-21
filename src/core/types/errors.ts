import { Range } from "./position";

export interface ValidationError {
  code: string;
  message: string;
  range: Range;
}
