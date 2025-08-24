import {
  Connection,
  Diagnostic,
  DiagnosticSeverity,
  FoldingRange,
  InlayHintParams,
  SemanticTokensBuilder,
  TextDocumentPositionParams,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver";
import { InitializeResult, InlayHint } from "vscode-languageserver-protocol";
import { TextDocument } from "vscode-languageserver-textdocument";

import { parseGedcom, ParseResult, validator } from "../core";

import { levelFolding } from "./utils/folding/levelFolding";
import { legend, semanticTokens } from "./utils/semantic";
import { levelIndent } from "./utils/indent/levelIndent";
import { getDefinitionsAtPosition } from "./utils/getDefinitionsAtPosition";
import { Hover } from "vscode-languageclient";
import { hoverTag } from "./libs/hoverTag";

export const createServer = (connection: Connection) => {
  const documents = new TextDocuments(TextDocument);
  const cache = new Map<string, ParseResult>();

  connection.onInitialize(() => {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        inlayHintProvider: true,
        foldingRangeProvider: true,
        definitionProvider: true,
        hoverProvider: true,
        semanticTokensProvider: {
          legend,
          range: false,
          full: true,
        },
      },
    } satisfies InitializeResult;
  });

  connection.languages.inlayHint.on((params: InlayHintParams): InlayHint[] => {
    const parsed = cache.get(params.textDocument.uri);
    if (!parsed) return [];
    return levelIndent(parsed.nodes);
  });

  connection.onFoldingRanges((params): FoldingRange[] => {
    const parsed = cache.get(params.textDocument.uri);
    if (!parsed) return [];
    return levelFolding(parsed.nodes);
  });

  connection.languages.semanticTokens.on((params) => {
    const parsed = cache.get(params.textDocument.uri);
    if (!parsed) return { data: [] };

    const tokens = semanticTokens(parsed.nodes);

    const builder = new SemanticTokensBuilder();
    tokens.forEach((token) =>
      builder.push(
        token.line,
        token.char,
        token.length,
        token.tokenType,
        token.tokenModifiers
      )
    );
    return {
      data: builder.build().data,
    };
  });

  connection.onDefinition((params) => {
    const parseResult = cache.get(params.textDocument.uri);
    if (!parseResult) return null;

    return getDefinitionsAtPosition(
      parseResult,
      params.position,
      params.textDocument.uri
    );
  });

  connection.onHover((params: TextDocumentPositionParams): Hover | null => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return null;

    const parseResult = cache.get(params.textDocument.uri);
    if (!parseResult) return null;

    return hoverTag(parseResult.nodes, params.position);
  });

  documents.onDidChangeContent(async (change) => {
    const parseResult = parseGedcom(change.document.getText());
    cache.set(change.document.uri, parseResult);
    const errs = validator(parseResult.nodes, "");
    const diagnostics: Diagnostic[] = [...parseResult.errors, ...errs].map(
      (err) => ({
        ...err,
        severity:
          err.level === "error"
            ? DiagnosticSeverity.Error
            : err.level === "warning"
            ? DiagnosticSeverity.Warning
            : DiagnosticSeverity.Information,
      })
    );
    await connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
  });

  documents.listen(connection);
  connection.listen();
};
