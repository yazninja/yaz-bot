import { MongoClient } from 'mongodb';
import 'dotenv/config'
const client = new MongoClient(process.env.mongo);

export const mongo = {
    async init() {
        await client.connect();
        consola.success("\x1b[33m%s\x1b[0m", '[mongo]', 'Connected!')
    },
    async addGame(gameId, guildId, channelId) {
        try {
            await client.db('fgbot').collection('guilds').updateOne({ id: guildId }, { $addToSet: { games: { id: gameId, channel: channelId } } }, { upsert: true })
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    },
    async addSyncChannel(guildId, channelId) {
        try {
            await client.db('fgbot').collection('sync').updateOne({ id: guildId }, { $addToSet: { channels: channelId } }, { upsert: true })
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    },
    async removeSyncChannel(guildId, channelId) {
        try {
            await client.db('fgbot').collection('sync').updateOne({ id: guildId }, { $pull: { channels: channelId } }, { upsert: true })
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    },
    async getSyncChannels(guildId) {
        try {
            const guild = await client.db('fgbot').collection('sync').findOne({ id: guildId })
            return guild.channels
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    },
    async getSyncGuilds() {
        try {
            const guilds = await client.db('fgbot').collection('sync').find({}).toArray()
            return guilds
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    },
    async getGamesbyGuildId(guildId) {
        try {
            let game = await client.db('fgbot').collection('guilds').findOne({ id: guildId })
            return game.games
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    }

}