import { Client, GatewayIntentBits, Partials, Collection, ActivityType, resolveColor } from 'discord.js';
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages,  
        GatewayIntentBits.GuildMessageReactions, 
        GatewayIntentBits.MessageContent
    ], 
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction] 
});
import consola from 'consola';
import 'dotenv/config';
import { mongo } from './integrations/mongo.js';

client.commands = new Collection();
client.events = [];

import { readdirSync } from 'fs';
const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    let { event } = await import (`./events/${file}`)
    client.events.push(event);
    consola.info("\x1b[32m%s\x1b[0m", "Registered Event:", event.name);
}
const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    let { command } = await import (`./commands/${file}`)
    client.commands.set(command.data.name, command);
    consola.info("\x1b[32m%s\x1b[0m", "Registered Command:", command.data.name);
}

let errorChannel = "972138658230579210";

client.on('ready', () => {
    consola.success(`Logged in as ${client.user.tag} at ${Date()}`);
    mongo.init();
    client.events.find(e => e.name === 'sendSync').execute(client);
    client.user.setActivity('fg help', { type: ActivityType.Listening });
    
});
client.login(process.env.bot_token);

client.on('messageCreate', async message => {
    await client.events.find(event => event.name === 'messageCreate').execute(message);
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            consola.error(error);
            await interaction.reply({ title: resolveColor('Red'), content: 'There was an error while executing this command!', ephemeral: true });
            let errorEmbed = { color: ColorResolvable.Red, title: "Error", description: `${error.name}`, fields: [{ name: 'Message', value: `${error.message}` }, { name: 'Origin', value: `${error.stack}` }] }
            await interaction.member.guild.channels.cache.get(errorChannel).send({ content: `There was an error executing ${interaction.commandName}`, embeds: [errorEmbed] })
        }
    }
});
process.on('unhandledRejection', error => {
    consola.error(error);
    consola.error(error.stack);
    let errorEmbed = { color: resolveColor('Red'), title: "Error", description: `${error.name}`, fields: [{ name: 'Message', value: `${error.message}` }, { name: 'Origin', value: `${error.stack}` }] }
    client.channels.cache.get(errorChannel).send({ content: `Unhandled Rejection`, embeds: [errorEmbed] })
});
process.on('uncaughtException', error => {
    consola.error(error);
    consola.error(error.stack);
    let errorEmbed = { color: resolveColor('Red'), title: "Error", description: `${error.name}`, fields: [{ name: 'Message', value: `${error.message}` }, { name: 'Origin', value: `${error.stack}` }] }
    client.channels.cache.get(errorChannel).send({ content: `Uncaught Exception`, embeds: [errorEmbed] })
});
