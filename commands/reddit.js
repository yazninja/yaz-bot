import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { mongo } from '../integrations/mongo.js';
import consola from 'consola';
import fetch from 'node-fetch';

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
        const targetURL = 'https://reddit.com/r/gamedeals/new.json?sort=new&t=week&limit=100';
        let reddit, redditPosts = [], games = [], channels = [];
        mongo.getGamesbyGuildId(interaction.guildId).then(g => {
            for (let game of g) {
                games.push(game.name);
                channels.push(game.channel);
            }
        });
        try {
            let res = await fetch(targetURL)
            res = await res.json();
            if (!res.data) { consola.warn("[Reddit]", `No posts found`); interaction.reply({ content: "No posts found", ephemeral: true }); return; }
            else if (!res.data.children || res.data.children <= 0) { consola.warn("[Reddit]", `Invalid response`); interaction.reply({ content: "Invalid response from reddit", ephemeral:true }); return; }
            else {
                reddit = res.data.children;
                consola.success("[Reddit]", `Found ${reddit.length} posts`);
                let regex = new RegExp("(free|100%)", "gi");
                let gameRegex = /(?=a)b/;
                let channelRegex = /(?=a)b/;
                if (games.length > 0 && !force) {
                    gameRegex = new RegExp(`(${games.join('|')})`, "g");
                    channelRegex = new RegExp(`(${channels.join('|')})`, "g");
                }
                for (let post of reddit) {
                    if (regex.test(post.data.title) && (!post.data.id.match(gameRegex) || !interaction.channelId.match(channelRegex))) {
                        if (post.data.ups > 200 && post.data.thumbnail !== 'spoiler') {
                            const embedMsg = new EmbedBuilder()
                                .setColor('#0099ff')
                                .setTitle(post.data.title.length > 256 ? post.data.title.substring(0, 256) : post.data.title)
                                .setURL(`https://www.reddit.com${post.data.permalink}`)
                                .setDescription(`Free game here: ${post.data.url}`)
                                .setImage(post.data.thumbnail === 'default' ? 'https://www.reddit.com/static/noimage.png' : post.data.thumbnail)
                                .setAuthor({
                                    name: 'FreeGamesBot',
                                    iconURL: 'https://raw.githubusercontent.com/yazninja/discord-fg-bot/main/assets/bot%20icon.png',
                                    url: 'https://github.com/yazninja/discord-fg-bot'
                                });
                            await mongo.addGame(post.data.id, interaction.guildId, interaction.channelId);
                            redditPosts.push(embedMsg);
                        }
                    }
                }
                consola.info("[Reddit]", `Found ${redditPosts.length} posts`);
                if (redditPosts.length > 0) {
                    await interaction.editReply({ content: `Found ${redditPosts.length} games`, embeds: redditPosts, ephemeral: !show });
                } else {
                    await interaction.editReply({content: `No new games found\n> To show all games, use the \`force\` option`, ephemeral: true});
                }
            }
        } catch (err) { consola.error("[Reddit]", err); }
    }
}