import browser from "webextension-polyfill";
import { v4 as uuid } from "uuid";

export async function getClientId(): Promise<string> {
  const { clientId } = await browser.storage.local.get("clientId");
  if (clientId) return clientId as string;
  const id = uuid();
  await browser.storage.local.set({ clientId: id });
  return id;
}
