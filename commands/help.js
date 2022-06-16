import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help dialog for this bot')
        .addBooleanOption(option => option.setName('show')
            .setDescription('Show to everyone!')
            .setRequired(false)
        ),
    
    async execute(interaction) {
        let show = interaction.options.getBoolean('show') || false;
        consola.info("[Help]", `${interaction.user.tag} requested`);
    const embedMsg = new EmbedBuilder()
        .setColor('Random')
        .setDescription('A Simple bot that fetches free games')
        .addFields(
            { name: 'fg add', value: 'Receive free game alerts in the channel', inline: true },
            { name: 'fg remove', value: 'Unsubscribe from free game alerts in the channel', inline: true },
            { name: 'fg active', value: 'Shows all channels that have game alerts', inline: true },
            { name: 'fg epic', value: 'Get the current and upcoming deals in Epic Games', inline: true },
            { name: 'fg reddit', value: 'Get the free games submitted to /r/GameDeals', inline: true },
            { name: 'fg help', value: 'Shows this help info', inline: true },
            { name: 'Free Games Bot Info', value: `Currently in **${interaction.client.guilds.cache.size}** servers.\n Have any issues or feature requests? Check out the [Github Repo](https://github.com/yazninja/discord-fg-bot#readme)` },
            { name: 'Add Free Games Bot to another server', value: '[Invite Link](https://discord.com/api/oauth2/authorize?client_id=985786630923239465&permissions=124992&scope=bot)' }
        )
        .setAuthor({ name: 'FreeGamesBot', iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png', url: 'https://github.com/yazninja/discord-fg-bot' })
    interaction.reply({ embeds: [embedMsg], ephemeral: !show });
    consola.success("[Help]", `Sent to ${interaction.user.tag} at ${interaction.channel.name}`);
    }
}