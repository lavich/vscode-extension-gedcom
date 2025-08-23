import {
  FoldingRange,
  InlayHintParams,
  SemanticTokensBuilder,
  Connection,
  Diagnostic,
  TextDocuments,
  TextDocumentSyncKind,
  Location,
} from "vscode-languageserver";
import { InitializeResult, InlayHint } from "vscode-languageserver-protocol";
import { TextDocument } from "vscode-languageserver-textdocument";

import {
  parseGedcom,
  levelHint,
  levelFolding,
  validator,
  findNodeAtPosition,
  semanticTokens,
  legend,
  ParseResult,
} from "../core";

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
    return levelHint(parsed.nodes);
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

    const node = findNodeAtPosition(parseResult.nodes, params.position);
    if (!node) return null;

    if (node.pointer) {
      return parseResult.xrefsIndex
        .get(node.pointer)
        ?.filter(Boolean)
        .flatMap((nodeSet) => nodeSet)
        .filter(Boolean)
        .map((node) => Location.create(params.textDocument.uri, node!.range));
    }

    if (node.xrefs?.length) {
      return node.xrefs
        .map((xref) => parseResult.pointerIndex.get(xref))
        .filter(Boolean)
        .map((node) => Location.create(params.textDocument.uri, node!.range));
    }

    return null;
  });

  documents.onDidChangeContent(async (change) => {
    const parsed = parseGedcom(change.document.getText());
    cache.set(change.document.uri, parsed);
    const text = change.document.getText();
    const { errors, nodes } = parseGedcom(text);
    const err = validator(nodes, "");
    const diagnostics: Diagnostic[] = [...errors, ...err];
    await connection.sendDiagnostics({ uri: change.document.uri, diagnostics });
  });

  documents.listen(connection);
  connection.listen();
};
