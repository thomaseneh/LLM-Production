import type {
  KeyboardEvent,
  RefObject,
} from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  inputRef?: RefObject<
    HTMLInputElement | HTMLTextAreaElement
  >;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  inputRef,
  disabled = false,
}: ChatInputProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      const trimmed = value.trim();

      if (!trimmed || disabled) return;

      onSend(trimmed);
    }
  }

  return (
    <textarea
      ref={
        inputRef as RefObject<HTMLTextAreaElement>
      }
      value={value}
      rows={1}
      disabled={disabled}
      placeholder="Type your question here..."
      onChange={(event) =>
        onChange(event.target.value)
      }
      onKeyDown={handleKeyDown}
      className="
        block
        max-h-40
        min-h-10
        w-full
        resize-none
        overflow-y-auto
        border-0
        bg-transparent
        px-1
        py-2
        text-sm
        leading-6
        text-gray-900
        outline-none
        placeholder:text-gray-400
        disabled:cursor-not-allowed
        disabled:opacity-60

        dark:text-white
        dark:placeholder:text-gray-500

        sm:text-base
      "
    />
  );
}