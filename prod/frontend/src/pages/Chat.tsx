import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowUp,
  Brain,
  Check,
  ChevronDown,
  Code2,
  Headphones,
  Sigma,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { streamChat } from "../api/client";
import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
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

interface ModelPickerProps {
  selectedModel: ModelMode;
  onModelChange: (model: ModelMode) => void;
  disabled?: boolean;
}

const modelOptions: ModelOption[] = [
  {
    value: "auto",
    label: "Auto",
    description:
      "Automatically choose the best model",
    icon: Sparkles,
  },
  {
    value: "reasoning",
    label: "Deep Reasoning",
    description:
      "Best for analysis and explanations",
    icon: Brain,
  },
  {
    value: "code",
    label: "Write Code",
    description:
      "Programming and debugging",
    icon: Code2,
  },
  {
    value: "math",
    label: "Maths",
    description:
      "Calculations and equations",
    icon: Sigma,
  },
  {
    value: "support",
    label: "Customer Support",
    description:
      "Orders, refunds, and customer help",
    icon: Headphones,
  },
];

function ModelPicker({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelPickerProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const pickerRef =
    useRef<HTMLDivElement | null>(null);

  const selectedOption =
    modelOptions.find(
      (option) =>
        option.value === selectedModel,
    ) ?? modelOptions[0];

  const SelectedIcon =
    selectedOption.icon;

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(
      event: globalThis.KeyboardEvent,
    ) {
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

  function selectModel(
    model: ModelMode,
  ) {
    onModelChange(model);
    setIsOpen(false);
  }

  return (
    <div
      ref={pickerRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen(
            (previous) => !previous,
          )
        }
        className="
          flex
          h-9
          max-w-[155px]
          items-center
          gap-2
          rounded-lg
          bg-transparent
          px-2
          text-left
          text-sm
          font-medium
          text-gray-700
          outline-none
          transition
          hover:bg-gray-100
          focus-visible:ring-2
          focus-visible:ring-blue-500/30
          disabled:cursor-not-allowed
          disabled:opacity-50

          dark:text-gray-200
          dark:hover:bg-gray-700
        "
      >
        <SelectedIcon
          size={17}
          className="
            shrink-0
            text-blue-600
            dark:text-blue-400
          "
        />

        <span className="truncate">
          {selectedOption.label}
        </span>

        <ChevronDown
          size={15}
          className={`
            shrink-0
            text-gray-500
            transition-transform
            dark:text-gray-400
            ${
              isOpen
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="
            absolute
            bottom-full
            left-0
            z-50
            mb-2
            w-[min(20rem,calc(100vw-2rem))]
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
          {modelOptions.map(
            (option) => {
              const Icon =
                option.icon;

              const isSelected =
                option.value ===
                selectedModel;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={
                    isSelected
                  }
                  onClick={() =>
                    selectModel(
                      option.value,
                    )
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
                      {
                        option.label
                      }
                    </span>

                    <span className="mt-0.5 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {
                        option.description
                      }
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
            },
          )}
        </div>
      )}
    </div>
  );
}

export default function Chat({
  selectedModel,
  onModelChange,
}: ChatProps) {
  const [input, setInput] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  const inputFocusRef = useRef<
    HTMLInputElement | HTMLTextAreaElement
  >(null!);

  const hasMessages =
    messages.length > 0;

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

  async function handleSend(
    message: string,
  ) {
    const trimmed = message.trim();

    if (!trimmed || isLoading) {
      return;
    }

    setIsLoading(true);
    setInput("");

    setMessages(
      (previousMessages) => [
        ...previousMessages,
        {
          sender: "user",
          text: trimmed,
        },
        {
          sender: "assistant",
          text: "",
        },
      ],
    );

    try {
      await streamChat(
        trimmed,
        selectedModel,
        (chunk) => {
          setMessages(
            (previousMessages) => {
              const updatedMessages = [
                ...previousMessages,
              ];

              const lastIndex =
                updatedMessages.length -
                1;

              const lastMessage =
                updatedMessages[
                  lastIndex
                ];

              if (
                lastMessage?.sender ===
                "assistant"
              ) {
                updatedMessages[
                  lastIndex
                ] = {
                  ...lastMessage,
                  text:
                    lastMessage.text +
                    chunk,
                };
              }

              return updatedMessages;
            },
          );
        },
      );
    } catch (error) {
      console.error(
        "Streaming error:",
        error,
      );

      setMessages(
        (previousMessages) => {
          const updatedMessages = [
            ...previousMessages,
          ];

          const lastIndex =
            updatedMessages.length - 1;

          if (
            lastIndex >= 0 &&
            updatedMessages[lastIndex]
              .sender === "assistant"
          ) {
            updatedMessages[
              lastIndex
            ] = {
              sender: "assistant",
              text:
                "Error: backend unreachable.",
            };
          }

          return updatedMessages;
        },
      );
    } finally {
      setIsLoading(false);

      requestAnimationFrame(() => {
        inputFocusRef.current?.focus();
      });
    }
  }

  const canSend =
    input.trim().length > 0 &&
    !isLoading;

  const composer = (
    <div
      className="
        w-full
        rounded-2xl
        border
        border-gray-300
        bg-white
        px-3
        py-2
        shadow-sm
        transition
        focus-within:border-blue-500
        focus-within:ring-2
        focus-within:ring-blue-500/20

        dark:border-gray-700
        dark:bg-gray-800
      "
    >
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        inputRef={inputFocusRef}
        disabled={isLoading}
      />

      <div className="mt-1 flex items-center justify-between gap-2">
        <ModelPicker
          selectedModel={
            selectedModel
          }
          onModelChange={
            onModelChange
          }
          disabled={isLoading}
        />

        <button
          type="button"
          aria-label="Send message"
          disabled={!canSend}
          onClick={() =>
            handleSend(input)
          }
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-blue-600
            text-white
            transition
            hover:bg-blue-700
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-blue-500/40
            disabled:cursor-not-allowed
            disabled:bg-gray-300
            disabled:text-gray-500

            dark:disabled:bg-gray-600
            dark:disabled:text-gray-300
          "
        >
          {isLoading ? (
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-white/40
                border-t-white
              "
            />
          ) : (
            <ArrowUp size={18} />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <main className="flex h-full min-h-0 flex-col bg-white dark:bg-gray-900">
      {!hasMessages ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-3xl">
            {composer}
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4 sm:px-6 sm:py-6">
              {messages.map(
                (
                  message,
                  index,
                ) => (
                  <ChatBubble
                    key={`${message.sender}-${index}`}
                    sender={
                      message.sender
                    }
                    text={
                      message.text
                    }
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
              px-4
              pb-4
              pt-3

              dark:border-gray-700
              dark:bg-gray-900

              sm:px-6
            "
          >
            <div className="mx-auto w-full max-w-3xl">
              {composer}
            </div>
          </div>
        </>
      )}
    </main>
  );
}