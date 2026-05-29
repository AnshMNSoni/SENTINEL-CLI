import { useCallback } from "react";
import { DialogSearchList } from "../dialog-search-list";
import { useTheme } from "../../providers/theme";
import { useDialog } from "../../providers/dialog";

export function ThemeDialogContent() {
  const { themes, setTheme, theme: currentTheme } = useTheme();
  const dialog = useDialog();

  const handleSelect = useCallback(
    (t: (typeof themes)[0]) => {
      setTheme(t.name);
      dialog.close();
    },
    [setTheme, dialog]
  );

  return (
    <DialogSearchList
      items={themes}
      onSelect={handleSelect}
      filterFn={(item, query) => item.name.toLowerCase().includes(query.toLowerCase())}
      renderItem={(item, isSelected) => (
        <text fg={isSelected ? currentTheme.colors.selection : undefined}>
          {item.name === currentTheme.name ? " \u2022 " : "   "}{item.name}
        </text>
      )}
      getKey={(item) => item.name}
      placeholder="Search themes..."
      emptyText="No matching themes"
    />
  );
}
