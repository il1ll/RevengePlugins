import { registerCommand, unregisterAllCommands } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const getToken = findByProps("getToken").getToken;

function request(method: string, body?: any) {
  const token = getToken();
  if (!token) {
    showToast("Failed to get token");
    return;
  }

  fetch("https://discord.com/api/v9/hypesquad/online", {
    method,
    headers: {
      "Authorization": token,
      "Content-Type": "application/json",
      "User-Agent": "Discord-Android/305012;RNA"
    },
    body: body ? JSON.stringify(body) : undefined
  })
    .then(r => {
      if (!r.ok) showToast(`Request failed: ${r.status}`);
    })
    .catch(e => showToast(`Error: ${e.message}`));
}

function setHouse(id: number) {
  request("POST", { house_id: id });
  showToast(`HypeSquad set to ${id}`);
}

function removeHouse() {
  request("DELETE");
  showToast("HypeSquad removed");
}

export const loadCommands = () => {
  registerCommand({ name: "hs1", description: "Set HypeSquad 1", options: [], execute: () => setHouse(1) });
  registerCommand({ name: "hs2", description: "Set HypeSquad 2", options: [], execute: () => setHouse(2) });
  registerCommand({ name: "hs3", description: "Set HypeSquad 3", options: [], execute: () => setHouse(3) });
  registerCommand({ name: "hsr", description: "Remove HypeSquad", options: [], execute: removeHouse });
};

export const unloadCommands = () => unregisterAllCommands();

export default {
  onLoad() {
    loadCommands();

    if (storage.autoApply && [1, 2, 3].includes(storage.defaultHouse)) {
      setHouse(storage.defaultHouse);
    }
  },
  onUnload() {
    unloadCommands();
  },
  settings: Settings
};
