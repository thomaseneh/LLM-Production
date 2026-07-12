import { useEffect, useRef, useState } from "react";

import ChatBubble from "../components/ChatBubble";
import ChatInput from "../components/ChatInput";
import { streamChat } from "../api/client";
import type { ModelMode } from "../App";

type Message = {
  sender: "user" | "assistant";
  text: string;
};

interface ChatProps {
  selectedModel: ModelMode;
}

export default function Chat({
  selectedModel,
}: ChatProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputFocusRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null!);

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
            const lastIndex = updated.length - 1;
            const lastMessage = updated[lastIndex];

            if (
              lastMessage &&
              lastMessage.sender === "assistant"
            ) {
              updated[lastIndex] = {
                ...lastMessage,
                text: lastMessage.text + chunk,
              };
            }

            return updated;
          });
        },
      );
    } catch (error) {
      console.error("Streaming error:", error);

      setMessages((previous) => {
        const updated = [...previous];
        const lastIndex = updated.length - 1;

        if (
          lastIndex >= 0 &&
          updated[lastIndex].sender === "assistant"
        ) {
          updated[lastIndex] = {
            sender: "assistant",
            text: "Error: backend unreachable.",
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

  return (
    <main className="flex h-full min-h-0 flex-col bg-gray-50 dark:bg-gray-900">
      {!hasMessages ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6">
          <div className="w-full max-w-3xl">
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              inputRef={inputFocusRef}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl space-y-4 px-6 py-6">
              {messages.map((message, index) => (
                <ChatBubble
                  key={`${message.sender}-${index}`}
                  sender={message.sender}
                  text={message.text}
                />
              ))}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto w-full max-w-3xl">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                inputRef={inputFocusRef}
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}