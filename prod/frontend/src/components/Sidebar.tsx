import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  onOpenSettings,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-gray-200
          bg-white
          transition-transform duration-200
          dark:border-gray-800
          dark:bg-gray-950

          md:static
          md:z-auto
          md:translate-x-0

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div className="flex items-center justify-between p-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="
              flex flex-1 items-center gap-3
              rounded-lg px-3 py-3
              text-sm font-medium
              text-gray-800
              hover:bg-gray-100
              dark:text-gray-100
              dark:hover:bg-gray-800
            "
          >
            <span className="text-xl">＋</span>
            New chat
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="
              rounded-lg p-2
              text-gray-500
              hover:bg-gray-100
              dark:text-gray-400
              dark:hover:bg-gray-800
              md:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-400">
            Chats
          </p>
        </div>

        <div className="space-y-1 border-t border-gray-200 p-3 dark:border-gray-800">
          <button
            type="button"
            className="
              flex w-full items-center gap-3
              rounded-lg px-3 py-3
              text-left text-sm
              text-gray-700
              hover:bg-gray-100
              dark:text-gray-200
              dark:hover:bg-gray-800
            "
          >
            <span>💳</span>
            Plan and pricing
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="
              flex w-full items-center gap-3
              rounded-lg px-3 py-3
              text-left text-sm
              text-gray-700
              hover:bg-gray-100
              dark:text-gray-200
              dark:hover:bg-gray-800
            "
          >
            <span>⚙️</span>
            Settings
          </button>

          <button
            type="button"
            className="
              flex w-full items-center gap-3
              rounded-lg px-3 py-3
              text-left text-sm
              text-gray-700
              hover:bg-gray-100
              dark:text-gray-200
              dark:hover:bg-gray-800
            "
          >
            <span>❔</span>
            Help
          </button>
        </div>
      </aside>
    </>
  );
}