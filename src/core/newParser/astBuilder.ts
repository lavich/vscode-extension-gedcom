import { GedcomLexer } from "./lexer";
import { parser } from "./parser";
import { AstVisitor } from "./AstVisitor";

export const astBuilder = (text: string) => {
  const lexingResult = GedcomLexer.tokenize(text);
  parser.input = lexingResult.tokens;
  const cst = parser.root();
  const visitor = new AstVisitor();
  const ast = visitor.root(cst);
  return { ast, errors: [] }; // TODO parse lexing and parser errors
};
