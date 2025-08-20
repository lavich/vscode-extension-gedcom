/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
  createConnection,
  Diagnostic,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import {
  parseGedcom,
  levelHint,
  levelFolding,
  validator,
  semanticTokens,
  legend,
} from "gedcom-core";
import { InitializeResult, InlayHint } from "vscode-languageserver-protocol";
import {
  FoldingRange,
  InlayHintParams,
  SemanticTokensBuilder,
} from "vscode-languageserver";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      inlayHintProvider: true,
      foldingRangeProvider: true,
      semanticTokensProvider: {
        legend,
        range: false, // поддержка SemanticTokens по диапазону
        full: true, // поддержка SemanticTokens для всего документа
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

  // console.log("tokens length: ", tokens.length);
  const builder = new SemanticTokensBuilder();
  tokens.forEach((token) =>
    builder.push(
      token.line,
      token.char,
      token.length,
      token.tokenType,
      token.tokenModifiers,
    ),
  );
  // console.log(tokens[0]);
  // builder.push(1, 2, 3, 4, 5);
  return {
    data: builder.build().data,
  };
});

documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const { errors, nodes } = parseGedcom(text);
  const err = validator(nodes, "");
  const diagnostics: Diagnostic[] = [...errors, ...err];
  await connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.listen(connection);
connection.listen();
