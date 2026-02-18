import { useRef } from "react";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useFlagStore } from "../hooks/useFlags";
import { flagsToConfig, configToFlags, downloadJson } from "../utils/export";
import type { FlagdConfig } from "../types/flagd";
import FlagList from "./FlagList";
import FlagEditor from "./FlagEditor";
import JsonPanel from "./JsonPanel";
import GlobalMetadata from "./GlobalMetadata";

export default function App() {
  const store = useFlagStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const config = flagsToConfig(
      store.flags,
      store.globalMetadata,
      store.evaluators
    );
    downloadJson(config, "flagd.json");
    toast.success("Exported flagd.json");
  }

  function handleImport() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as FlagdConfig;
        if (!parsed.flags) {
          toast.error("Invalid flagd config: missing 'flags' property");
          return;
        }
        const { flags, globalMetadata, evaluators } = configToFlags(parsed);
        store.setAll({ flags, globalMetadata, evaluators });
        toast.success(`Imported ${flags.length} flag(s)`);
      } catch (err) {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid #374151",
          },
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1 className="text-lg font-bold tracking-tight">
          <span className="text-blue-400">Prapory</span>
        </h1>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleImport}
            className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
          >
            Import
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded transition-colors"
          >
            Export
          </button>
        </div>
      </header>

      {/* Global Metadata */}
      <GlobalMetadata />

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        <FlagList />
        <FlagEditor />
        <JsonPanel />
      </div>
    </div>
  );
}
