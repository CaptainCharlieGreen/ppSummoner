const { MessageEmbed } = require('discord.js');
const { locations, roleChannelName } = require('./config');

async function populatePersonel (message, summoners) {
	const embed = new MessageEmbed();
	const guildMembers = message.guild.members.cache;
	await message.reactions.resolve();
	const reactions = message.reactions;
	let users, loc, fields = [], emojiText;
	for (key in locations) {
		loc = locations[key]
		if (reactions.cache.get(loc.emoji) === undefined) continue;
		emojiText = `<:${loc.name}:${loc.emoji}>`
		users = Array.from(reactions.cache.get(loc.emoji).users.cache.values())
		usersString = users.filter(u => !u.bot).map(u => {
			if (guildMembers.get(u.id) && guildMembers.get(u.id).nickname != null) {
				return guildMembers.get(u.id).nickname;
			}
			return u.username;
		}).join('\n');
		fields.push({
			name: `${emojiText} ${loc.name} ${emojiText}`,
			value: usersString || '-',
			inline: true
		})
	}

	embed.setTitle(`SCB ${summoners ? 'Summoners' : 'Clickers'}`)
		.setDescription(`React to each location where you have a ${summoners ? 'summoner' : 'clicker'}:`)
		.addFields(fields)
		.setFooter('---------------------------------------------------------------------------------');

	message.edit(summoners ? "Summoners" : "Clickers", embed);
}

function setupRoles (message, summoners) {
	const embed = new MessageEmbed()
		.setTitle(`SCB ${summoners ? 'Summoners' : 'Clickers'}`)
		

	message.channel.send(summoners ? 'Summoners' : 'Clickers', { embed })
		.then(async function (message) {
			for (key in locations) {
				await message.react(locations[key].emoji)
			}
		})
}

async function getUsersForLocation (msg, locationEmoji) {
	const ret = {};
	let reactionsToLocation;
	const cache = msg.guild.channels.cache;
	const id = (Array.from(cache.values())
		.filter(v => v.name === roleChannelName)
		[0] || {}).id
	if (id === undefined) {
		return;
	}
	const roleChannel = msg.guild.channels.cache.get(id);
	const messagesMap = await roleChannel.messages.fetch({ limit: 10 }, false)
	const messagesArray = Array.from(messagesMap.values())
	return {
		summoners: await messagesArray
			.filter(m => m.content === 'Summoners')
			.map(m => getUsersWhoReactedTo(m, locationEmoji))
			[0] || [],
		clickers: await messagesArray
			.filter(m => m.content === 'Clickers')
			.map(m => getUsersWhoReactedTo(m, locationEmoji))
			[0] || []
	}
}

async function getUsersWhoReactedTo (message, locationEmoji) {
	const reactionsToLocation = message.reactions.cache.get(locationEmoji);
	if (reactionsToLocation === undefined) {
		return [];
	}
	const users = await reactionsToLocation.users.fetch();
	return Array.from(users.values()).filter(u => !u.bot);
}

module.exports = {
	setupRoles: setupRoles,
	getUsersForLocation: getUsersForLocation,
	populatePersonel: populatePersonel
}