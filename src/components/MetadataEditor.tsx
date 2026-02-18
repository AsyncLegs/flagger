import { useState } from "react";

interface Props {
  metadata: Record<string, string | number | boolean>;
  onChange: (metadata: Record<string, string | number | boolean>) => void;
}

export default function MetadataEditor({ metadata, onChange }: Props) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const entries = Object.entries(metadata);

  function addEntry() {
    if (!newKey.trim()) return;
    onChange({ ...metadata, [newKey.trim()]: newValue });
    setNewKey("");
    setNewValue("");
  }

  function removeEntry(key: string) {
    const next = { ...metadata };
    delete next[key];
    onChange(next);
  }

  function updateValue(key: string, value: string) {
    const num = Number(value);
    const parsed =
      value === "true" ? true : value === "false" ? false : isNaN(num) ? value : num;
    onChange({ ...metadata, [key]: parsed });
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-300">Metadata</h4>
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-sm text-gray-400 min-w-[80px]">{key}</span>
          <input
            type="text"
            value={String(value)}
            onChange={(e) => updateValue(key, e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={() => removeEntry(key)}
            className="text-red-400 hover:text-red-300 text-sm px-1"
          >
            &times;
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="w-[80px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && addEntry()}
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && addEntry()}
        />
        <button
          onClick={addEntry}
          className="text-green-400 hover:text-green-300 text-sm px-2 py-1 border border-gray-700 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}
