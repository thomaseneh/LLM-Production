import { useEffect, useState } from "react";

import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import SettingsModal from "./components/SettingsModal";

import type {
  AppearanceMode,
  ModelMode,
} from "./types";

export default function App() {
  const [appearance, setAppearance] =
    useState<AppearanceMode>("system");

  const [selectedModel, setSelectedModel] =
    useState<ModelMode>("auto");

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [chatKey, setChatKey] = useState(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    function applyAppearance() {
      const useDark =
        appearance === "dark" ||
        (
          appearance === "system" &&
          mediaQuery.matches
        );

      document.documentElement.classList.toggle(
        "dark",
        useDark,
      );
    }

    applyAppearance();

    if (appearance === "system") {
      mediaQuery.addEventListener(
        "change",
        applyAppearance,
      );
    }

    localStorage.setItem(
      "appearance",
      appearance,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        applyAppearance,
      );
    };
  }, [appearance]);

  function startNewChat() {
    setChatKey((current) => current + 1);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={startNewChat}
        onOpenSettings={() =>
          setSettingsOpen(true)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          onOpenSidebar={() =>
            setSidebarOpen(true)
          }
        />

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