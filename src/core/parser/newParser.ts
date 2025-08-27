import { CstNode, CstParser, ParserMethod } from "chevrotain";
import { gedcomLexerDefinition, tokens } from "./newLexer";

export class GedcomParser extends CstParser {
  root!: ParserMethod<[], CstNode>;
  line!: ParserMethod<[], CstNode>;

  constructor() {
    super(gedcomLexerDefinition);

    this.RULE("root", () => {
      this.MANY(() => {
        this.SUBRULE(this.line);
      });
    });

    this.RULE("line", () => {
      this.CONSUME(tokens.Level);
      this.OR([
        {
          ALT: () => {
            this.CONSUME(tokens.Pointer);
            this.CONSUME1(tokens.TagWithPointer);
          },
        },
        {
          ALT: () => {
            this.CONSUME2(tokens.TagWithoutPointer);
            this.OPTION2(() => {
              this.CONSUME(tokens.Xref);
            });
            this.OPTION3(() => {
              this.CONSUME(tokens.Value);
            });
          },
        },
      ]);
    });

    this.performSelfAnalysis();
  }
}

export const parser = new GedcomParser();
