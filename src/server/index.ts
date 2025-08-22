import { createConnection, ProposedFeatures } from "vscode-languageserver/node";
import { createServer } from "./server";

const connection = createConnection(ProposedFeatures.all);

createServer(connection);
