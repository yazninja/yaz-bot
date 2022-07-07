import consola from 'consola';
import { EmbedBuilder } from 'discord.js';
import { mongo } from '../integrations/mongo.js';
import fetch from 'node-fetch';

export const event = {
    name: 'sendSync',
    async execute(client) {
        let guilds = [], channels = [], sendValo = false;
        setInterval(async () => {
            var date = new Date();
            if (date.getMinutes() === 0) { // every hour
                let res = fetch("https://playvalorant.com/page-data/en-us/news/tags/patch-notes/page-data.json")
                res = await sendValo.json();
                if (res.result) {
                    if (res.result.data.articles.nodes[0] === await mongo.getValoPatch())
                        sendValo = true;
                } else { consola.error("[SendSync]", "Valorant servers ofline") }
                const mongoGuilds = await mongo.getSyncGuilds();

                for (let guild of mongoGuilds) {
                    guilds.push(client.guilds.cache.get(guild.id));
                }
                consola.info("[DEBUG]", `Found ${guilds.length} guilds`);
                for (let guild of guilds) {
                    const mongoChannels = await mongo.getSyncChannels(guild.id);
                    for (let channel of mongoChannels) {
                        channels.push(guild.channels.cache.get(channel));
                    }
                }
                consola.info("[DEBUG]", `Found ${channels.length} channels`);
                for (let channel of channels) {
                    await sendReddit(channel);
                }
                if (sendValo) {
                    for (let channel of channels) {
                        await sendValorantPatch(channel);
                    }
                }
                if (date.getDay() === 4 && date.getHours() === 15) { // every thursday at 8am
                    for (let channel of channels) {
                        await sendEpicGames(channel);
                    }
                }
            }
            guilds = [], channels = [], sendValo = false;
        }, 60000); // every minute
    }
}

const sendEpicGames = async (channel) => {
    consola.info("[Epic Games]", `Automatic sync requested at ${channel.name}`);
    const targetURL = "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions";
    let currEpicGames = "";
    let nextEpicGames = "";
    try {
        const res = await fetch(targetURL);
        const body = await res.json();
        if (body.data) {
            for (let element of body.data.Catalog.searchStore.elements) {
                if (element.promotions && element.promotions.promotionalOffers.length > 0) {
                    currEpicGames += `[${element.title}](https://store.epicgames.com/en-US/p/${element.catalogNs.mappings[0].pageSlug}) | Ends:<t:${Date.parse(element.promotions.promotionalOffers[0].promotionalOffers[0].endDate) / 1000}:R>\n`;
                } else if (element.promotions && element.promotions.upcomingPromotionalOffers.length > 0) {
                    nextEpicGames += `[${element.title}](https://store.epicgames.com/en-US/p/${element.catalogNs.mappings[0].pageSlug}) | Starts:<t:${Date.parse(element.promotions.upcomingPromotionalOffers[0].promotionalOffers[0].startDate) / 1000}:R>\n`;
                }
            }
        }
    } catch (err) {
        console.log(err);
    }
    const embedMsg = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('EpicGames')
        .setFields([{ name: "Current Free Games", value: currEpicGames }, { name: "Upcoming Free Games", value: nextEpicGames }])
        .setTimestamp()
        .setAuthor({
            name: 'FreeGamesBot',
            iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
            url: 'https://github.com/yazninja/discord-fg-bot'
        });
    await channel.send({ embeds: [embedMsg] });
    consola.success("[Epic Games]", `Automatically Sent to ${channel.name}`);
};

const sendReddit = async (channel) => {
    consola.info("[Reddit]", `Automatic sync requested at ${channel.name}`);
    const targetURL = 'https://reddit.com/r/gamedeals/new.json?sort=new&t=week&limit=100';
    let reddit;
    let redditPosts = [];
    let games = [];
    let channels = [];
    let g = await mongo.getGamesbyGuildId(channel.guildId);
    if (g) {
        for (let game of g) {
            games.push(game.id);
            channels.push(game.channel);
        }
    }

    try {
        const res = await fetch(targetURL);
        reddit = await res.json();
        if (!reddit.data) {
            consola.warn("[Reddit]", `No posts found`);
            channel.send("No posts found");
            return;
        } else if (!reddit.data.children || reddit.data.children <= 0) {
            consola.warn("[Reddit]", `Invalid response`);

            channel.send("Invalid response");
            return;
        }
        else {
            reddit = reddit.data.children;
            consola.success("[Reddit]", `Found ${reddit.length} posts`);
            let regex = new RegExp("(free|100%)", "gi");
            let gameRegex = /(?=a)b/;
            let channelRegex = /(?=a)b/;
            if (games.length > 0) {
                consola.info("[Reddit]", games.join('|'), "\n", channels.join('|'));
                gameRegex = new RegExp(`(${games.join('|')})`, "g");
                channelRegex = new RegExp(`(${channels.join('|')})`, "g");
            }

            for (let i = 0; i < 100; i++) {
                if (regex.test(reddit[i].data.title) && (!reddit[i].data.id.match(gameRegex) || !channel.id.match(channelRegex))) {
                    if (reddit[i].data.ups > 200 && reddit[i].data.thumbnail !== 'spoiler') {
                        let title = reddit[i].data.title;
                        if (title.length > 256) {
                            title = title.substring(0, 256);
                        }
                        let thumbnail;
                        if (reddit[i].data.thumbnail === 'default' || reddit[i].data.thumbnail === 'self') { // no thumbnail from reddit
                            thumbnail = 'https://www.reddit.com/static/noimage.png';
                        } else {
                            thumbnail = reddit[i].data.thumbnail;
                        }
                        const embedMsg = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle(title)
                            .setURL(`https://www.reddit.com${reddit[i].data.permalink}`)
                            .setDescription(`Free game here: ${reddit[i].data.url}`)
                            .setImage(thumbnail)
                            .setAuthor({
                                name: 'FreeGamesBot',
                                iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
                                url: 'https://github.com/yazninja/discord-fg-bot'
                            });
                        await mongo.addGame(reddit[i].data.id, channel.guildId, channel.id);
                        redditPosts.push(embedMsg);
                    }
                }
            }
            consola.info("[Reddit]", `Found ${redditPosts.length} posts`);
            if (redditPosts.length > 0) {
                await channel.send({ content: `New Games found!`, embeds: redditPosts });
            }
        }
    } catch (err) {
        consola.error("[Reddit]", err);
    }
};

const sendValorantPatch = async (channel) => {
    consola.info("[Valorant]", `Automatic sync requested at ${channel.name}`);
    const targetURL = "https://playvalorant.com/page-data/en-us/news/tags/patch-notes/page-data.json";
    try {
        let res = await fetch(targetURL);
        res = await res.json();
        if (res.result) {
            mongo.getValoPatch();
            let currpatch = res.result.data.articles.nodes[0];
            if (currpatch.uid === await mongo.getValoPatch()) {
                consola.info("[Valorant]", `${interaction.user.tag} already has the latest patch`);
            }
            else {
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
                await interaction.editReply({ content: "[VALORANT] New Patch Detected", embeds: [embedMsg], ephemeral: !show });
            }
        }
    } catch (err) { consola.error("[Valorant]", err); }
};