import { type ReactNode } from "react";
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
export declare function DialogSearchList<T>({ items, onSelect, onHighlight, filterFn, renderItem, getKey, placeholder, emptyText, }: DialogSearchListProps<T>): ReactNode;
export {};
//# sourceMappingURL=dialog-search-list.d.ts.map