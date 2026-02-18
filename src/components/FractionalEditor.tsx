import type { FractionalEntry, FlagVariants } from "../types/flagd";
import { createConditionId } from "../utils/defaults";

interface Props {
  entries: FractionalEntry[];
  variants: FlagVariants;
  onChange: (entries: FractionalEntry[]) => void;
}

export default function FractionalEditor({ entries, variants, onChange }: Props) {
  const variantKeys = Object.keys(variants);
  const total = entries.reduce((s, e) => s + e.weight, 0);

  function addEntry() {
    const unused = variantKeys.find((k) => !entries.some((e) => e.variant === k));
    onChange([
      ...entries,
      { id: createConditionId(), variant: unused || variantKeys[0] || "", weight: 0 },
    ]);
  }

  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  function updateEntry(id: string, patch: Partial<FractionalEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-300">Fractional Rollout</h4>
        <span
          className={`text-xs font-mono ${total === 100 ? "text-green-400" : "text-red-400"}`}
        >
          {total}/100
        </span>
      </div>
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-2">
          <select
            value={entry.variant}
            onChange={(e) => updateEntry(entry.id, { variant: e.target.value })}
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          >
            {variantKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={100}
            value={entry.weight}
            onChange={(e) =>
              updateEntry(entry.id, { weight: parseInt(e.target.value) || 0 })
            }
            className="w-[70px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-right"
          />
          <span className="text-gray-500 text-sm">%</span>
          <button
            onClick={() => removeEntry(entry.id)}
            className="text-red-400 hover:text-red-300 text-sm px-1"
          >
            &times;
          </button>
        </div>
      ))}
      <button
        onClick={addEntry}
        className="text-green-400 hover:text-green-300 text-sm px-2 py-1 border border-gray-700 rounded"
      >
        + Add Weight
      </button>
    </div>
  );
}
