export default function Navbar() {
  return (
    <header className="shrink-0 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Tom&apos;s AI
        </h1>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="
              rounded-lg
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              transition
              hover:bg-white
              dark:text-gray-200
              dark:hover:bg-gray-700
            "
          >
            Login
          </button>

          <button
            type="button"
            className="
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-700
            "
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}