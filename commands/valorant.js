import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { mongo } from '../integrations/mongo.js';
import fetch from 'node-fetch';
import { valoEmbed } from '../utils/fetchFunctions.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('valorant')
        .setDescription('Get the current patch note for Valorant')
        .addBooleanOption(option => option.setName('show')
            .setDescription('Show to everyone!')
            .setRequired(false)
        ),
    async execute(interaction) {
        let show = interaction.options.getBoolean('show') || false;
        consola.info("[Valorant]", `${interaction.user.tag} requested`);
        const embedMsg = await valoEmbed();
        consola.info(embedMsg);
        await interaction.reply({ content: "Scanning Valorant Patch...", ephemeral: !show });

        await interaction.editReply({ content: "", embeds: [embedMsg], ephemeral: !show });
        consola.success("[Valorant]", `Sent to ${interaction.user.tag} at ${interaction.channel.name}`);

    }
}
