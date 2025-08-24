import { Location, Position } from "vscode-languageserver";

import { findNodeAtPosition, positionInRange } from "../../core";
import { ASTNode, ParseResult } from "../../core";

function getPointerDefinitions(
  node: ASTNode,
  parseResult: ParseResult,
  uri: string
): Location[] | null {
  if (!node.pointer) return null;

  const refs = parseResult.xrefsIndex.get(node.pointer);
  if (!refs) return null;

  const locations = refs.map((node) => Location.create(uri, node.range));

  return locations.length ? locations : null;
}

function getXrefDefinitions(
  node: ASTNode,
  parseResult: ParseResult,
  uri: string
): Location[] | null {
  if (!node.xrefs?.length) return null;

  const locations = node.xrefs
    .map((xref) => parseResult.pointerIndex.get(xref))
    .filter((n): n is ASTNode => !!n)
    .map((n) => Location.create(uri, n.range));

  return locations.length ? locations : null;
}

export function getDefinitionsAtPosition(
  parseResult: ParseResult,
  pos: Position,
  uri: string
): Location[] | null {
  const node = findNodeAtPosition(parseResult.nodes, pos);
  if (!node) return null;

  const hoveredToken = node.tokens.find((token) =>
    positionInRange(pos, token.range)
  );
  if (!hoveredToken) return null;

  if (hoveredToken.kind === "POINTER") {
    return getPointerDefinitions(node, parseResult, uri);
  }

  if (hoveredToken.kind === "XREF") {
    return getXrefDefinitions(node, parseResult, uri);
  }

  return null;
}
