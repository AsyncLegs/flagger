import { useState, useEffect } from "react";
import { useFlagStore } from "../hooks/useFlags";
import type { FlagType, FlagEntry } from "../types/flagd";
import { defaultVariantsForType } from "../utils/defaults";
import { validateFlag } from "../utils/validation";
import VariantsEditor from "./VariantsEditor";
import TargetingEditor from "./TargetingEditor";
import MetadataEditor from "./MetadataEditor";

export default function FlagEditor() {
  const { flags, selectedFlagKey, updateFlag, renameFlag } = useFlagStore();
  const flag = flags.find((f) => f.key === selectedFlagKey);
  const [editKey, setEditKey] = useState("");

  useEffect(() => {
    if (flag) setEditKey(flag.key);
  }, [flag?.key]);

  if (!flag) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select or create a flag to edit
      </div>
    );
  }

  const errors = validateFlag(flag);

  function update(patch: Partial<FlagEntry>) {
    if (!flag) return;
    updateFlag({ ...flag, ...patch });
  }

  function handleKeyBlur() {
    if (!flag) return;
    const trimmed = editKey.trim();
    if (trimmed && trimmed !== flag.key) {
      renameFlag(flag.key, trimmed);
    }
  }

  function handleTypeChange(newType: FlagType) {
    if (!flag) return;
    const hasCustomVariants = Object.keys(flag.variants).length > 0;
    if (
      hasCustomVariants &&
      !confirm(
        `Changing type to "${newType}" will replace existing variants. Continue?`
      )
    ) {
      return;
    }
    const newVariants = defaultVariantsForType(newType);
    const firstKey = Object.keys(newVariants)[0] || "";
    updateFlag({
      ...flag,
      flagType: newType,
      variants: newVariants,
      defaultVariant: firstKey,
      targeting: {
        ...flag.targeting,
        defaultVariant: firstKey,
      },
    });
  }

  const variantKeys = Object.keys(flag.variants);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {errors.length > 0 && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-red-400 text-xs">
              {e.field}: {e.message}
            </p>
          ))}
        </div>
      )}

      {/* Key */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-400 uppercase">Flag Key</label>
        <input
          type="text"
          value={editKey}
          onChange={(e) => setEditKey(e.target.value)}
          onBlur={handleKeyBlur}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 font-mono"
        />
      </div>

      {/* State + Type row */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase">State</label>
          <button
            onClick={() =>
              update({
                state: flag.state === "ENABLED" ? "DISABLED" : "ENABLED",
              })
            }
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              flag.state === "ENABLED"
                ? "bg-green-600/20 text-green-400 border border-green-600/50"
                : "bg-gray-800 text-gray-400 border border-gray-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                flag.state === "ENABLED" ? "bg-green-400" : "bg-gray-500"
              }`}
            />
            {flag.state}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-400 uppercase">Type</label>
          <select
            value={flag.flagType}
            onChange={(e) => handleTypeChange(e.target.value as FlagType)}
            className="bg-green-600/20 text-green-400 border border-green-600/50 rounded px-3 py-1.5 text-sm font-medium appearance-none cursor-pointer"
          >
            <option value="boolean">boolean</option>
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="object">object</option>
          </select>
        </div>
      </div>

      {/* Variants */}
      <VariantsEditor
        variants={flag.variants}
        flagType={flag.flagType}
        onChange={(variants) => update({ variants })}
      />

      {/* Default Variant */}
      <div className="flex items-center gap-2">
        <label className="w-[100px] text-xs font-semibold text-gray-400 uppercase shrink-0">
          Default Variant
        </label>
        <span className="text-transparent">&rarr;</span>
        <select
          value={flag.defaultVariant}
          onChange={(e) =>
            update({
              defaultVariant: e.target.value,
              targeting: { ...flag.targeting, defaultVariant: e.target.value },
            })
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

      {/* Targeting */}
      <TargetingEditor
        targeting={flag.targeting}
        variants={flag.variants}
        onChange={(targeting) => update({ targeting })}
      />

      {/* Metadata */}
      <MetadataEditor
        metadata={flag.metadata}
        onChange={(metadata) => update({ metadata })}
      />
    </div>
  );
}
