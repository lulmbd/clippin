import { useEffect, useMemo, useState } from "react";
import { getClientId } from "./clientId";
import {
  createFolder,
  createPin,
  deleteFolder,
  deletePin,
  listFolders,
  listPins,
  renameFolder,
  type Folder,
  type Pin,
} from "./api";
import FolderIcon from "./icons-ui/folder.svg?react";
import PinIcon from "./icons-ui/pin.svg?react";
import TrashIcon from "./icons-ui/trash.svg?react";
import EditIcon from "./icons-ui/edit.svg?react";

export default function App() {
  const [clientId, setClientId] = useState<string>("");
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [rename, setRename] = useState<{ id: string; name: string } | null>(
    null
  );
  const [newPinText, setNewPinText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // init clientId
  useEffect(() => {
    getClientId().then(setClientId);
  }, []);

  // fetch folders when clientId ready
  useEffect(() => {
    if (!clientId) return;
    (async () => {
      setLoading(true);
      try {
        setFolders(await listFolders(clientId));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [clientId]);

  // fetch pins when clientId or activeFolder changes
  useEffect(() => {
    if (!clientId) return;
    (async () => {
      try {
        setPins(await listPins(clientId, activeFolder || undefined));
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, [clientId, activeFolder]);

  const activeFolderObj = useMemo(
    () => folders.find((f) => f.id === activeFolder) || null,
    [folders, activeFolder]
  );

  async function onCreateFolder() {
    if (!newFolderName.trim() || !clientId) return;
    const f = await createFolder(clientId, newFolderName.trim());
    setFolders([f, ...folders]);
    setNewFolderName("");
  }

  async function onRenameFolder() {
    if (!rename) return;
    const f = await renameFolder(rename.id, rename.name.trim());
    setFolders(folders.map((x) => (x.id === f.id ? f : x)));
    setRename(null);
  }

  async function onDeleteFolder(id: string) {
    await deleteFolder(id);
    setFolders(folders.filter((f) => f.id !== id));
    if (activeFolder === id) setActiveFolder(null);
    if (clientId) setPins(await listPins(clientId, activeFolder || undefined));
  }

  async function onAddPin() {
    if (!newPinText.trim() || !clientId) return;
    const p = await createPin(
      clientId,
      newPinText.trim(),
      activeFolder || undefined
    );
    setPins([p, ...pins]);
    setNewPinText("");
  }

  async function onDeletePin(id: string) {
    await deletePin(id);
    setPins(pins.filter((p) => p.id !== id));
  }

  return (
    <div
      style={{
        fontFamily: "ui-sans-serif, system-ui",
        width: 360,
        padding: 12,
      }}
    >
      <h1 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
        Clippin
      </h1>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            padding: 8,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Folders header */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <input
          placeholder="New folder…"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          style={{
            flex: 1,
            padding: 6,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
          }}
        />
        <button
          onClick={onCreateFolder}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
          }}
        >
          + Add
        </button>
      </div>

      {/* Folders list */}
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}
      >
        <button
          onClick={() => setActiveFolder(null)}
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid #e5e7eb",
            background: activeFolder === null ? "#111827" : "#fff",
            color: activeFolder === null ? "#fff" : "#111",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FolderIcon width={14} height={14} />
          All
        </button>
        {folders.map((f) => (
          <div
            key={f.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "1px solid #e5e7eb",
              borderRadius: 999,
              padding: "4px 8px",
            }}
          >
            <button
              onClick={() => setActiveFolder(f.id)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              {f.name}
            </button>
            <button
              onClick={() => setRename({ id: f.id, name: f.name })}
              title="Rename"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <EditIcon width={14} height={14} />
            </button>
            <button
              onClick={() => onDeleteFolder(f.id)}
              title="Delete"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <TrashIcon width={14} height={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Rename modal */}
      {rename && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 8,
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={rename.name}
              onChange={(e) => setRename({ ...rename, name: e.target.value })}
              style={{
                flex: 1,
                padding: 6,
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            />
            <button
              onClick={onRenameFolder}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
              }}
            >
              Save
            </button>
            <button
              onClick={() => setRename(null)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add pin */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <textarea
          placeholder="Paste your prompt/answer…"
          value={newPinText}
          onChange={(e) => setNewPinText(e.target.value)}
          rows={3}
          style={{
            flex: 1,
            padding: 6,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
          }}
        />
        <button
          onClick={onAddPin}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            height: "fit-content",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <PinIcon width={14} height={14} />
          Pin
        </button>
      </div>

      {activeFolderObj && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FolderIcon width={14} height={14} /> {activeFolderObj.name}
        </div>
      )}

      {/* Pins list */}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pins.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                {new Date(p.createdAt).toLocaleString()}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{p.content}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 6,
                }}
              >
                <button
                  onClick={() => onDeletePin(p.id)}
                  style={{
                    background: "transparent",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: "2px 8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <TrashIcon width={14} height={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
          {pins.length === 0 && (
            <div style={{ opacity: 0.6 }}>No pins yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
