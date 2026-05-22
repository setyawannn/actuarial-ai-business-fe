"use client";

import * as React from "react";

import { Textarea } from "@/components/ui/textarea";

export type PromptEditorTextareaHandle = {
  insertToken: (token: string) => void;
  focus: () => void;
};

export const PromptEditorTextarea = React.forwardRef<
  PromptEditorTextareaHandle,
  {
    initialValue: string;
    onValueChange: (value: string) => void;
  }
>(function PromptEditorTextarea({ initialValue, onValueChange }, forwardedRef) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const emitCurrentValue = React.useCallback(() => {
    if (!textareaRef.current) return;
    onValueChange(textareaRef.current.value);
  }, [onValueChange]);

  React.useImperativeHandle(forwardedRef, () => ({
    insertToken(token: string) {
      if (!textareaRef.current) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;

      textarea.focus();
      textarea.setRangeText(token, start, end, "end");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    },
    focus() {
      textareaRef.current?.focus();
    },
  }));

  React.useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.value = initialValue;
  }, [initialValue]);

  return (
    <Textarea
      ref={textareaRef}
      defaultValue={initialValue}
      className="min-h-[720px] resize-y font-mono text-[13px] leading-6"
      onInput={emitCurrentValue}
      onDragOver={(event) => event.preventDefault()}
      placeholder="Write the prompt here..."
      spellCheck={false}
    />
  );
});
