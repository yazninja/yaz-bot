
import consola from 'consola';
import { EmbedBuilder } from 'discord.js';
import { mongo } from '../integrations/mongo.js';
import fetch from 'node-fetch';

export const event = {
    name: "messageCreate",
    async execute(message) {
        if(message.channel.id === "994805090084978788") {
            consola.info("[SteamDB]", message);
            await message.channel.send({embeds: [
                new EmbedBuilder()
                    .setColor('Random')
                    .setTitle('SteamDB')
                    .setDescription(message)
                    .setTimestamp()
            ]})
        }
        if (message.author.bot) return;
        
        switch (message.content) {
            case 'fg add': //Add the channel to list of channels which free games are sent
                addChannel(message);
                break;
            case 'fg remove': //Removes the channel to list of channels which free games are sent
                removeChannel(message);
                break;
            case 'fg active': //Check if the current channel is receiving free games
                activeChannels(message);
                break;
            case 'fg help': //Shows help info
                helpInfo(message);
                break;
            case 'fg epic': //Send epic games to the current channel
                sendEpicGames(message);
                break;
            case 'fg reddit': //Send epic games to the current channel
                sendReddit(message);
                break;
        }
    }
}
const sendEpicGames = async (message) => {
    consola.info("[Epic Games]", `${message.author.tag} requested`);
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
        .setColor('Random')
        .setTitle('EpicGames')
        .setFields([{ name: "Current Free Games", value: currEpicGames }, { name: "Upcoming Free Games", value: nextEpicGames }])
        .setTimestamp()
        .setAuthor({
            name: 'FreeGamesBot',
            iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
            url: 'https://github.com/yazninja/discord-fg-bot'
        });
    await message.channel.send({ embeds: [embedMsg] });
    consola.success("[Epic Games]", `Sent to ${message.author.tag} at ${message.channel.name}`);
};

const helpInfo = async (message) => {
    consola.info("[Help]", `${message.author.tag} requested`);
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
            { name: 'Slash Commands (/) **New**', value: 'To use these commands, prefix them with a slash (/)\nCurrently:[/epic, /reddit, /help]' },
            { name: 'Free Games Bot Info', value: `Currently in **${message.client.guilds.cache.size}** servers.\n Have any issues or feature requests? Check out the [Github Repo](https://github.com/yazninja/discord-fg-bot#readme)` },
            { name: 'Add Free Games Bot to another server', value: '[Invite Link](https://discord.com/api/oauth2/authorize?client_id=985786630923239465&permissions=124992&scope=bot)' }
        )
        .setAuthor({
            name: 'FreeGamesBot',
            iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
            url: 'https://github.com/yazninja/discord-fg-bot'
        });
    message.channel.send({ embeds: [embedMsg] });
    consola.success("[Help]", `Sent to ${message.author.tag} at ${message.channel.name}`);
}

const sendReddit = async (message) => {
    consola.info("[Reddit]", `${message.author.tag} requested`);
    const targetURL = 'https://reddit.com/r/gamedeals/new.json?sort=new&t=week&limit=100';
    let reddit;
    let redditPosts = [];
    let games = [];
    let channels = [];
    let g = await mongo.getGamesbyGuildId(message.guildId);
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
            message.channel.send("No posts found");
            return;
        } else if (!reddit.data.children || reddit.data.children <= 0) {
            consola.warn("[Reddit]", `Invalid response`);
            message.channel.send("Invalid response");
            return;
        }
        else {
            reddit = reddit.data.children;
            consola.success("[Reddit]", `Found ${reddit.length} posts`);
            let regex = new RegExp("(free|100%)", "gi");
            let gameRegex = /(?=a)b/;
            let channelRegex = /(?=a)b/;
            if (games.length > 0) {
                gameRegex = new RegExp(`(${games.join('|')})`, "g");
                channelRegex = new RegExp(`(${channels.join('|')})`, "g");
            }

            for (let i = 0; i < 100; i++) {
                if (regex.test(reddit[i].data.title) && (!reddit[i].data.id.match(gameRegex) || !message.channel.id.match(channelRegex))) {
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
                            .setColor('Random')
                            .setTitle(title)
                            .setURL(`https://www.reddit.com${reddit[i].data.permalink}`)
                            .setDescription(`Free game here: ${reddit[i].data.url}`)
                            .setImage(thumbnail)
                            .setAuthor({
                                name: 'FreeGamesBot',
                                iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
                                url: 'https://github.com/yazninja/discord-fg-bot'
                            });
                        await mongo.addGame(reddit[i].data.id, message.guildId, message.channelId);
                        redditPosts.push(embedMsg);
                    }
                }
            }
            consola.info("[Reddit]", `Found ${redditPosts.length} posts`);
            if (redditPosts.length > 0) {
                await message.channel.send({ content: `Found ${redditPosts.length} games`, embeds: redditPosts });
            } else {
                await message.channel.send("No new games found");
            }
        }
    } catch (err) {
        consola.error("[Reddit]", err);
    }
}

const addChannel = async (message) => {
    consola.info("[Add Channel]", `${message.author.tag} requested in ${message.channel.name}`);
    try{
        await mongo.addSyncChannel(message.guildId, message.channelId);
        message.reply("This Channel will now be receiving free game alerts\n> To see the current list of channels, use `fg active`\n> To unsubscribe from free game alerts, use `fg remove`");
    } catch (err) {
        consola.error("[Add Channel]", err);
    }
}

const removeChannel = async (message) => {
    consola.info("[Remove Channel]", `${message.author.tag} requested in ${message.channel.name}`);
    try{
        await mongo.removeSyncChannel(message.guildId, message.channelId);
        message.reply("This Channel will no longer be receiving free game alerts\n> To see the current list of channels, use `fg active`\n> To subscribe to free game alerts, use `fg add`");
    } catch (err) {
        consola.error("[Remove Channel]", err);
    }
}

const activeChannels = async (message) => {
    consola.info("[Active Channels]", `${message.author.tag} requested in ${message.channel.name}`);
    try{
        let channels = await mongo.getSyncChannels(message.guildId);
        if (channels != null && channels.length > 0) {
            let channelList = channels.map(channel => `<#${channel}>`).join('\n');
            message.reply(`The following channels are currently subscribed to free game alerts:\n${channelList}`);
        } else {
            message.reply("No channels are currently subscribed to free game alerts");
        }
    } catch (err) {
        consola.error("[Active Channels]", err);
    }
}
