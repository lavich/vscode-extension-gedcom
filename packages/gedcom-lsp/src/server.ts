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
import { ASTNode, parseGedcom } from "gedcom-core";
import { InitializeResult, InlayHint } from "vscode-languageserver-protocol";
import { InlayHintKind, InlayHintParams } from "vscode-languageserver";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      inlayHintProvider: true,
    },
  } satisfies InitializeResult;
});

connection.languages.inlayHint.on(
  async (params: InlayHintParams): Promise<InlayHint[]> => {
    const doc = documents.get(params.textDocument.uri);
    if (!doc) return [];
    const ast = parseGedcom(doc.getText());
    const addLevelHint = (node: ASTNode): InlayHint[] => {
      let hint: InlayHint | undefined;
      if (node.level > 0) {
        const indent = "  ".repeat(node.level);
        hint = {
          position: {
            line: node.line,
            character: 0,
          },
          label: indent,
          kind: InlayHintKind.Type,
          paddingRight: true,
        };
      }
      const childrenHints = node.children.flatMap(addLevelHint);
      return hint ? [hint, ...childrenHints] : childrenHints;
    };

    return ast.nodes.flatMap(addLevelHint);
  },
);

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
