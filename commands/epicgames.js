import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import consola from 'consola';
import fetch from 'node-fetch';
import { epicEmbed } from '../utils/fetchFunctions.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('epicgames')
        .setDescription('Displays free stuff from Epic Games')
        .addBooleanOption(option => option.setName('show')
            .setDescription('Show to everyone!')
            .setRequired(false)
        ),
    async execute(interaction) {
        let show = interaction.options.getBoolean('show') || false;
        consola.info("[Epic Games]", `${interaction.user.tag} requested`);
        await interaction.reply({ content:"Scanning Epic Games...", ephemeral: !show });
        const embedMsg = await epicEmbed();
        await interaction.editReply({ content: " ", embeds: [embedMsg], ephemeral: !show });
        consola.success("[Epic Games]", `Sent to ${interaction.user.tag} at ${interaction.channel.name}`);
    }
}