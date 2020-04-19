import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/Targetter';
import GuildEntity, { Logs } from '../../structures/entities/GuildEntity';
import Havoc from '../../client/Havoc';
import HavocTextChannel from '../../structures/extensions/HavocTextChannel';

export default class extends Command {
  constructor() {
    super(__filename, {
      description: 'Enable logs for this server.',
      args: {
        type: Target.CHANNEL,
        required: true,
        prompt:
          'mention the channel, or enter the ID of the channel that would like to set the logs to.'
      },
      sub: true,
      requiredPerms: 'MANAGE_GUILD'
    });
  }

  async run(
    this: Havoc,
    { message, channel }: { message: HavocMessage; channel: HavocTextChannel }
  ) {
    let logs: Logs;
    const existing = await this.db
      .find(GuildEntity, message.guild!.id)
      .then(guild => guild?.logs);

    if (existing) {
      logs = {
        ...existing,
        channel: channel.id
      };
    } else {
      const webhook = await channel.createWebhook(',HavocLogs', {
        avatar: this.user!.displayAvatarURL()
      });
      const config = {
        disabled: [],
        channel: channel.id,
        webhook: {
          id: webhook.id,
          token: webhook.token!
        }
      };

      message.guild!.logs = config;
      logs = config;
    }

    await this.db.upsert(GuildEntity, message.guild!.id, { logs });

    message.respond(
      `${
        existing
          ? `I have updated the logs channel from ${message.guild!.channels.cache.get(
              existing.channel
            )} to ${channel}`
          : `I have enabled logs in ${channel} for this server.`
      }`
    );
  }
}