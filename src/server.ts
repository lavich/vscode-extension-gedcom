import { createConnection, ProposedFeatures } from "vscode-languageserver/node";
import { createServer } from "./lsp-server";

const connection = createConnection(ProposedFeatures.all);

createServer(connection);
