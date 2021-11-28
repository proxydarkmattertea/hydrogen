// Require discord.js
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./config.json');

// Client - Prefix
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
const settings = {
	prefix: '!'
};
// Music
const { Player } = require("discord-music-player");
const player = new Player(client, {
	leaveOnEmpty: false,
});
client.player = player;

client.on('messageCreate', async (message) => {
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();
    let guildQueue = client.player.getQueue(message.guild.id);

    if(message.content.startsWith(prefix) && command === 'play') {
        let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        let song = await queue.play(args.join(' ')).catch(_ => {
            if(!guildQueue)
                queue.stop();
        });
    }

    if(message.content.startsWith(prefix) && command === 'playlist') {
        let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        let song = await queue.playlist(args.join(' ')).catch(_ => {
            if(!guildQueue)
                queue.stop();
        });
    }

    if(message.content.startsWith(prefix) && command === 'skip') {
        guildQueue.skip();
    }

    if(message.content.startsWith(prefix) && command === 'stop') {
        guildQueue.stop();
    }

    if(message.content.startsWith(prefix) && command === 'stoploop') {
        guildQueue.setRepeatMode(RepeatMode.DISABLED); // or 0 instead of RepeatMode.DISABLED
    }

    if(message.content.startsWith(prefix) && command === 'loopsong') {
        guildQueue.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
    }

    if(message.content.startsWith(prefix) && command === 'tloop') {
        guildQueue.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
    }

    if(message.content.startsWith(prefix) && command === 'seek') {
        guildQueue.seek(parseInt(args[0]) * 1000);
    }

    if(message.content.startsWith(prefix) && command === 'clear') {
        guildQueue.clearQueue();
    }

    if(message.content.startsWith(prefix) && command === 'shuffle') {
        guildQueue.shuffle();
    }

    if(message.content.startsWith(prefix) && command === 'queue') {
        console.log(guildQueue);
    }

    if(message.content.startsWith(prefix) && command === 'np') {
        console.log(`Now playing: ${guildQueue.nowPlaying}`);
        message.channel.send(`Now playing: ${guildQueue.nowPlaying}`);
    }

    if(message.content.startsWith(prefix) && command === 'pause') {
        guildQueue.setPaused(true);
    }

    if(message.content.startsWith(prefix) && command === 'resume') {
        guildQueue.setPaused(false);
    }

    if(message.content.startsWith(prefix) && command === 'remove') {
        guildQueue.remove(parseInt(args[0]));
    }

    if(message.content.startsWith(prefix) && command === 'time') {
        const ProgressBar = guildQueue.createProgressBar();

        // [======>              ][00:35/2:20]
        console.log(ProgressBar.prettier);
    }
})

//Collections
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// Ready check
client.once('ready', () => {
    console.log('Ready!');
});

// Slash Commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login
client.login(token);
