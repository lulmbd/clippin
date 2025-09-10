const BASE = import.meta.env.VITE_API_BASE;

export type Folder = {
  id: string;
  clientId: string;
  name: string;
  createdAt: string;
};
export type Pin = {
  id: string;
  clientId: string;
  content: string;
  sourceUrl?: string | null;
  folderId?: string | null;
  createdAt: string;
};

export async function listFolders(clientId: string): Promise<Folder[]> {
  const r = await fetch(
    `${BASE}/api/folders?clientId=${encodeURIComponent(clientId)}`
  );
  if (!r.ok) throw new Error("folders list failed");
  return r.json();
}

export async function createFolder(
  clientId: string,
  name: string
): Promise<Folder> {
  const r = await fetch(`${BASE}/api/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, name }),
  });
  if (!r.ok) throw new Error("folder create failed");
  return r.json();
}

export async function renameFolder(id: string, name: string): Promise<Folder> {
  const r = await fetch(`${BASE}/api/folders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error("folder rename failed");
  return r.json();
}

export async function deleteFolder(id: string): Promise<void> {
  const r = await fetch(`${BASE}/api/folders/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("folder delete failed");
}

export async function listPins(
  clientId: string,
  folderId?: string
): Promise<Pin[]> {
  const u = new URL(`${BASE}/api/pins`);
  u.searchParams.set("clientId", clientId);
  if (folderId) u.searchParams.set("folderId", folderId);
  const r = await fetch(u);
  if (!r.ok) throw new Error("pins list failed");
  return r.json();
}

export async function createPin(
  clientId: string,
  content: string,
  folderId?: string
): Promise<Pin> {
  const r = await fetch(`${BASE}/api/pins`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId,
      content,
      ...(folderId ? { folderId } : {}),
    }),
  });
  if (!r.ok) throw new Error("pin create failed");
  return r.json();
}

export async function deletePin(id: string): Promise<void> {
  const r = await fetch(`${BASE}/api/pins/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("pin delete failed");
}
