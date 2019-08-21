import HavocClient from '../client/Havoc';
import { MessageEmbed, Collection } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';
import HavocMessage from '../extensions/Message';

export default async function(this: HavocClient, messages: Collection<HavocMessage['id'], HavocMessage>) {
	const guild = messages.first()!.guild as HavocGuild;
	if (!guild || guild.disabledLogs.has(13)) return;
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
			**🗑Amount Deleted :**  ${messages.size}
			**📂Channel :**  ${messages.first()!.channel}
			`)
			.setColor('RED')
			.setAuthor(`Messages were bulk deleted in channel ${messages.first()!.channel}`, messages.first()!.guild.iconURL())
			.setFooter(`Channel ID: ${messages.first()!.id}`)
			.setTimestamp()
			.attachFiles([{
				attachment: Buffer.from(
					messages
						.map(msg =>
							`[${new Date(msg.createdTimestamp).toLocaleString()} (UTC)] ${msg.author.tag} (${msg.author.id}): ${msg.content}
							${msg.attachments.first() ? msg.attachments.first()!.proxyURL : ''}`)
						.reverse()
						.join('\r\n'), 'utf8'
				),
				name: 'deleted_contents.txt'
			}]));
}
