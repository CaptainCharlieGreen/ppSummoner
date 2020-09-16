const { Client } = require('discord.js');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'MEMBERS'] });
const tokens = require('./tokens.json');
const { locations } = require('./config');
const { setupRoles, populatePersonel } = require('./userRoles');
const { summonRequest, showSummoners } = require('./summonRequest');
const log = msg => console.log(msg)
const locationNames = new Set(locations.map(loc => loc.name).map(s => s.toLowerCase()))

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	if (!message.guild) return;
	if (message.partial) { await message.fetch(); }
	if (message.content.startsWith('!scb')) {
		const locationOrSetup = (message.content.split('!scb')[1] || '').trim().toLowerCase();
		if (locationOrSetup === 'summoners') {
			setupRoles(message, true);
		} else if (locationOrSetup === 'clickers') {
			setupRoles(message, false);
		} else if (!locationNames.has(locationOrSetup)) {
			message.reply(`Incorrect syntax. Type "!scb location" where location is one of:
    ${Array.from(locations).map(l => l.name).join(', ')}`)
		} else {
			summonRequest(message, locationOrSetup)
		}
	}
});

async function reactionHandler (reaction, user) {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			return;
		}
	}
	if (reaction.message.author.id !== '721492316908421151') return;
	if (reaction.message.content === 'Summoners' || reaction.message.content === 'Clickers') {
		populatePersonel(reaction.message, reaction.message.content === 'Summoners');
	} else {
		showSummoners(reaction.message)
	}
}

client.on('messageReactionAdd', reactionHandler);
client.on('messageReactionRemove', reactionHandler);

client.login(tokens.botToken);
