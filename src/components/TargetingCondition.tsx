import type { TargetingCondition as TCond } from "../types/flagd";
import { OPERATORS } from "../types/flagd";

interface Props {
  condition: TCond;
  onChange: (condition: TCond) => void;
  onRemove: () => void;
}

export default function TargetingCondition({ condition, onChange, onRemove }: Props) {
  return (
    <div className="flex items-center gap-2 pl-4 border-l-2 border-blue-500/30">
      <input
        type="text"
        value={condition.variable}
        onChange={(e) => onChange({ ...condition, variable: e.target.value })}
        placeholder="context variable"
        className="w-[120px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
      />
      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value })}
        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
      >
        {OPERATORS.filter((o) => o !== "fractional").map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={condition.value}
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
        placeholder="value"
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
      />
      <button
        onClick={onRemove}
        className="text-red-400 hover:text-red-300 text-sm px-1"
      >
        &times;
      </button>
    </div>
  );
}
