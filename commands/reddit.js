import { SlashCommandBuilder } from 'discord.js';
import { redditEmbed } from '../utils/fetchFunctions.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('reddit')
        .setDescription('Displays free stuff from Reddit')
        .addBooleanOption(option => option.setName('show')
            .setDescription('Show to everyone!')
            .setRequired(false))
        .addBooleanOption(option => option.setName('force')
            .setDescription('Force to show games even if it has already been posted')
            .setRequired(false)
        ),
    async execute(interaction) {
        let show = interaction.options.getBoolean('show') || false;
        let force = interaction.options.getBoolean('force') || false;
        consola.info("[Reddit]", `${interaction.user.tag} requested`);
        await interaction.reply({ content: "Scanning Reddit...", ephemeral: !show });
        const embedMsg = await redditEmbed(interaction.guildId, interaction.channelId, force);
        await interaction.editReply({ content: "", embeds: embedMsg, ephemeral: !show });

    }
}