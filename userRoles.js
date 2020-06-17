const { MessageEmbed } = require('discord.js');
const { locations, roleChannelName } = require('./config');

// todo: lay out the locations and all the people who've reacted to them in the embed

function setupRoles (message, summoners) {
	const embed = new MessageEmbed()
		.setTitle(`SCB ${summoners ? 'Summoners' : 'Clickers'}`)
		.setDescription(`React to each location where you have a ${summoners ? 'summoner' : 'clicker'}:
${locations.map(loc => `${loc.emoji}=${loc.name}`).join("\n")}`);

	message.channel.send(summoners ? 'Summoners' : 'Clickers', { embed })
		.then(message => {
			locations.forEach(loc => {
				message.react(loc.emoji);
			});
		})
}

/*
{
	summoners: [ user ],
	clickers: [ user ]
}
*/
async function getUsersForLocation (msg, locationEmoji) {
	const ret = {};
	let reactionsToLocation;
	const cache = msg.guild.channels.cache;
	const id = (Array.from(cache.values())
		.filter(v => v.name === roleChannelName)
		[0] || {}).id
	if (id === undefined) {
		//todo: log we couldn't find the role channel
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