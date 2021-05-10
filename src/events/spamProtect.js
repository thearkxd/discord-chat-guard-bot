const client = global.client
const conf = require("../configs/config.json");
let sended = false;

module.exports = async (message) => {
  if (client.safes(message, "spamSafes")) return;

  if (client.spam.has(message.author.id)) {
    const data = client.spam.get(message.author.id);
    const { lastMessage, timer } = data;
    const diff = message.createdTimestamp - lastMessage.createdTimestamp;
    let count = data.count;
    if (diff > 7000) {
      clearTimeout(timer);
      data.count = 1;
      data.lastMessage = message;
      data.timer = setTimeout(() => {
        client.spam.delete(message.author.id);
      }, 10000);
      client.spam.set(message.author.id, data);
      sended = false;
    } else {
      count++;
      if (parseInt(count) === conf.penals.warnLimit) {
        let messages = await message.channel.messages.fetch({ limit: 100 });
        let filtered = messages.filter((x) => x.author.id === message.author.id).array().splice(0, conf.penals.warnLimit);
        message.channel.bulkDelete(filtered);
        if (!sended) {
          sended = true;
          setTimeout(() => { sended = false }, 10000);
          return message.reply("spam yapmaya devam edersen ceza alacaksın!").then((x) => x.delete({ timeout: 10000 }));
        }
      }
      if (parseInt(count) === conf.penals.mute.limit) {
        let messages = await message.channel.messages.fetch({ limit: 100 });
        let filtered = messages
          .filter((x) => x.author.id === message.author.id)
          .array()
          .splice(0, conf.penals.mute.limit - conf.penals.warnLimit);
        message.channel.bulkDelete(filtered);
        if (!sended) {
          sended = true;
          setTimeout(() => {
            sended = false
          }, 10000);
          message.reply("ceza alacağını söylemiştim!").then((x) => x.delete({ timeout: 10000 }));
        }
        message.member.roles.add(conf.penals.mute.roles);
        setTimeout(() => {
          message.member.roles.remove(conf.penals.mute.roles);
        }, conf.penals.mute.duration);
      } else {
        data.count = count;
        client.spam.set(message.author.id, data);
      }
    }
  } else {
    let fn = setTimeout(() => {
      client.spam.delete(message.author.id);
    }, 10000);
    client.spam.set(message.author.id, {
      count: 1,
      lastMessage: message,
      timer: fn,
    });
  }
};

module.exports.conf = {
  name: "message",
};
