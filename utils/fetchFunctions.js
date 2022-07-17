import { EmbedBuilder } from 'discord.js';
import { mongo } from '../integrations/mongo.js';
import fetch from 'node-fetch';

export const helpEmbed = async function (numGuilds) {
    return new EmbedBuilder()
        .setColor('Random')
        .setDescription('A Simple bot that fetches free games')
        .addFields(
            { name: 'fg add', value: 'Receive free game alerts in the channel', inline: true },
            { name: 'fg remove', value: 'Unsubscribe from free game alerts in the channel', inline: true },
            { name: 'fg active', value: 'Shows all channels that have game alerts', inline: true },
            { name: 'fg epic [`/epicgames`]', value: 'Get the current and upcoming deals in Epic Games', inline: true },
            { name: 'fg reddit [`/reddit`]', value: 'Get the free games submitted to /r/GameDeals', inline: true },
            { name: 'fg valorant [`/valorant`]', value: 'Shows the current patch note for Valorant', inline: true },
            { name: 'fg help [`/help`]', value: 'Shows this help info', inline: true },
            { name: 'Free Games Bot Info', value: `Currently in **${numGuilds}** servers.\n Have any issues or feature requests? Check out the [Github Repo](https://github.com/yazninja/discord-fg-bot#readme)` },
            { name: 'Add Free Games Bot to another server', value: '[Invite Link](https://discord.com/api/oauth2/authorize?client_id=985786630923239465&permissions=124992&scope=bot)' }
        )
        .setAuthor({
            name: 'FreeGamesBot',
            iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
            url: 'https://github.com/yazninja/discord-fg-bot'
        });
}

export const redditEmbed = async function (guildId, channelId, force) {
    let targetURL = 'https://reddit.com/r/gamedeals/new.json?sort=new&t=week&limit=100';
    let reddit, redditPosts = [], games = [], channels = [];
    mongo.getGamesbyGuildId(guildId).then(g => {
        for (let game of g) {
            games.push(game.name);
            channels.push(game.channel);
        }
    });
    try {
        let res = await fetch(targetURL)
        res = await res.json();
        if (!res.data.children || res.data.children <= 0) { 
            consola.warn("[Reddit]", `Invalid response`); 
            return embedMsg = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Error')
                .setDescription('Invalid response from reddit')
        }
        else {
            reddit = res.data.children;
            consola.success("[Reddit]", `Found ${reddit.length} posts`);
            let regex = new RegExp("^(?=.*100%)(?=.*free).*$", "gi");
            let gameRegex = /(?=a)b/;
            let channelRegex = /(?=a)b/;
            if (games.length > 0 && !force) {
                gameRegex = new RegExp(`(${games.join('|')})`, "g");
                channelRegex = new RegExp(`(${channels.join('|')})`, "g");
            }
            for (let post of reddit) {
                if (regex.test(post.data.title) && (!post.data.id.match(gameRegex) || !channelId.match(channelRegex))) {
                    if (post.data.link_flair_text !== 'Expired') {
                        consola.log("[Reddit]", `Found post: ${post.data.thumbnail}`);
                        const embedMsg = new EmbedBuilder()
                            .setColor('Random')
                            .setTitle(post.data.title.length > 256 ? post.data.title.substring(0, 256) : post.data.title)
                            .setURL(`https://www.reddit.com${post.data.permalink}`)
                            .setDescription(`Free game here: ${post.data.url}`)
                            .setImage(post.data.thumbnail === 'default' || post.data.thumbnail === 'self' || post.data.thumbnail === 'nsfw' || post.data.thumbnail === 'spoiler' ? 'https://www.reddit.com/static/noimage.png' : post.data.thumbnail)
                            .setAuthor({
                                name: 'FreeGamesBot',
                                iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
                                url: 'https://github.com/yazninja/discord-fg-bot'
                            });
                        await mongo.addGame(post.data.id, guildId, channelId);
                        redditPosts.push(embedMsg);
                    }
                }
            }
            consola.info("[Reddit]", `Found ${redditPosts.length} posts`);
            if (redditPosts.length > 0) {
                return redditPosts;
            } else {
                return new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Error')
                    .setDescription('No new games found\n> To show all games, use the \`/reddit\` slash command and use the \`force\` option');
            }
        }
    } catch (err) { consola.error("[Reddit]", err); }
}
export const epicEmbed = async function () {
    const targetURL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions";
    let currEpicGames = "";
    let nextEpicGames = "";
    try {
        let res = await fetch(targetURL);
        res = await res.json();
        if (res.data) {
            for (let element of res.data.Catalog.searchStore.elements) {
                if (element.promotions && element.promotions.promotionalOffers.length > 0) {
                    currEpicGames += `[${element.title}](https://store.epicgames.com/en-US/p/${element.catalogNs.mappings[0].pageSlug}) | Started:<t:${Date.parse(element.promotions.promotionalOffers[0].promotionalOffers[0].startDate) / 1000}:R> | Ends:<t:${Date.parse(element.promotions.promotionalOffers[0].promotionalOffers[0].endDate) / 1000}:R>\n`;
                } else if (element.promotions && element.promotions.upcomingPromotionalOffers.length > 0) {
                    nextEpicGames += `[${element.title}](https://store.epicgames.com/en-US/p/${element.catalogNs.mappings[0].pageSlug}) | Starts:<t:${Date.parse(element.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate) / 1000}:R> | Ends:<t:${Date.parse(element.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].endDate) / 1000}:R>\n`;
                }
            }
        }
    } catch (err) { consola.error("[Epic Games]", err); }
    const embedMsg = new EmbedBuilder()
        .setColor('Random')
        .setTitle('EpicGames')
        .setFields([{ name: "Current Free Games", value: currEpicGames }, { name: "Upcoming Free Games", value: nextEpicGames }])
        .setTimestamp()
        .setAuthor({
            name: 'FreeGamesBot',
            iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
            url: 'https://github.com/yazninja/discord-fg-bot'
        });
    return embedMsg;
}

export const valoEmbed = async function () {
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
            return embedMsg;
        }
    } catch (err) { consola.error("[Valorant]", err); }
}

