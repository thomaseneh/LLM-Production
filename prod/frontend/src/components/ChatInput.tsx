// type Props = {
//   value: string;
//   onChange: (value: string) => void;
//   onSend: (value: string) => void;
// };

// export default function ChatInput({
//   value,
//   onChange,
//   onSend,
// }: Props) {

//   function handleSend() {
//     if (!value.trim()) return;

//     onSend(value);
//   }

//   return (
//     <div className="flex items-center gap-3 bg-white rounded-xl shadow-md p-3">

//       <input
//         className="flex-1 bg-transparent outline-none"
//         value={value}
//         placeholder="Ask Tom's AI anything..."
//         onChange={(e) => onChange(e.target.value)}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") handleSend();
//         }}
//       />

//       <button
//         className="bg-blue-600 hover:bg-blue-700 rounded-lg text-white px-5 py-2"
//         onClick={handleSend}
//       >
//         Send
//       </button>

//     </div>
//   );
// }

import React from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  multiline?: boolean; // optional: use textarea when true
};

export default function ChatInput({
  value,
  onChange,
  onSend,
  inputRef,
  multiline = false,
}: Props) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
  }

  // If you want a single-line input:
  if (!multiline) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your question here..."
          className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          // optional: prevent Enter from submitting when you want Shift+Enter behavior for multiline
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Send
        </button>
      </form>
    );
  }

  // Multiline textarea with Shift+Enter newline, Enter to send
  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your question here..."
        className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            // prevent newline and submit
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed) onSend(trimmed);
          }
        }}
      />
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Send
      </button>
    </form>
  );
}
