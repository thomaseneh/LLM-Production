import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatBubble({
  sender,
  text,
}: {
  sender: "user" | "assistant";
  text: string;
}) {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl bg-blue-600 px-5 py-3 text-white"
            : "w-full max-w-3xl px-2 py-4 text-gray-900 dark:text-gray-100"
        }
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div
            className="
              prose
              prose-slate
              max-w-none
              dark:prose-invert

              prose-headings:mb-3
              prose-headings:mt-6

              prose-p:my-3
              prose-p:leading-7

              prose-ul:my-3
              prose-ol:my-3
              prose-li:my-1

              prose-pre:overflow-x-auto
              prose-pre:rounded-xl
              prose-pre:bg-gray-950

              prose-code:before:content-none
              prose-code:after:content-none
            "
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}