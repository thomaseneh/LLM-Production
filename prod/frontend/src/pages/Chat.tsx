import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Brain,
  Check,
  ChevronDown,
  Code2,
  Headphones,
  Sigma,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { streamChat } from "../api/client";
import type { ModelMode } from "../types";

type Message = {
  sender: "user" | "assistant";
  text: string;
};

interface ChatProps {
  selectedModel: ModelMode;
  onModelChange: (model: ModelMode) => void;
}

interface ModelOption {
  value: ModelMode;
  label: string;
  description: string;
  icon: LucideIcon;
}

const modelOptions: ModelOption[] = [
  {
    value: "auto",
    label: "Auto",
    description: "Automatically choose the best model",
    icon: Sparkles,
  },
  {
    value: "reasoning",
    label: "Deep Reasoning",
    description: "Best for analysis and explanations",
    icon: Brain,
  },
  {
    value: "code",
    label: "Write Code",
    description: "Programming and debugging",
    icon: Code2,
  },
  {
    value: "math",
    label: "Maths",
    description: "Calculations and equations",
    icon: Sigma,
  },
  {
    value: "support",
    label: "Customer Support",
    description: "Orders, refunds, and customer help",
    icon: Headphones,
  },
];

interface ModelPickerProps {
  selectedModel: ModelMode;
  onModelChange: (model: ModelMode) => void;
  disabled?: boolean;
}

function ModelPicker({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const selectedOption =
    modelOptions.find(
      (option) => option.value === selectedModel,
    ) ?? modelOptions[0];

  const SelectedIcon = selectedOption.icon;

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  function selectModel(model: ModelMode) {
    onModelChange(model);
    setIsOpen(false);
  }

  return (
    <div
      ref={pickerRef}
      className="relative w-full shrink-0 sm:w-auto"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="
          flex
          h-12
          w-full sm:min-w-[190px] sm:w-auto
          items-center
          justify-between
          gap-3
          rounded-xl
          border
          border-gray-300
          bg-white
          px-4
          text-left
          text-sm
          text-gray-900
          shadow-sm
          outline-none
          transition
          hover:bg-gray-50
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-500/20
          disabled:cursor-not-allowed
          disabled:opacity-60

          dark:border-gray-700
          dark:bg-gray-800
          dark:text-white
          dark:hover:bg-gray-700
        "
      >
        <span className="flex min-w-0 items-center gap-2">
          <SelectedIcon
            size={18}
            className="shrink-0 text-blue-600 dark:text-blue-400"
          />

          <span className="truncate font-medium">
            {selectedOption.label}
          </span>
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="
            absolute
            bottom-full
            left-0
            z-40
            mb-2
            w-full sm:w-80
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
            p-1.5
            shadow-xl

            dark:border-gray-700
            dark:bg-gray-800
          "
        >
          {modelOptions.map((option) => {
            const Icon = option.icon;
            const isSelected =
              option.value === selectedModel;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() =>
                  selectModel(option.value)
                }
                className={`
                  flex
                  w-full
                  items-start
                  gap-3
                  rounded-lg
                  px-3
                  py-3
                  text-left
                  transition
                  ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/40"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                <Icon
                  size={19}
                  className="
                    mt-0.5
                    shrink-0
                    text-blue-600
                    dark:text-blue-400
                  "
                />

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>

                  <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                    {option.description}
                  </span>
                </span>

                {isSelected && (
                  <Check
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                      text-blue-600
                      dark:text-blue-400
                    "
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Chat({
  selectedModel,
  onModelChange,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] =
    useState<Message[]>([]);
  const [isLoading, setIsLoading] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  const inputFocusRef = useRef<
    HTMLInputElement | HTMLTextAreaElement
  >(null!);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    requestAnimationFrame(() => {
      inputFocusRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!hasMessages) return;

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, hasMessages]);

  async function handleSend(message: string) {
    const trimmed = message.trim();

    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setInput("");

    setMessages((previous) => [
      ...previous,
      {
        sender: "user",
        text: trimmed,
      },
      {
        sender: "assistant",
        text: "",
      },
    ]);

    try {
      await streamChat(
        trimmed,
        selectedModel,
        (chunk) => {
          setMessages((previous) => {
            const updated = [...previous];
            const lastIndex =
              updated.length - 1;
            const lastMessage =
              updated[lastIndex];

            if (
              lastMessage &&
              lastMessage.sender ===
                "assistant"
            ) {
              updated[lastIndex] = {
                ...lastMessage,
                text:
                  lastMessage.text +
                  chunk,
              };
            }

            return updated;
          });
        },
      );
    } catch (error) {
      console.error(
        "Streaming error:",
        error,
      );

      setMessages((previous) => {
        const updated = [...previous];
        const lastIndex =
          updated.length - 1;

        if (
          lastIndex >= 0 &&
          updated[lastIndex].sender ===
            "assistant"
        ) {
          updated[lastIndex] = {
            sender: "assistant",
            text:
              "Error: backend unreachable.",
          };
        }

        return updated;
      });
    } finally {
      setIsLoading(false);

      requestAnimationFrame(() => {
        inputFocusRef.current?.focus();
      });
    }
  }

  const inputArea = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
      <ModelPicker
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        disabled={isLoading}
      />

      <div className="min-w-0 flex-1">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          inputRef={inputFocusRef}
        />
      </div>
    </div>
  );

  return (
    <main className="flex h-full min-h-0 flex-col bg-white dark:bg-gray-900">
      {!hasMessages ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <div className="w-full max-w-4xl">
            {inputArea}
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 sm:px-6 sm:py-6">
              {messages.map(
                (message, index) => (
                  <ChatBubble
                    key={`${message.sender}-${index}`}
                    sender={
                      message.sender
                    }
                    text={message.text}
                  />
                ),
              )}

              <div ref={bottomRef} />
            </div>
          </div>

          <div
            className="
              shrink-0
              border-t
              border-gray-200
              bg-white
              p-4

              dark:border-gray-700
              dark:bg-gray-900
            "
          >
            <div className="mx-auto w-full max-w-4xl px-1 sm:px-0">
              {inputArea}
            </div>
          </div>
        </>
      )}
    </main>
  );
}