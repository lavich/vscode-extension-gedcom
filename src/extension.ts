import * as path from "path";
import { workspace, ExtensionContext, commands, window } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(path.join("dist", "server.js"));

  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "gedcom" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.ged"),
    },
  };

  client = new LanguageClient(
    "gedcomLanguageServer",
    "GEDCOM Language Server",
    serverOptions,
    clientOptions
  );

  await client.start();

  const disposable = commands.registerCommand("gedcom.validate", () => {
    const activeEditor = window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === "gedcom") {
      client.sendNotification("gedcom/validate", {
        uri: activeEditor.document.uri.toString(),
      });
    }
  });
  context.subscriptions.push(disposable);
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
