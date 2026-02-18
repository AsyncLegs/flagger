import { useState } from "react";
import { useFlagStore } from "../hooks/useFlags";

export default function FlagList() {
  const { flags, selectedFlagKey, selectFlag, addFlag, deleteFlag } = useFlagStore();
  const [search, setSearch] = useState("");
  const [newFlagKey, setNewFlagKey] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = flags.filter((f) =>
    f.key.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    const key = newFlagKey.trim();
    if (!key) return;
    addFlag(key);
    setNewFlagKey("");
    setShowAdd(false);
  }

  return (
    <div className="w-[240px] border-r border-gray-800 flex flex-col bg-gray-950">
      <div className="p-3 border-b border-gray-800">
        <input
          type="text"
          placeholder="Search flags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm placeholder-gray-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((flag) => (
          <div
            key={flag.key}
            className={`flex items-center justify-between px-3 py-2 cursor-pointer text-sm border-b border-gray-800/50 transition-colors ${
              selectedFlagKey === flag.key
                ? "bg-blue-600/15 text-blue-400"
                : "hover:bg-gray-800/50 text-gray-300"
            }`}
            onClick={() => selectFlag(flag.key)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  flag.state === "ENABLED" ? "bg-green-400" : "bg-gray-500"
                }`}
              />
              <span className="truncate font-mono text-xs">{flag.key}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete flag "${flag.key}"?`)) {
                  deleteFlag(flag.key);
                }
              }}
              className="text-red-400/50 hover:text-red-400 text-xs shrink-0 ml-1"
            >
              &times;
            </button>
          </div>
        ))}

        {filtered.length === 0 && flags.length > 0 && (
          <p className="text-gray-600 text-xs p-3 text-center">No flags match</p>
        )}
        {flags.length === 0 && (
          <p className="text-gray-600 text-xs p-3 text-center">No flags yet</p>
        )}
      </div>

      <div className="p-2 border-t border-gray-800">
        {showAdd ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              placeholder="flag-key"
              value={newFlagKey}
              onChange={(e) => setNewFlagKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
              className="min-w-0 flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
            />
            <button
              onClick={handleAdd}
              className="shrink-0 text-green-400 hover:text-green-300 text-xs px-1.5 py-1 border border-green-600/50 rounded"
            >
              Add
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="shrink-0 text-gray-400 hover:text-gray-300 text-xs w-6 h-6 flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-1 border border-dashed border-gray-700 rounded"
          >
            + Add Flag
          </button>
        )}
      </div>
    </div>
  );
}
