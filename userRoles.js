const { MessageEmbed } = require('discord.js');
const { locations, roleChannelName } = require('./config');

async function populatePersonel (message, summoners) {
	const embed = new MessageEmbed();
	await message.reactions.resolve();
	const reactions = message.reactions;
	let users, loc, fields = [];
	for (key in locations) {
		loc = locations[key]
		users = Array.from(reactions.cache.get(loc.emoji).users.cache.values())
		fields.push({
			name: `${loc.emoji} ${loc.name} ${loc.emoji}`,
			value: users.filter(u => !u.bot).map(u => u.username).join('\n') || '-',
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

			function redrive () {
				populatePersonel(message, summoners)
			}
			const collector = message.createReactionCollector(x=>true);
			
			collector.on('collect', redrive);

			redrive();
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
	getUsersForLocation: getUsersForLocation
}