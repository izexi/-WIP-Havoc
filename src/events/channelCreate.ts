import HavocClient from '../client/Havoc';
import { TextChannel, VoiceChannel, CategoryChannel, NewsChannel, MessageEmbed } from 'discord.js';
import Log from '../structures/Log';
import HavocGuild from '../extensions/Guild';

export default async function(this: HavocClient, channel: TextChannel | VoiceChannel | CategoryChannel | NewsChannel) {
	const guild = channel.guild as HavocGuild;
	const muteRole = guild.roles.find(role => role.name === 'HavocMute');
	if (!guild || guild.disabledLogs.has(0)) return;
	if (channel.type === 'text' && muteRole) {
		await channel.updateOverwrite(muteRole, {
			SEND_MESSAGES: false,
			ADD_REACTIONS: false
		}).catch(() => null);
	}
	const executor = await Log.getExecutor(channel, 'CHANNEL_CREATE');
	Log.send(guild,
		new MessageEmbed()
			.setDescription(`
				${executor ? `**✏Created By :**  ${executor}` : ''}
				**📅Timestamp of creation :**  ${channel.createdAt.toLocaleString()} (UTC)
				**📂Channel name:**  ${channel.name}
				**📣Channel type :**  ${channel.type}
			`)
			.setColor('GREEN')
			.setAuthor(`Channel was created${channel.parent ? ` in category ${channel.parent.name}` : ''}`, guild.iconURL())
			.setFooter(`Channel ID: ${channel.id}`)
			.setTimestamp());
}