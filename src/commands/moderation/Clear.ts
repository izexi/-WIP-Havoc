import Command from '../../structures/bases/Command';
import HavocMessage from '../../structures/extensions/HavocMessage';
import { Target } from '../../util/targetter';
import HavocUser from '../../structures/extensions/HavocUser';
import Util from '../../util';
import {
  PROMPT_INITIAL,
  PROMPT_INVALD,
  NOOP,
  EMOJIS,
} from '../../util/CONSTANTS';
import { TextChannel } from 'discord.js';

export default class extends Command {
  constructor() {
    super(__filename, {
      description:
        'Deletes a chosen amount of messages from a channel / from a user in a channel.',
      aliases: ['c', 'prune', 'purge'],
      flags: ['nopin'],
      args: [
        {
          type: Target.NUMBER,
          required: true,
          promptOpts: {
            initial: PROMPT_INITIAL[Target.NUMBER]('messages', 'clear'),
            invalid: PROMPT_INVALD(
              'the number of messages you would like to clear, e.g: entering `5` would clear 5 messages'
            ),
          },
        },
        {
          type: Target.USER,
        },
      ],
      requiredPerms: 'MANAGE_MESSAGES',
    });
  }

  async run({
    message,
    number,
    user,
    flags,
  }: {
    message: HavocMessage;
    number: number;
    user: HavocUser | null;
    flags: { nopin?: undefined };
  }) {
    await message.delete();

    let messages = await message.channel.messages
      .fetch({ limit: 100 })
      .catch(NOOP);
    if (!messages)
      return message.respond(
        'I encountered an error when attempting to fetch recent messages to clear, maybe try again later?'
      );

    if (user) messages = messages.filter((msg) => msg.author.id === user.id);
    if ('nopin' in flags)
      messages = messages.filter((message) => !message.pinned);
    const cleared = await (message.channel as TextChannel)
      .bulkDelete(
        isNaN(number) ? messages : messages.first(Math.min(number, 100)),
        true
      )
      .catch(NOOP);

    if (!cleared)
      return message.respond(
        'I encountered an error when attempting to clear the messages, maybe try again later?'
      );

    message
      .respond(
        `cleared \`${cleared.size} ${Util.plural(
          'message',
          cleared.size
        )}\` ${Util.randomArrEl(EMOJIS.BOTCLEAR)}`,
        { deleteable: false }
      )
      .then((message) => message.delete({ timeout: 1300 }))
      .catch(NOOP);
  }
}
