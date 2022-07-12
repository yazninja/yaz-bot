import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { mongo } from '../integrations/mongo.js';
import fetch from 'node-fetch';

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
        await interaction.reply({ content: "Scanning Valorant Patch...", ephemeral: !show });
        const targetURL = "https://playvalorant.com/page-data/en-us/news/tags/patch-notes/page-data.json";
        try {
            let res = await fetch(targetURL);
            res = await res.json();
            if (res.result) {
                mongo.getValoPatch();
                let currpatch = res.result.data.articles.nodes[0];
                const embedMsg = new EmbedBuilder()
                    .setColor('Random')
                    .setTitle(currpatch.title)
                    .setURL(`https://playvalorant.com/en-us${currpatch.url.url}`)
                    .setDescription(currpatch.description)
                    .setTimestamp()
                    .setImage(currpatch.banner.url)
                    .setAuthor({
                        name: 'Valorant',
                        iconURL: 'https://logos-download.com/wp-content/uploads/2021/01/Valorant_Logo.png',
                        url: 'https://playvalorant.com/en-us/'
                    });
                await interaction.editReply({ content: "", embeds: [embedMsg], ephemeral: !show });
                consola.success("[Valorant]", `Sent to ${interaction.user.tag} at ${interaction.channel.name}`);
            }
        } catch (err) { consola.error("[Valorant]", err); }
    }
}
