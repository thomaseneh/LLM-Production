// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000/api/v1",
// });

// export async function sendChat(message: string): Promise<string> {
//   const res = await api.post("/chat", { message });
//   return res.data.reply;
// }

import type { ModelMode } from "../types";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "";

export async function streamChat(
  message: string,
  model: ModelMode,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/v1/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        model,
      }),
    },
  );

  if (!response.ok) {
  const errorText = await response.text();

  throw new Error(
    `Chat request failed: ${response.status} ${errorText}`,
  );
}

  if (!response.body) {
    throw new Error("Streaming response body is missing.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, {
      stream: true,
    });

    onChunk(chunk);
  }

  const finalChunk = decoder.decode();

  if (finalChunk) {
    onChunk(finalChunk);
  }
}