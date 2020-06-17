

// have this message accept a user and send the message
module.exports = function collect(message, cb) {
	const affirmative = reaction => reaction.emoji.name === '👌'
	message.react('👌');
	const collector = message.createReactionCollector(affirmative, { time: 15000 });

	collector.on('collect', (reaction, user) => {
		// console.log('here')
		cb(user);
	});

	collector.on('end', collected => {
		// delete the message
		// console.log(`Attempting to delete message`);
	});
}