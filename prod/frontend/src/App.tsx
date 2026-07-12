import { useEffect, useState } from "react";
import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";

export type ModelMode =
  | "auto"
  | "reasoning"
  | "code"
  | "math"
  | "support";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("darkMode");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [selectedModel, setSelectedModel] = useState<ModelMode>(() => {
    const saved = localStorage.getItem("selectedModel");

    if (
      saved === "auto" ||
      saved === "reasoning" ||
      saved === "code" ||
      saved === "math" ||
      saved === "support"
    ) {
      return saved;
    }

    return "auto";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    try {
      localStorage.setItem(
        "darkMode",
        JSON.stringify(darkMode),
      );
    } catch {}
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(
      "selectedModel",
      selectedModel,
    );
  }, [selectedModel]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Navbar
        darkMode={darkMode}
        toggleDark={() =>
          setDarkMode((previous) => !previous)
        }
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="min-h-0 flex-1">
        <Chat selectedModel={selectedModel} />
      </div>
    </div>
  );
}