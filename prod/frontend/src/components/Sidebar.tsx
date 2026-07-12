interface SidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  onNewChat,
  onOpenSettings,
}: SidebarProps) {
  return (
    <aside
  className="
    flex
    h-dvh
    w-64
    shrink-0
    flex-col
    border-r
    border-gray-200
    bg-white
    dark:border-gray-700
    dark:bg-gray-950
  "
>
      {/* Top section */}
      <button
        type="button"
        onClick={onNewChat}
        className="
          flex
          w-full
          items-center
          gap-3
          rounded-lg
          px-3
          py-3
          text-left
          text-sm
          font-medium
          text-gray-800
          transition
          hover:bg-gray-200
          dark:text-gray-100
          dark:hover:bg-gray-800
        "
      >
        <span className="text-xl leading-none">＋</span>
        <span>New chat</span>
      </button>

      {/* Future chat-history area */}
      <div className="min-h-0 flex-1 overflow-y-auto py-3">
        <p className="px-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Chats
        </p>
      </div>

      {/* Bottom section */}
      <div className="space-y-1 border-t border-gray-200 pt-3 dark:border-gray-800">
        <button
          type="button"
          onClick={() => {
            console.log("Open plans and pricing");
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-3
            text-left
            text-sm
            text-gray-700
            transition
            hover:bg-gray-200
            dark:text-gray-200
            dark:hover:bg-gray-800
          "
        >
          <span>💳</span>
          <span>Plan and pricing</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-3
            text-left
            text-sm
            text-gray-700
            transition
            hover:bg-gray-200
            dark:text-gray-200
            dark:hover:bg-gray-800
          "
        >
          <span>⚙️</span>
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => {
            console.log("Open help");
          }}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-3
            py-3
            text-left
            text-sm
            text-gray-700
            transition
            hover:bg-gray-200
            dark:text-gray-200
            dark:hover:bg-gray-800
          "
        >
          <span>❔</span>
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
}