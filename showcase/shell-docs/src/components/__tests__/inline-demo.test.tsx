// @vitest-environment node

import React from "react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { docsComponents } from "@/lib/mdx-registry";

function findIframeSrc(node: ReactNode): string | null {
  if (!React.isValidElement(node)) {
    return null;
  }
  const el = node as ReactElement<{ children?: ReactNode; src?: string }>;
  if (el.type === "iframe" && typeof el.props.src === "string") {
    return el.props.src;
  }
  for (const child of React.Children.toArray(el.props.children)) {
    const src = findIframeSrc(child);
    if (src) {
      return src;
    }
  }
  return null;
}

type InlineDemoProps = { integration?: string; demo?: string };

function renderInlineDemo(props: InlineDemoProps): React.ReactNode {
  const InlineDemo = docsComponents.InlineDemo as (
    p: InlineDemoProps,
  ) => React.ReactNode;
  return InlineDemo(props);
}

describe("InlineDemo embedding", () => {
  it("renders nothing without an integration", () => {
    expect(renderInlineDemo({ demo: "agentic-chat" })).toBeNull();
  });

  it("iframes the agentic-chat demo for langgraph-python", () => {
    const el = renderInlineDemo({
      integration: "langgraph-python",
      demo: "agentic-chat",
    });

    const src = findIframeSrc(el);
    expect(src).not.toBeNull();
    expect(src).toContain("/demos/agentic-chat");
  });
});
