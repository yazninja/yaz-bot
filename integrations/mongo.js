import { default as tunnel } from 'tunnel-ssh';
import { MongoClient } from 'mongodb';
import 'dotenv/config'

if (process.env.NODE_ENV === 'development') {
    tunnel({
        username: process.env.SSH_USER,
        host: process.env.SSH_HOST,
        port: process.env.SSH_PORT,
        password: process.env.SSH_PASS,
        dstHost: process.env.SSH_DST_HOST,
        dstPort: process.env.SSH_DST_PORT,
        localHost: process.env.SSH_LOCAL_HOST,
        localPort: process.env.SSH_LOCAL_PORT,
    }, function (error, server) {
        if (error) { return console.log(error); }
        console.log(`[SSH] Successfully Connected to ${server.address().address} @ ${server.address().port}`);
    });
}
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
            if (guild) return guild.channels
            return null;
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
    },
    async setValoPatch(valoUID) {
        try {
            await client.db('fgbot').collection('valo').updateOne({}, { $set: { currpatch: valoUID } }, { upsert: true })
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    },
    async getValoPatch() {
        try {
            let patch = await client.db('fgbot').collection('valo').findOne()
            return patch.currpatch
        } catch (e) {
            consola.error("\x1b[33m%s\x1b[0m", '[mongo]', 'Not Available. \n' + e)
        }
    }
}