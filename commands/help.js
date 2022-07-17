import { SlashCommandBuilder } from 'discord.js';
import { helpEmbed } from '../utils/fetchFunctions.js';
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
        let embedMsg = await helpEmbed(interaction.client.guilds.cache.size);
        interaction.reply({ embeds: [embedMsg], ephemeral: !show });
        consola.success("[Help]", `Sent to ${interaction.user.tag} at ${interaction.channel.name}`);
    }
}