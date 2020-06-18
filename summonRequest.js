const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { locations } = require('./config');
const { getUsersForLocation } = require('./userRoles');

const emojis = {
	summoners: '🧙‍♀️',
	clickers: '⚙',
	pendingSummon: '✈',
	alreadySummoned: '✅'
}

function getNamesFor (reactions, emoji) {
	const users = Array.from(reactions.cache.get(emoji).users.cache.values())
	return users.filter(u => !u.bot)
		.map(u => u.username);
}

async function populatePersonel (message, serviceUsers, location, origTime) {
	await message.reactions.resolve();
	const reactions = message.reactions;
	const toSummon = getNamesFor(reactions, emojis.pendingSummon);
	const alreadySummoned = new Set(getNamesFor(reactions, emojis.alreadySummoned))
	const summonText = toSummon
		.map(s => `${s} ${alreadySummoned.has(s) ? emojis.alreadySummoned: ""}`)
		.join('\n');
	const fields = [
		{ name: "Summoners", value: getNamesFor(reactions, emojis.summoners).join('\n') || "-", inline: true},
		{ name: "Clickers", value: getNamesFor(reactions, emojis.clickers).join('\n') || "-", inline: true},
		{ name: "Passengers", value:  summonText || "-", inline: true},
	]
	const embed = new MessageEmbed()
		.setTitle(`Summoning for ${location.toUpperCase()} @ ${origTime}`)
		.addFields(fields)
		.setFooter('---------------------------------------------------------------------------------');
	message.edit(`${location} summon request ${serviceUsers.map(u => `<@${u.id}>`).join(' ')}`, embed);
}

async function summonRequest(message, location) {
	const time = moment().format('hh:mm')
	const embed = new MessageEmbed()
		.setTitle(`Summoning for ${location.toUpperCase()} @ ${time}`)

	const users = await getUsersForLocation(message, locations
		.filter(loc => loc.name.toLowerCase() === location.toLowerCase())[0].emoji);
	const allUsers = users.summoners.concat(users.clickers);
	
	const msg = await message.channel.send(embed)
	for(key in emojis) {
		await msg.react(emojis[key]);
	}
	function redrive () {
		populatePersonel(msg, allUsers, location, time)
	}
	const collector = msg.createReactionCollector(x=>true, {time: (1000 * 60 * 60), remove: true});
	
	collector.on('collect', redrive);

	redrive();
}

module.exports = {
	summonRequest: summonRequest
};
