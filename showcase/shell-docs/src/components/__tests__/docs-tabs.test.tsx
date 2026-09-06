// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Tab, Tabs } from "@/components/docs-tabs";

const STORAGE_KEY = "shell-docs.tab.pm";

function PersistGroup(): React.ReactElement {
  return (
    <Tabs groupId="pm" persist items={["npm", "pnpm"]}>
      <Tab value="npm">npm content</Tab>
      <Tab value="pnpm">pnpm content</Tab>
    </Tabs>
  );
}

function PanelFor(text: string): HTMLElement | null {
  return screen.getByText(text).closest('[role="tabpanel"]');
}

describe("DocsTabs", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("selects the first item when no default is given", () => {
    render(<PersistGroup />);

    expect(PanelFor("npm content")?.getAttribute("data-state")).toBe("active");
    expect(PanelFor("pnpm content")?.getAttribute("data-state")).toBe(
      "inactive",
    );
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("persists a groupId pick and reapplies it on a fresh mount", () => {
    render(<PersistGroup />);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "pnpm" }));

    expect(PanelFor("pnpm content")?.getAttribute("data-state")).toBe("active");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("pnpm");

    cleanup();
    render(<PersistGroup />);

    // No `default` on the new instance — the stored pick wins over the
    // first-item fallback.
    expect(PanelFor("pnpm content")?.getAttribute("data-state")).toBe("active");
  });

  it("lets an explicit default override a stored pick", () => {
    window.localStorage.setItem(STORAGE_KEY, "pnpm");
    render(
      <Tabs groupId="pm" persist default="npm" items={["npm", "pnpm"]}>
        <Tab value="npm">npm content</Tab>
        <Tab value="pnpm">pnpm content</Tab>
      </Tabs>,
    );

    expect(PanelFor("npm content")?.getAttribute("data-state")).toBe("active");
  });

  it("ignores a stored pick that is not in items", () => {
    window.localStorage.setItem(STORAGE_KEY, "bun");
    render(<PersistGroup />);

    expect(PanelFor("npm content")?.getAttribute("data-state")).toBe("active");
  });

  it("does not write to storage when persist is not set", () => {
    render(
      <Tabs groupId="pm" items={["npm", "pnpm"]}>
        <Tab value="npm">npm content</Tab>
        <Tab value="pnpm">pnpm content</Tab>
      </Tabs>,
    );
    fireEvent.mouseDown(screen.getByRole("tab", { name: "pnpm" }));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
