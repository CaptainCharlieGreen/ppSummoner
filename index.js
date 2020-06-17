const { Client, MessageEmbed } = require('discord.js');
const moment = require('moment');
const client = new Client();
const tokens = require('./tokens.json');
const { locations } = require('./config');
const messageCollector = require('./messageCollector');
const { setupRoles, getUsersForLocation } = require('./userRoles');
const log = msg => console.log(msg)
const locationNames = new Set(locations.map(loc => loc.name).map(s => s.toLowerCase()))

client.on('ready', () => {
	// console.log(`Logged in as ${client.user.tag}!`);
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
    ${Array.from(locations).join(', ')}`)
			return;
		} else {
			const embed = new MessageEmbed()
			.setTitle(`Summoning for ${locationOrSetup.toUpperCase()} @ ${moment().format('hh:mm')}`)
			// .setDescription()

			const users = await getUsersForLocation(message, locations
				.filter(loc => loc.name.toLowerCase() === locationOrSetup.toLowerCase())[0].emoji);

			log(users)
			message.channel.send(embed)
				.then(message => {
					messageCollector(message, x => true)
					// const collector = message.createReactionCollector(filter, { time: 15000 });

					// collector.on('collect', (reaction, user) => {
					// 	console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
					// });

					// collector.on('end', collected => {
					// 	console.log(`Collected ${collected.size} items`);
					// });
				})
			}
		// if (user) {
		// 	console.log(user)
		// }
	}
})

client.on('messageReactionAdd', async (reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not
	if (reaction.partial) {
		// If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
		try {
			await reaction.fetch();
		} catch (error) {
			console.log('Something went wrong when fetching the message: ', error);
			// Return as `reaction.message.author` may be undefined/null
			return;
		}
	}
	// // Now the message has been cached and is fully available
	// console.log(`${reaction.message.author}'s message "${reaction.message.content}" gained a reaction!`);
	// // The reaction is now also fully available and the properties will be reflected accurately:
	// console.log(`${reaction.count} user(s) have given the same reaction to this message!`);
});

client.login(tokens.botToken);
