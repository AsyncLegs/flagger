import { useState } from "react";
import type { FlagType, FlagVariants, VariantValue } from "../types/flagd";

interface Props {
  variants: FlagVariants;
  flagType: FlagType;
  onChange: (variants: FlagVariants) => void;
}

function parseValue(raw: string, flagType: FlagType): VariantValue {
  switch (flagType) {
    case "boolean":
      return raw === "true";
    case "number":
      return Number(raw) || 0;
    case "object":
      try {
        return JSON.parse(raw);
      } catch {
        return {};
      }
    default:
      return raw;
  }
}

function displayValue(value: unknown): string {
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function VariantsEditor({ variants, flagType, onChange }: Props) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const entries = Object.entries(variants);

  function addVariant() {
    if (!newKey.trim()) return;
    if (newKey in variants) return;
    onChange({ ...variants, [newKey.trim()]: parseValue(newValue, flagType) } as FlagVariants);
    setNewKey("");
    setNewValue("");
  }

  function removeVariant(key: string) {
    const next = { ...variants };
    delete next[key];
    onChange(next);
  }

  function updateVariantKey(oldKey: string, newKeyName: string) {
    if (!newKeyName.trim() || newKeyName === oldKey) return;
    const next: FlagVariants = {};
    for (const [k, v] of Object.entries(variants)) {
      next[k === oldKey ? newKeyName.trim() : k] = v;
    }
    onChange(next);
  }

  function updateVariantValue(key: string, raw: string) {
    onChange({ ...variants, [key]: parseValue(raw, flagType) } as FlagVariants);
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-300">Variants</h4>
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <input
            type="text"
            defaultValue={key}
            onBlur={(e) => updateVariantKey(key, e.target.value)}
            className="w-[100px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
          />
          <span className="text-gray-500">&rarr;</span>
          {flagType === "boolean" ? (
            <select
              value={String(value)}
              onChange={(e) => updateVariantValue(key, e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type="text"
              value={displayValue(value)}
              onChange={(e) => updateVariantValue(key, e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
            />
          )}
          <button
            onClick={() => removeVariant(key)}
            className="text-red-400 hover:text-red-300 text-sm px-1"
          >
            &times;
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="w-[100px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
          onKeyDown={(e) => e.key === "Enter" && addVariant()}
        />
        <span className="text-gray-500">&rarr;</span>
        <input
          type="text"
          placeholder="value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
          onKeyDown={(e) => e.key === "Enter" && addVariant()}
        />
        <button
          onClick={addVariant}
          className="text-green-400 hover:text-green-300 text-sm px-2 py-1 border border-gray-700 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}
