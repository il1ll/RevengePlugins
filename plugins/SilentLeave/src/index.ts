import { registerCommand, unregisterAllCommands } from "@vendetta/commands";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";

const ChannelStore = findByProps("getChannel");
const getToken = findByProps("getToken").getToken;

const loadCommands = () => {
  registerCommand({
    name: "leave silent",
    description: "Leave the current Group DM silently",
    options: [],
    predicate: (ctx) => {
      const channelId = ctx?.channel?.id;
      const channel = ChannelStore.getChannel(channelId);
      return !!channel && channel.type === 3;
    },
    execute: (_, ctx) => {
      const channelId = ctx.channel.id;
      const token = getToken();

      if (!token) {
        showToast("Failed to get token.");
        return;
      }

      fetch(`https://discord.com/api/v9/channels/${channelId}?silent=true`, {
        method: "DELETE",
        headers: {
          "Authorization": token,
          "User-Agent": "Discord-Android/305012;RNA",
          "Accept-Encoding": "gzip"
        }
      })
      .then(res => {
        if (res.ok) showToast("Left Group DM successfully.");
        else showToast(`Failed: ${res.status}`);
      })
      .catch(e => showToast(e.message));
    }
  });
};

export default {
  onLoad() {
    loadCommands();
  },
  onUnload() {
    unregisterAllCommands();
  }
};
