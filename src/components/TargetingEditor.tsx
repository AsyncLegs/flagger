import type { FlagTargeting, FlagVariants, TargetingRule } from "../types/flagd";
import { createConditionId } from "../utils/defaults";
import TargetingCondition from "./TargetingCondition";
import FractionalEditor from "./FractionalEditor";

interface Props {
  targeting: FlagTargeting;
  variants: FlagVariants;
  onChange: (targeting: FlagTargeting) => void;
}

export default function TargetingEditor({ targeting, variants, onChange }: Props) {
  const variantKeys = Object.keys(variants);

  function addRule() {
    const rule: TargetingRule = {
      id: createConditionId(),
      conditions: [
        { id: createConditionId(), variable: "", operator: "==", value: "" },
      ],
      variant: variantKeys[0] || "",
    };
    onChange({ ...targeting, rules: [...targeting.rules, rule] });
  }

  function updateRule(id: string, patch: Partial<TargetingRule>) {
    onChange({
      ...targeting,
      rules: targeting.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  function removeRule(id: string) {
    onChange({ ...targeting, rules: targeting.rules.filter((r) => r.id !== id) });
  }

  function addConditionToRule(ruleId: string) {
    onChange({
      ...targeting,
      rules: targeting.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              conditions: [
                ...r.conditions,
                { id: createConditionId(), variable: "", operator: "==", value: "" },
              ],
            }
          : r
      ),
    });
  }

  function toggleFractional() {
    if (targeting.fractional) {
      onChange({ ...targeting, fractional: null });
    } else {
      onChange({
        ...targeting,
        fractional: variantKeys.map((k, i) => ({
          id: createConditionId(),
          variant: k,
          weight: i === 0 ? 100 : 0,
        })),
      });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-300">Targeting Rules</h4>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={!!targeting.fractional}
              onChange={toggleFractional}
              className="accent-blue-500"
            />
            Fractional
          </label>
        </div>
      </div>

      {targeting.fractional ? (
        <FractionalEditor
          entries={targeting.fractional}
          variants={variants}
          onChange={(entries) => onChange({ ...targeting, fractional: entries })}
        />
      ) : (
        <>
          {targeting.rules.map((rule, ruleIdx) => (
            <div
              key={rule.id}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400 uppercase">
                  {ruleIdx === 0 ? "If" : "Else If"}
                </span>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove Rule
                </button>
              </div>

              <div className="space-y-2">
                {rule.conditions.map((cond, condIdx) => (
                  <div key={cond.id}>
                    {condIdx > 0 && (
                      <span className="text-xs text-gray-500 pl-4 block mb-1">AND</span>
                    )}
                    <TargetingCondition
                      condition={cond}
                      onChange={(updated) =>
                        updateRule(rule.id, {
                          conditions: rule.conditions.map((c) =>
                            c.id === updated.id ? updated : c
                          ),
                        })
                      }
                      onRemove={() =>
                        updateRule(rule.id, {
                          conditions: rule.conditions.filter(
                            (c) => c.id !== cond.id
                          ),
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => addConditionToRule(rule.id)}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                + Add Condition
              </button>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-green-400 font-semibold">THEN &rarr;</span>
                <select
                  value={rule.variant}
                  onChange={(e) => updateRule(rule.id, { variant: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                >
                  {variantKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={addRule}
            className="text-green-400 hover:text-green-300 text-sm px-3 py-1.5 border border-gray-700 rounded"
          >
            + Add Rule
          </button>

          {targeting.rules.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-yellow-400 font-semibold">ELSE &rarr;</span>
              <select
                value={targeting.defaultVariant}
                onChange={(e) =>
                  onChange({ ...targeting, defaultVariant: e.target.value })
                }
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
              >
                {variantKeys.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
