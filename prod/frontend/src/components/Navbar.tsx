import { Menu } from "lucide-react";

interface NavbarProps {
  onOpenSidebar: () => void;
}

export default function Navbar({
  onOpenSidebar,
}: NavbarProps) {
  return (
    <header
      className="
        shrink-0
        border-b border-gray-200
        bg-white
        dark:border-gray-700
        dark:bg-gray-900
      "
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="
              rounded-lg p-2
              text-gray-700
              hover:bg-gray-100
              dark:text-gray-200
              dark:hover:bg-gray-800
              md:hidden
            "
          >
            <Menu size={22} />
          </button>

          <h1 className="truncate text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
            Tom&apos;s AI
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="
              hidden rounded-lg px-3 py-2
              text-sm font-medium
              text-gray-700
              hover:bg-gray-100
              dark:text-gray-200
              dark:hover:bg-gray-800
              sm:block
            "
          >
            Login
          </button>

          <button
            type="button"
            className="
              rounded-lg bg-blue-600
              px-3 py-2
              text-sm font-medium text-white
              hover:bg-blue-700
              sm:px-4
            "
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}