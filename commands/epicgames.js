import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import consola from 'consola';
import fetch from 'node-fetch';

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
        const targetURL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions";
        let currEpicGames = "";
        let nextEpicGames = "";
        try {
            let res = await fetch(targetURL);
            res = await res.json();
            if (res.data) {
                for (let element of res.data.Catalog.searchStore.elements) {
                    if (element.promotions && element.promotions.promotionalOffers.length > 0) {
                        currEpicGames += `[${element.title}](https://store.epicgames.com/en-US/p/${element.productSlug}) | Started:<t:${Date.parse(element.promotions.promotionalOffers[0].promotionalOffers[0].startDate) / 1000}:R> | Ends:<t:${Date.parse(element.promotions.promotionalOffers[0].promotionalOffers[0].endDate) / 1000}:R>\n`;
                    } else if (element.promotions && element.promotions.upcomingPromotionalOffers.length > 0) {
                        nextEpicGames += `[${element.title}](https://store.epicgames.com/en-US/p/${element.productSlug}) | Starts:<t:${Date.parse(element.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate) / 1000}:R> | Ends:<t:${Date.parse(element.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].endDate) / 1000}:R>\n`;
                    }
                }
            }
        } catch (err) { consola.error("[Epic Games]", err); }
        const embedMsg = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('EpicGames')
            .setFields([{ name: "Current Free Games", value: currEpicGames }, { name: "Upcoming Free Games", value: nextEpicGames }])
            .setTimestamp()
        await interaction.editReply({ content: " ", embeds: [embedMsg], ephemeral: !show });
        consola.success("[Epic Games]", `Sent to ${interaction.user.tag} at ${interaction.channel.name}`);
    }
}