import * as React from "react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface KeyValuePair {
  key: string;
  value: string;
}

interface KeyValueEditorProps {
  value?: KeyValuePair[];
  onChange?: (value: KeyValuePair[]) => void;
  disabled?: boolean;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addButtonLabel?: string;
}

export function KeyValueEditor({
  value = [],
  onChange,
  disabled = false,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value (String or JSON)",
  addButtonLabel = "Add Item",
}: KeyValueEditorProps) {
  const items = value;

  const triggerChange = React.useCallback(
    (newItems: KeyValuePair[]) => {
      onChange?.(newItems);
    },
    [onChange]
  );

  const handleChange = (index: number, field: "key" | "value", newValue: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: newValue };
    triggerChange(newItems);
  };

  const handleAdd = () => {
    const newItems = [...items, { key: "", value: "" }];
    triggerChange(newItems);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    triggerChange(newItems);
  };

  return (
    <div className="flex flex-col gap-3">
      {items.length === 0 && (
        <div className="text-sm text-muted-foreground italic px-1">
          No items added yet.
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <Input
              value={item.key}
              onChange={(e) => handleChange(index, "key", e.target.value)}
              placeholder={keyPlaceholder}
              disabled={disabled}
              className="flex-1 font-mono text-sm"
            />
            <Input
              value={item.value}
              onChange={(e) => handleChange(index, "value", e.target.value)}
              placeholder={valuePlaceholder}
              disabled={disabled}
              className="flex-1 font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="text-muted-foreground hover:text-destructive hover:border-destructive hover:bg-destructive/10 shrink-0"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={disabled}
        >
          <PlusIcon className="mr-2 size-4" />
          {addButtonLabel}
        </Button>
      </div>
    </div>
  );
}
