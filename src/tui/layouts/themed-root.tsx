import React, { type ReactNode, isValidElement, cloneElement } from "react";
import { useTheme } from "../providers/theme";

type Props = { children: ReactNode };

function wrapStringNode(node: any, key?: any) {
  // wrap plain strings/numbers into a <text> node to satisfy renderer requirements
  return typeof node === "string" || typeof node === "number" ? <text key={key}>{String(node)}</text> : node;
}

function deepNormalize(node: any, path: string = "root"): any {
  if (node == null) return null;
  if (typeof node === "string" || typeof node === "number") return wrapStringNode(node);
  if (Array.isArray(node)) return node.map((child, i) => deepNormalize(child, `${path}[${i}]`));
  if (isValidElement(node)) {
    const props: any = node.props || {};
    if (props.children) {
      const normalizedChildren = deepNormalize(props.children, `${path}.${node.type}`);
      // only clone if children changed to avoid unnecessary re-renders
      if (normalizedChildren !== props.children) {
        return cloneElement(node, { ...props }, normalizedChildren);
      }
    }
    return node;
  }
  return node;
}

export function ThemedRoot({ children }: Props) {
  const { colors } = useTheme();
  const normalized = deepNormalize(children, 'root');
  return (
    <box backgroundColor={colors.background} width="100%" height="100%" flexGrow={1}>
      {normalized}
    </box>
  );
}
