import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useFlagStore } from "../hooks/useFlags";
import { flagsToConfig, configToFlags } from "../utils/export";
import type { FlagdConfig } from "../types/flagd";
import toast from "react-hot-toast";

const EDITING_DEBOUNCE_MS = 1000;

export default function JsonPanel() {
  const store = useFlagStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const skipNextUpdate = useRef(false);
  const editingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = useMemo(
    () => flagsToConfig(store.flags, store.globalMetadata, store.evaluators),
    [store.flags, store.globalMetadata, store.evaluators]
  );
  const jsonString = useMemo(() => JSON.stringify(config, null, 2), [config]);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (editingTimeoutRef.current) clearTimeout(editingTimeoutRef.current);
    };
  }, []);

  // Update editor when store changes (unless user is actively editing)
  useEffect(() => {
    if (isUserEditing || !editorRef.current) return;
    if (skipNextUpdate.current) {
      skipNextUpdate.current = false;
      return;
    }
    const model = editorRef.current.getModel();
    if (model && model.getValue() !== jsonString) {
      const pos = editorRef.current.getPosition();
      model.setValue(jsonString);
      if (pos) editorRef.current.setPosition(pos);
    }
  }, [jsonString, isUserEditing]);

  const applyJsonToStore = useCallback(
    (value: string) => {
      try {
        const parsed = JSON.parse(value) as FlagdConfig;
        if (!parsed.flags) return;
        const { flags, globalMetadata, evaluators } = configToFlags(parsed);
        skipNextUpdate.current = true;
        store.setAll({ flags, globalMetadata, evaluators });
      } catch {
        // JSON is incomplete/invalid while typing — silently ignore
      }
    },
    [store]
  );

  function handleEditorChange(value: string | undefined) {
    if (!value) return;
    setIsUserEditing(true);
    applyJsonToStore(value);

    if (editingTimeoutRef.current) clearTimeout(editingTimeoutRef.current);
    editingTimeoutRef.current = setTimeout(
      () => setIsUserEditing(false),
      EDITING_DEBOUNCE_MS
    );
  }

  return (
    <div className="flex-1 border-l border-gray-800 flex flex-col min-w-0">
      <div className="px-3 py-2 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase">
        JSON Preview
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language="json"
          theme="vs-dark"
          value={jsonString}
          onChange={handleEditorChange}
          onMount={handleMount}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            tabSize: 2,
            automaticLayout: true,
            readOnly: false,
          }}
        />
      </div>
    </div>
  );
}
