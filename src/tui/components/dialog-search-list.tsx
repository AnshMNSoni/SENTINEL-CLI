import { useCallback, useRef, useState, type ReactNode } from "react";
import { useKeyboard } from "@opentui/react";
import { TextAttributes } from "@opentui/core";
import type { InputRenderable, ScrollBoxRenderable } from "@opentui/core";
import { useKeyboardLayer } from "../providers/keyboard-layer";
import { useTheme } from "../providers/theme";

const MAX_VISIBLE_ITEMS = 6;

type DialogSearchListProps<T> = {
  items: T[];
  onSelect: (item: T) => void;
  onHighlight?: (item: T) => void;
  filterFn: (item: T, query: string) => boolean;
  renderItem: (item: T, isSelected: boolean) => ReactNode;
  getKey: (item: T) => string;
  placeholder?: string;
  emptyText?: string;
};

export function DialogSearchList<T>({
  items,
  onSelect,
  onHighlight,
  filterFn,
  renderItem,
  getKey,
  placeholder = "Search...",
  emptyText = "No results",
}: DialogSearchListProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<InputRenderable>(null);
  const scrollRef = useRef<ScrollBoxRenderable>(null);
  const { isTopLayer } = useKeyboardLayer();
  const { colors } = useTheme();

  const filtered = items.filter((item) => filterFn(item, searchValue));

  const handleChange = useCallback((value: string) => {
    setSearchValue(value);
    setSelectedIndex(0);
  }, []);

  const handleSubmit = useCallback(
    (value: unknown) => {
      if (filtered[selectedIndex]) {
        onSelect(filtered[selectedIndex]);
      }
    },
    [filtered, selectedIndex, onSelect]
  );

  useKeyboard((key) => {
    if (!isTopLayer("dialog")) return;
    if (key.name === "up" || key.name === "k") {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    }
    if (key.name === "down" || key.name === "j") {
      setSelectedIndex((prev) => Math.min(filtered.length - 1, prev + 1));
    }
    if (key.name === "escape") {
      setSearchValue("");
    }
  });

  const visibleHeight = Math.min(filtered.length, MAX_VISIBLE_ITEMS);

  return (
    <box flexDirection="column" gap={1}>
      <input
        ref={inputRef}
        placeholder={placeholder}
        focused
        onInput={handleChange}
        onSubmit={handleSubmit}
      />
      {filtered.length === 0 ? (
        <text attributes={TextAttributes.DIM}>{emptyText}</text>
      ) : (
        <scrollbox ref={scrollRef} height={visibleHeight}>
          {filtered.map((item, i) => {
            const isSelected = i === selectedIndex;
            return (
              <box key={getKey(item)} flexDirection="row">
                {renderItem(item, isSelected)}
              </box>
            );
          })}
        </scrollbox>
      )}
    </box>
  );
}
