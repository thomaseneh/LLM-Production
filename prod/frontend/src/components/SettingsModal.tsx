import type { AppearanceMode } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  appearance: AppearanceMode;
  onAppearanceChange: (
    appearance: AppearanceMode,
  ) => void;
  onClose: () => void;
}

const appearanceOptions: {
  value: AppearanceMode;
  title: string;
  description: string;
}[] = [
  {
    value: "system",
    title: "System",
    description:
      "Use the appearance setting from your device.",
  },
  {
    value: "light",
    title: "Light",
    description:
      "Always use the light appearance.",
  },
  {
    value: "dark",
    title: "Dark",
    description:
      "Always use the dark appearance.",
  },
];

export default function SettingsModal({
  isOpen,
  appearance,
  onAppearanceChange,
  onClose,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        px-4
      "
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="
          w-full
          max-w-2xl
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-2xl
          dark:border-gray-700
          dark:bg-gray-900
        "
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2
            id="settings-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Settings
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="
              rounded-lg
              px-3
              py-2
              text-gray-500
              transition
              hover:bg-gray-100
              hover:text-gray-900
              dark:text-gray-400
              dark:hover:bg-gray-800
              dark:hover:text-white
            "
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-[430px]">
          {/* Settings navigation */}
          <nav className="w-44 shrink-0 border-r border-gray-200 p-3 dark:border-gray-700">
            <button
              type="button"
              className="
                w-full
                rounded-lg
                bg-gray-100
                px-3
                py-2
                text-left
                text-sm
                font-medium
                text-gray-900
                dark:bg-gray-800
                dark:text-white
              "
            >
              General
            </button>
          </nav>

          {/* Settings content */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              General
            </h3>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Appearance
              </h4>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose how Tom&apos;s AI appears on this
                device.
              </p>

              <div className="mt-4 space-y-2">
                {appearanceOptions.map((option) => {
                  const isSelected =
                    appearance === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`
                        flex
                        cursor-pointer
                        items-start
                        gap-3
                        rounded-xl
                        border
                        p-4
                        transition
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="appearance"
                        value={option.value}
                        checked={isSelected}
                        onChange={() =>
                          onAppearanceChange(
                            option.value,
                          )
                        }
                        className="mt-1 h-4 w-4 accent-blue-600"
                      />

                      <span>
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {option.title}
                        </span>

                        <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}