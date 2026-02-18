import { useState } from "react";
import { useFlagStore } from "../hooks/useFlags";
import toast from "react-hot-toast";

export default function GlobalMetadata() {
  const { globalMetadata, evaluators, setGlobalMetadata, setEvaluators } =
    useFlagStore();
  const [showEval, setShowEval] = useState(false);
  const [evalText, setEvalText] = useState(JSON.stringify(evaluators, null, 2));

  const metaEntries = Object.entries(globalMetadata);
  const [newKey, setNewKey] = useState("");
  const [newVal, setNewVal] = useState("");

  function addMeta() {
    if (!newKey.trim()) return;
    setGlobalMetadata({ ...globalMetadata, [newKey.trim()]: newVal });
    setNewKey("");
    setNewVal("");
  }

  function removeMeta(key: string) {
    const next = { ...globalMetadata };
    delete next[key];
    setGlobalMetadata(next);
  }

  function applyEvaluators() {
    try {
      setEvaluators(JSON.parse(evalText));
      toast.success("Evaluators applied");
    } catch {
      toast.error("Invalid JSON in $evaluators");
    }
  }

  return (
    <div className="p-4 border-b border-gray-800 space-y-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase">
        Global Metadata
      </h3>
      {metaEntries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{key}:</span>
          <span className="text-sm text-gray-200">{String(value)}</span>
          <button
            onClick={() => removeMeta(key)}
            className="text-red-400 hover:text-red-300 text-xs ml-auto"
          >
            &times;
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <input
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="w-[80px] bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && addMeta()}
        />
        <input
          placeholder="Value"
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && addMeta()}
        />
        <button
          onClick={addMeta}
          className="text-green-400 hover:text-green-300 text-sm px-2"
        >
          +
        </button>
      </div>

      <button
        onClick={() => setShowEval(!showEval)}
        className="text-xs text-gray-400 hover:text-gray-300"
      >
        {showEval ? "Hide" : "Show"} $evaluators
      </button>
      {showEval && (
        <div className="space-y-2">
          <textarea
            value={evalText}
            onChange={(e) => setEvalText(e.target.value)}
            rows={5}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm font-mono"
          />
          <button
            onClick={applyEvaluators}
            className="text-blue-400 hover:text-blue-300 text-xs"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
