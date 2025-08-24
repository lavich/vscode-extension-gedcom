import { Brand, make } from "ts-brand";

export type GedcomTag = Brand<string, "GedcomTag">;
export const GedcomTag = make<GedcomTag>();
export type GedcomType = Brand<string, "GedcomType">;
export const GedcomType = make<GedcomType>();

export interface GedcomScheme {
  calendar: Record<GedcomTag, Calendar>;
  label: Record<GedcomType, Label>;
  payload: Record<GedcomType, Payload>;
  set: Record<GedcomType, Set>;
  substructure: Record<GedcomType, Substructure>;
  tag: Record<GedcomType, GedcomTag>;
  tagInContext: TagInContext;
}

export interface Calendar {
  epochs: string[];
  months: Months;
  type: GedcomType;
}
export type Months = Record<GedcomTag, GedcomType>;
export type Label = Record<"en-US", string>;
export type Payload =
  | {
      type: null | "Y|<NULL>";
    }
  | {
      to: GedcomType;
      type: "pointer";
    }
  | {
      set: GedcomType;
      type: "https://gedcom.io/terms/v7/type-Enum";
    };

export type Set = Record<string, GedcomType>;
export type Substructure = Record<
  GedcomTag,
  {
    cardinality: string;
    type: GedcomType;
  }
>;

export interface TagInContext {
  cal: Cal;
  enum: Enum;
  month: Month;
  struct: Struct;
}

export type Cal = Record<GedcomType, GedcomTag>;
export type Enum = Record<GedcomType, Record<GedcomType, GedcomTag>>;
export type Month = Record<GedcomType, Record<GedcomType, GedcomTag>>;
export type Struct = Record<GedcomType, Record<GedcomType, GedcomTag>>;
