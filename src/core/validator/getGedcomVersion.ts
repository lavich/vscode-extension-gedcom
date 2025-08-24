import { ASTNode } from "../types";

export function getGedcomVersion(nodes: ASTNode[]): number {
  const head = nodes.find((n) => n.tag === "HEAD");
  const vers = head?.children
    .find((n) => n.tag === "GEDC")
    ?.children.find((n) => n.tag === "VERS")?.values?.[0];
  return parseFloat(vers ?? "5.5.1");
}
