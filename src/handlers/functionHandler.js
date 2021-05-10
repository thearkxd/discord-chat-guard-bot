const conf = require("../configs/config.json");
const penals = require("../schemas/penals");
const { GuildMember, TextChannel } = require("discord.js");

module.exports = async (client) => {
  client.safes = (message, type) => {
    return conf[type].some((x) => message.author.id === x || message.channel.id === x || message.member.roles.cache.has(x));
  };

  client.isValidInvite = async (invite) => {
    try {
      return await client.fetchInvite(invite);
    } catch (err) {
      return undefined;
    }
  };

  GuildMember.prototype.setRoles = function (roles) {
    if (!this.manageable) return;
    const newRoles = this.roles.cache.filter(x => x.managed).map(x => x.id).concat(roles);
    return this.roles.set(newRoles).catch(() => {});
  };

  TextChannel.prototype.wsend = async function (message) {
	  const hooks = await this.fetchWebhooks();
	  let webhook = hooks.find(a => a.name === client.user.username && a.owner.id === client.user.id);
	  if (webhook) return hook.send(message);
    else {
      webhook = await this.createWebhook(client.user.username, { avatar: client.user.avatarURL() });
      return webhook.send(message);
    };
  };

  client.penalize = async (guildID, userID, type, active = true, staff, reason, temp = false, finishDate = undefined) => {
    let id = await penals.find({ guildID });
    id = id ? id.length + 1 : 1;
    return await new penals({ id, userID, guildID, type, active, staff, reason, temp, finishDate }).save();
  };
};
