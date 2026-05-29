import { useCallback } from "react";
import { DialogSearchList } from "../dialog-search-list";
import { useTheme } from "../../providers/theme";

const SCAN_TARGETS = [
  { id: ".", label: "Current directory", description: "Scan entire project" },
  { id: "src", label: "Source code", description: "Scan src/ directory" },
  { id: "diff", label: "Staged changes", description: "Scan git diff only" },
  { id: "custom", label: "Custom path", description: "Specify a path to scan" },
];

type Props = {
  onSelect: (target: string) => void;
};

export function ScanDialogContent({ onSelect }: Props) {
  const { colors } = useTheme();

  const handleSelect = useCallback(
    (item: (typeof SCAN_TARGETS)[0]) => {
      onSelect(item.id);
    },
    [onSelect]
  );

  return (
    <DialogSearchList
      items={SCAN_TARGETS}
      onSelect={handleSelect}
      filterFn={(item, query) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      }
      renderItem={(item, isSelected) => (
        <box flexDirection="row" gap={1}>
          <text fg={isSelected ? colors.selection : undefined} attributes={isSelected ? 1 : 0}>
            {item.label}
          </text>
          <text attributes={2}>{item.description}</text>
        </box>
      )}
      getKey={(item) => item.id}
      placeholder="Select scan target..."
      emptyText="No matching targets"
    />
  );
}
