import { Brand, make } from "ts-brand";

export type GedcomTag = Brand<string, "GedcomTag">;
export const GedcomTag = make<GedcomTag>();
export type GedcomType = Brand<string, "GedcomType">;
export const GedcomType = make<GedcomType>();

export interface Scheme {
  calendar: Calendar;
  label: Label;
  payload: Payload;
  set: Set;
  substructure: Substructure;
  tag: Tags;
  tagInContext: TagInContext;
}

export type Calendar = Record<
  GedcomTag,
  { epochs: string[]; months: Months; type: GedcomType }
>;
export type Months = Record<GedcomTag, GedcomType>;
export type Label = Record<GedcomType, Record<"en-US", string>>;
export type Payload = Record<
  GedcomType,
  {
    to?: GedcomType;
    set?: GedcomType;
    type: string | null;
  }
>;
export type Set = Record<GedcomType, Record<GedcomTag, GedcomType>>;
export type Substructure = Record<
  GedcomType,
  Record<
    GedcomTag,
    {
      cardinality: string;
      type: GedcomType;
    }
  >
>;

export type Tags = Record<GedcomType, GedcomTag>;

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
