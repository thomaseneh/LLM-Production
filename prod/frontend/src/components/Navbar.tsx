// interface NavbarProps {
//   darkMode: boolean;
//   toggleDark: () => void;
// }

// export default function Navbar({ darkMode, toggleDark }: NavbarProps) {
//   return (
//     <header className="w-full bg-white dark:bg-gray-800">
//       <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tom's AI</h1>

//         <div className="flex items-center gap-3">
//           {/* Theme toggle: icon + optional label on larger screens */}
//           <button
//             type="button"
//             onClick={() => {
//               if (typeof toggleDark === "function") toggleDark();
//               else console.warn("toggleDark not provided");
//             }}
//             aria-pressed={darkMode}
//             aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm flex items-center gap-2 hover:shadow-sm transition z-10"
//           >
//             <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
//             <span className="hidden sm:inline text-xs dark:text-white text-gray-800">
//               {darkMode ? "Light" : "Dark"}
//             </span>
//           </button>

//           {/* Auth actions */}
//           <button className="hidden sm:inline text-gray-700 dark:text-gray-200 hover:text-blue-600 transition">
//             Login
//           </button>

//           <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
//             Sign Up
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }

import type { ModelMode } from "../App";

interface NavbarProps {
  darkMode: boolean;
  toggleDark: () => void;
  selectedModel: ModelMode;
  onModelChange: (model: ModelMode) => void;
}

const modelOptions: {
  value: ModelMode;
  label: string;
}[] = [
  {
    value: "auto",
    label: "Auto",
  },
  {
    value: "reasoning",
    label: "Deep Reasoning",
  },
  {
    value: "code",
    label: "Write Code",
  },
  {
    value: "math",
    label: "Maths",
  },
  {
    value: "support",
    label: "Customer Support",
  },
];

export default function Navbar({
  darkMode,
  toggleDark,
  selectedModel,
  onModelChange,
}: NavbarProps) {
  return (
    <header className="shrink-0 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-16 w-full items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Tom&apos;s AI
        </h1>

        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={(event) =>
              onModelChange(
                event.target.value as ModelMode,
              )
            }
            className="
              rounded-lg
              border
              border-gray-300
              bg-white
              px-3
              py-2
              text-sm
              text-gray-900
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
              dark:border-gray-600
              dark:bg-gray-700
              dark:text-white
            "
          >
            {modelOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={toggleDark}
            className="
              rounded-lg
              bg-gray-200
              px-3
              py-2
              text-sm
              text-gray-800
              transition
              hover:bg-gray-300
              dark:bg-gray-700
              dark:text-gray-100
              dark:hover:bg-gray-600
            "
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
    </header>
  );
}