import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { storage } from "@vendetta/plugin";
import Settings from "./settings";

const FluxDispatcher = findByProps("dispatch", "subscribe");
const ChannelStore = findByProps("getChannel");
const GuildStore = findByProps("getGuild");
const UserStore = findByProps("getUser", "getCurrentUser");
const RelationshipStore = findByProps("getFriendIDs");
const RestAPI = findByProps("get", "post", "del", "patch");

if (storage.trackServers === undefined) storage.trackServers = true;
if (storage.trackGroups === undefined) storage.trackGroups = true;
if (storage.trackDMs === undefined) storage.trackDMs = true;
if (storage.exactMatch === undefined) storage.exactMatch = false;
if (storage.caseSensitive === undefined) storage.caseSensitive = false;
if (storage.inSentence === undefined) storage.inSentence = true;
if (storage.sendNotificationToChannel === undefined) storage.sendNotificationToChannel = false;
if (storage.keywords === undefined) storage.keywords = [];
if (storage.targetChannelId === undefined) storage.targetChannelId = "";
if (storage.trackMode === undefined) storage.trackMode = "everyone";
if (storage.customIds === undefined) storage.customIds = "";
if (storage.ignoreBots === undefined) storage.ignoreBots = true;

let unsubMessage: (() => void) | null = null;

export default {
  onLoad() {
    const onMessage = (p: any) => {
      const m = p?.message;
      if (!m || !m.content || !storage.keywords || storage.keywords.length === 0) return;

      const currentUser = UserStore.getCurrentUser();
      if (m.author?.id === currentUser?.id) return;

      if (storage.ignoreBots && m.author?.bot) return;

      const authorId = m.author?.id;
      
      if (storage.trackMode === "friends") {
        const friends = RelationshipStore.getFriendIDs();
        if (!friends.includes(authorId)) return;
      } else if (storage.trackMode === "custom") {
        const customList = storage.customIds.split(",").map((id: string) => id.trim());
        if (!customList.includes(authorId)) return;
      }

      const c = ChannelStore.getChannel(m.channel_id);
      if (!c) return;

      if (c.guild_id && !storage.trackServers) return;
      if (c.type === 3 && !storage.trackGroups) return;
      if ((c.type === 1 || (c.type === 0 && !c.guild_id)) && !storage.trackDMs) return;

      let matchedKeyword = "";

      for (let kw of storage.keywords) {
        let content = m.content;
        let testKw = kw;

        if (!storage.caseSensitive) {
          content = content.toLowerCase();
          testKw = testKw.toLowerCase();
        }

        let isMatch = false;
        if (storage.exactMatch) {
          isMatch = content === testKw;
        } else if (storage.inSentence) {
          isMatch = content.includes(testKw);
        } else {
          const regex = new RegExp(`\\b${testKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, storage.caseSensitive ? '' : 'i');
          isMatch = regex.test(m.content);
        }

        if (isMatch) {
          matchedKeyword = kw;
          break;
        }
      }

      if (!matchedKeyword) return;

      const author = m.author;
      const authorName = author.username;
      
      if (storage.sendNotificationToChannel && storage.targetChannelId) {
        let messageContent = `# **Keyword Detected!**\n\n`;
        messageContent += `**User:** <@${author.id}>\n`;
        messageContent += `    Username: \`@${authorName}\`\n`;
        messageContent += `    ID: \`${author.id}\`\n`;
        messageContent += `**Keyword:** \`${matchedKeyword}\`\n`;
        messageContent += `**Message:**\n${m.content}\n`;

        if (c.guild_id) {
          const g = GuildStore.getGuild(c.guild_id);
          messageContent += `**Location:** Server\n`;
          messageContent += `**Server:**\n`;
          messageContent += `    Name: \`${g?.name}\`\n`;
          messageContent += `    ID: \`${c.guild_id}\`\n`;
          messageContent += `**Channel:** <#${c.id}>\n`;
          messageContent += `    Name: \`${c.name}\`\n`;
          messageContent += `    ID: \`${c.id}\`\n`;
          messageContent += `**Message Link:** https://discord.com/channels/${c.guild_id}/${c.id}/${m.id}`;
        } else if (c.type === 3) {
          messageContent += `**Location:** Group\n`;
          messageContent += `**Group:** <#${c.id}>\n`;
          messageContent += `    Name: \`${c.name || 'Unnamed Group'}\`\n`;
          messageContent += `    ID: \`${c.id}\`\n`;
          messageContent += `**Message Link:** https://discord.com/channels/@me/${c.id}/${m.id}`;
        } else {
          messageContent += `**Location:** DM\n`;
          messageContent += `**Message Link:** https://discord.com/channels/@me/${c.id}/${m.id}`;
        }

        RestAPI.post({
          url: `/channels/${storage.targetChannelId.trim()}/messages`,
          body: { content: messageContent }
        }).catch(() => {});
        
        showToast(`${authorName} sent a tracked message`);
      } else {
        let locationStr = "DM";
        if (c.guild_id) {
          const g = GuildStore.getGuild(c.guild_id);
          locationStr = `Server: ${g?.name} #${c.name}`;
        } else if (c.type === 3) {
          locationStr = `Group: ${c.name || 'Unnamed'}`;
        }
        showToast(`${authorName} said "${matchedKeyword}" in ${locationStr}`);
      }
    };

    FluxDispatcher.subscribe("MESSAGE_CREATE", onMessage);
    unsubMessage = () => FluxDispatcher.unsubscribe("MESSAGE_CREATE", onMessage);
  },

  onUnload() {
    unsubMessage?.();
  },

  settings: Settings,
};
