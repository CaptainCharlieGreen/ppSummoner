const { Client } = require('discord.js');
const client = new Client();
const tokens = require('./tokens.json');
const { locations } = require('./config');
const { setupRoles } = require('./userRoles');
const { summonRequest } = require('./summonRequest');
const log = msg => console.log(msg)
const locationNames = new Set(locations.map(loc => loc.name).map(s => s.toLowerCase()))

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message => {
	if (!message.guild) return;
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

client.login(tokens.botToken);
