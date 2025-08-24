import { Range } from "./position";

export interface ValidationError {
  code: string;
  message: string;
  hint?: string;
  range: Range;
  level: "error" | "warning" | "info";
}
