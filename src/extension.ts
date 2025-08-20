import * as path from "path";
import { workspace, ExtensionContext, commands, window } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

console.log("GEDCOM extension module loaded");

export async function activate(context: ExtensionContext) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("dist", "server.js"),
  );

  // The debug options for the server
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for gedcom documents
    documentSelector: [{ scheme: "file", language: "gedcom" }],
    synchronize: {
      // Notify the server about file changes to gedcom files in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/*.ged"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "gedcomLanguageServer",
    "GEDCOM Language Server",
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  await client.start();

  // Register command for manual validation
  let disposable = commands.registerCommand("gedcom.validate", () => {
    console.log("GEDCOM validation command executed!");
    const activeEditor = window.activeTextEditor;
    if (activeEditor && activeEditor.document.languageId === "gedcom") {
      // Trigger validation by sending a notification to the server
      client.sendNotification("gedcom/validate", {
        uri: activeEditor.document.uri.toString(),
      });
    }
  });
  context.subscriptions.push(disposable);

  console.log("GEDCOM Language Server started");
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}
