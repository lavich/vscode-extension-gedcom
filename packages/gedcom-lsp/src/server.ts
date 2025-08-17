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
import { ASTNode, parseGedcom, levelHint } from "gedcom-core";
import { InitializeResult, InlayHint } from "vscode-languageserver-protocol";
import { FoldingRange, InlayHintParams } from "vscode-languageserver";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      inlayHintProvider: true,
      foldingRangeProvider: true,
    },
  } satisfies InitializeResult;
});

connection.languages.inlayHint.on(
  async (params: InlayHintParams): Promise<InlayHint[]> => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    const { nodes } = parseGedcom(doc.getText());
    return levelHint(nodes);
  },
);

connection.onFoldingRanges((params): FoldingRange[] => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];

  const ast = parseGedcom(doc.getText());

  const ranges: FoldingRange[] = [];

  const addFolding = (node: ASTNode): void => {
    if (node.children.length > 0) {
      const startLine = node.line;
      const endLine = Math.max(...node.children.map((c) => getEndLine(c)));
      ranges.push({ startLine, endLine });
    }

    node.children.forEach(addFolding);
  };

  const getEndLine = (node: ASTNode): number => {
    if (node.children.length === 0) return node.line;
    return Math.max(...node.children.map(getEndLine));
  };

  ast.nodes.forEach(addFolding);

  return ranges;
});

documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];
  const { errors } = parseGedcom(text);

  errors.forEach((error) => {
    diagnostics.push({
      code: error.code,
      message: error.message,
      range: {
        start: {
          line: error.range.start.line,
          character: error.range.start.col,
        },
        end: {
          line: error.range.end.line,
          character: error.range.end.col,
        },
      },
    });
  });

  await connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.listen(connection);
connection.listen();
