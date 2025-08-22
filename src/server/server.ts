import {
  FoldingRange,
  InlayHintParams,
  SemanticTokensBuilder,
  Connection,
  Diagnostic,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver";
import { InitializeResult, InlayHint } from "vscode-languageserver-protocol";
import { TextDocument } from "vscode-languageserver-textdocument";

import {
  parseGedcom,
  levelHint,
  levelFolding,
  validator,
  semanticTokens,
  legend,
} from "../core";

export const createServer = (connection: Connection) => {
  const documents = new TextDocuments(TextDocument);

  connection.onInitialize(() => {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        inlayHintProvider: true,
        foldingRangeProvider: true,
        semanticTokensProvider: {
          legend,
          range: false,
          full: true,
        },
      },
    } satisfies InitializeResult;
  });

  connection.languages.inlayHint.on((params: InlayHintParams): InlayHint[] => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    const { nodes } = parseGedcom(doc.getText());
    return levelHint(nodes);
  });

  connection.onFoldingRanges((params): FoldingRange[] => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    const { nodes } = parseGedcom(doc.getText());
    return levelFolding(nodes);
  });

  connection.languages.semanticTokens.on((params) => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return { data: [] };

    const { nodes } = parseGedcom(doc.getText());

    const tokens = semanticTokens(nodes);

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

  documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
  });

  async function validateTextDocument(
    textDocument: TextDocument
  ): Promise<void> {
    const text = textDocument.getText();
    const { errors, nodes } = parseGedcom(text);
    const err = validator(nodes, "");
    const diagnostics: Diagnostic[] = [...errors, ...err];
    await connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
  }

  documents.listen(connection);
  connection.listen();
};
