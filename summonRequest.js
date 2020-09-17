const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { locations } = require('./config');
const { getUsersForLocation } = require('./userRoles');

const emojis = {
	summoners: '723063874513010748',
	clickers: '⚙',
	pendingSummon: '✈',
	alreadySummoned: '✅'
}

function getNamesFor (reactions, emoji, guildMembers) {
	if (reactions.cache.get(emoji) === undefined) return [];
	const users = Array.from(reactions.cache.get(emoji).users.cache.values())
	return users.filter(u => !u.bot)
		.map(u => {
			if (guildMembers.get(u.id) && guildMembers.get(u.id).nickname != null) {
				return guildMembers.get(u.id).nickname
			}
			return u.username;
		});
}

async function populatePersonel (message) {
	const guildMembers = message.guild.members.cache;
	const location = message.content.split('summon')[0].trim();

	await message.reactions.resolve();
	const reactions = message.reactions;
	const toSummon = getNamesFor(reactions, emojis.pendingSummon, guildMembers);
	const alreadySummoned = new Set(getNamesFor(reactions, emojis.alreadySummoned, guildMembers))
	const summonText = toSummon
		.map(s => `${s} ${alreadySummoned.has(s) ? emojis.alreadySummoned: ""}`)
		.join('\n');
	const fields = [
		{ name: "Summoners", value: getNamesFor(reactions, emojis.summoners, guildMembers).join('\n') || "-", inline: true},
		{ name: "Clickers", value: getNamesFor(reactions, emojis.clickers, guildMembers).join('\n') || "-", inline: true},
		{ name: "Passengers", value:  summonText || "-", inline: true},
	]
	const embed = new MessageEmbed()
		.setTitle(`Summoning for ${location.toUpperCase()}`)
		.addFields(fields)
		.setFooter('---------------------------------------------------------------------------------');
	message.edit(embed);
}

async function summonRequest(message, location) {
	const users = await getUsersForLocation(message, locations
		.filter(loc => loc.name.toLowerCase() === location.toLowerCase())[0].emoji);
	const serviceUsers = users.summoners.concat(users.clickers);
	const atList = `${location} summon request ${Array.from(new Set(serviceUsers.map(u => `<@${u.id}>`))).join(' ')}`
	const embed = new MessageEmbed()
		.setTitle(`Summoning for ${location.toUpperCase()}`)
	const msg = await message.channel.send(atList, embed)
	for(key in emojis) {
		await msg.react(emojis[key]);
	}
}

module.exports = {
	summonRequest: summonRequest,
	showSummoners: populatePersonel
};
