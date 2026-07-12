import {
  useEffect,
  useState,
} from "react";

import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import SettingsModal from "./components/SettingsModal";

import type {
  AppearanceMode,
  ModelMode,
} from "./types";

function getSavedAppearance(): AppearanceMode {
  try {
    const saved =
      localStorage.getItem("appearance");

    if (
      saved === "system" ||
      saved === "light" ||
      saved === "dark"
    ) {
      return saved;
    }
  } catch {
    // Use system when storage is unavailable.
  }

  return "system";
}

function getSavedModel(): ModelMode {
  try {
    const saved =
      localStorage.getItem("selectedModel");

    if (
      saved === "auto" ||
      saved === "reasoning" ||
      saved === "code" ||
      saved === "math" ||
      saved === "support"
    ) {
      return saved;
    }
  } catch {
    // Use auto when storage is unavailable.
  }

  return "auto";
}

export default function App() {
  const [appearance, setAppearance] =
    useState<AppearanceMode>(
      getSavedAppearance,
    );

  const [selectedModel, setSelectedModel] =
    useState<ModelMode>(getSavedModel);

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  // Incrementing this key remounts Chat and clears
  // the current in-memory conversation.
  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    function applyAppearance() {
      const shouldUseDark =
        appearance === "dark" ||
        (
          appearance === "system" &&
          mediaQuery.matches
        );

      document.documentElement.classList.toggle(
        "dark",
        shouldUseDark,
      );
    }

    applyAppearance();

    if (appearance === "system") {
      mediaQuery.addEventListener(
        "change",
        applyAppearance,
      );
    }

    try {
      localStorage.setItem(
        "appearance",
        appearance,
      );
    } catch {
      // Ignore storage failures.
    }

    return () => {
      mediaQuery.removeEventListener(
        "change",
        applyAppearance,
      );
    };
  }, [appearance]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "selectedModel",
        selectedModel,
      );
    } catch {
      // Ignore storage failures.
    }
  }, [selectedModel]);

  function startNewChat() {
    setChatKey((current) => current + 1);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar
        onNewChat={startNewChat}
        onOpenSettings={() =>
          setSettingsOpen(true)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <div className="min-h-0 flex-1">
          <Chat
            key={chatKey}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        appearance={appearance}
        onAppearanceChange={setAppearance}
        onClose={() =>
          setSettingsOpen(false)
        }
      />
    </div>
  );
}