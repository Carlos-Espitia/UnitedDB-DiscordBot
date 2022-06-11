import Discord, { Intents, MessageEmbed, TextChannel } from "discord.js";
import axios from 'axios'
const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
import { config } from './config'
import * as XboxLiveAPI from '@xboxreplay/xboxlive-api';
import { Authflow } from 'prismarine-auth';
export const auth = new Authflow(`QSMX`, `./auth`, {})

/// xbox live api stuff 
export async function getXuidByGamertag(xbl: any, gamertag: string) {
    try{
        return parseInt(await XboxLiveAPI.getPlayerXUID(gamertag,{
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken}))
    } catch {}
}

export async function getGamertagByXuid(xbl: any, xuid: number | string) {
    //xuid must be validated first 
    try{
        var data = await XboxLiveAPI.getPlayerSettings(xuid, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken}, 
            ['Gamertag'])
        return data[0].value
    } catch (err){
        console.log(err)
    }
}

export async function validateXuid(xbl: any, xuid: string | number) {
    var xboxData;
    try{
        xboxData = await XboxLiveAPI.getPlayerSettings(xuid, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken}, 
            ['Gamertag'])
    }catch (err) {
        console.log(err)
    }
    if(!xboxData) return false
    if(xboxData) return true
}

export async function validateGamertag(xbl: any, gamertag: string) {
    var validGamertag;
    try{
        validGamertag = await XboxLiveAPI.getPlayerXUID(gamertag, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken})
    }catch{}
    console.log(validGamertag)
    if(!validGamertag) return false
    if(validGamertag) return true
}

///

client.once('ready', () => {
    console.log('bot is online!')

    //remove guildid for global cmds
    const guildId = '984207569386094612'
    const guild = client.guilds.cache.get(guildId)

    let commands

    if(guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'db_lookup',
        description: 'Lookup banned player, provide gamertag or xuid.',
        options: [
            {
            name: 'gamertag',
            description: 'Provide a gamertag',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
            name: 'xuid',
            description: 'Provide a xuid',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            }
        ]
    })

    commands?.create({
        name: 'db_ban_player',
        description: 'Ban player',
        options: [
            {
            name: 'gamertag',
            description: 'Provide a gamertag',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
            name: 'xuid',
            description: 'Provide a xuid',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
                name: 'reason',
                description: 'Provide a reason',
                required: false,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
                name: 'proof',
                description: 'Provide proof',
                required: false,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            }
        ]
    })

    commands?.create({
        name: 'db_unban_player',
        description: 'Unban player',
        options: [
            {
            name: 'gamertag',
            description: 'Provide a gamertag',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
            name: 'xuid',
            description: 'Provide a xuid',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            }
        ]
    })
    commands?.create({
        name: 'db_request_ban',
        description: 'Request to ban a player',
        options: [
            {
                name: 'reason',
                description: 'Provide a reason',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
                name: 'proof',
                description: 'Provide proof',
                required: true,
                type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
            name: 'gamertag',
            description: 'Provide a gamertag',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
            {
            name: 'xuid',
            description: 'Provide a xuid',
            required: false,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING 
            },
        ]
    })
})

const DB_API = 'http://localhost:5000'

// TYPES ////////////////////////////
class BannedPlayerInfo {
    xuid: number | undefined
    gamertag: string | undefined
    reason: string | undefined
    proof: string | undefined
    date: string | undefined
}
class BanningPlayerPost {
    message: string | undefined
    xuid: number | undefined
    gamertag: string | undefined
    reason: string | undefined
    proof: string | undefined
    date: string | undefined
}
class UnbanningPlayerDelete {
    message: string | undefined
    xuid: number | undefined
    gamertag: string | undefined
}
// TYPES ////////////////////////////

// CHECKS //////////////////////////
export function isValidUrl(url: string) {
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return matchpattern.test(url);
}
// CHECKS //////////////////////////

class commandManager {
    async lookUp(interaction: Discord.CommandInteraction<Discord.CacheType>) {
        if(!interaction.member) return

        const loading = getTemplate()
        .setDescription('Fetching user...')
        await interaction.reply({embeds: [loading], ephemeral: true })

        var gamertag = interaction.options.getString('gamertag')
        var xuid = interaction.options.getString('xuid')
        var embed;

        if(!gamertag && !xuid) {
            embed = getTemplate()
            .setDescription(`You must provide a gamertag or xuid!`)
            return interaction.editReply({ embeds: [embed]});
        }

        var gamertagORxuid;
        if(xuid) { gamertagORxuid = xuid } else { gamertagORxuid = gamertag }

        try {
            const playerInfo: BannedPlayerInfo = await (await axios.get(`${DB_API}/BannedPlayers/LookUp/${gamertagORxuid}`)).data
            embed = getTemplate()
                .setDescription(``+
                `\n**xuid**: ${playerInfo.xuid}`+
                `\n**gamertag**: ${playerInfo.gamertag}`+
                `\n**reason**: ${playerInfo.reason}`+
                `\n**proof**: ${playerInfo.proof}`)

            return interaction.editReply({ embeds: [embed]});
        } catch (err: any) {
                embed = getTemplate().setDescription(err.response.data)
            return interaction.editReply({ embeds: [embed]});
        }
    }

    async banPlayer(interaction: Discord.CommandInteraction<Discord.CacheType>) {
        if(!interaction.member) return
        const loading = getTemplate()
        .setDescription('Checking for authorization...')
        await interaction.reply({embeds: [loading], ephemeral: true })

        var gamertag = interaction.options.getString('gamertag')
        var xuid = interaction.options.getString('xuid')
        var reason = interaction.options.getString('reason')
        var proof = interaction.options.getString('proof')

        var embed;
        if(!config.Admins.includes(interaction.member.user.id) && !config.Authorities.includes(interaction.member.user.id)) {
            embed = getTemplate()
            .setDescription(`You do not have permission to unban players!`)
            return interaction.editReply({ embeds: [embed]});
        }

        if(!gamertag && !xuid) {
            embed = getTemplate()
            .setDescription(`You must provide a gamertag or xuid!`)
            return interaction.editReply({ embeds: [embed]});
        }

        var gamertagORxuid;
        if(xuid) { gamertagORxuid = xuid } else { gamertagORxuid = gamertag }
        
        //auth filter
        if(!config.Admins.includes(interaction.member.user.id)) {
            try {
                const response: BanningPlayerPost = await (await axios.post(`${DB_API}/BannedPlayers/Add/${gamertagORxuid}`, {
                    reason: reason, 
                    proof: proof
                },{
                    headers: {
                        "authorization": config.AuthKey
                    }
                })).data
                embed = getTemplate()
                .setDescription(``+
                `\n${response.message}`+
                `\n**Xuid**: ${response.xuid}`+
                `\n**Gamertag**: ${response.gamertag}`+
                `\n**Reason**: ${response.reason}`+
                `\n**Proof**: ${response.proof}`+
                `\n**Date**: ${response.date}`)
                return interaction.editReply({ embeds: [embed]});
            } catch (err: any) {
                embed = getTemplate()
                .setDescription(err.response.data)
                return interaction.editReply({ embeds: [embed]});
            }
        }

        try {
            const response: BanningPlayerPost = await (await axios.post(`${DB_API}/BannedPlayers/Add/${gamertagORxuid}`, undefined,{
                headers: {
                    "authorization": config.AdminKey
                }
            })).data
            embed = getTemplate()
            .setDescription(``+
            `\n${response.message}`+
            `\n**Xuid**: ${response.xuid}`+
            `\n**Gamertag**: ${response.gamertag}`+
            `\n**Reason**: ${response.reason}`+
            `\n**Proof**: ${response.proof}`+
            `\n**Date**: ${response.date}`)
            return interaction.editReply({ embeds: [embed]});
        } catch (err: any) {
            embed = getTemplate()
            .setDescription(err.response.data)
            return interaction.editReply({ embeds: [embed]});
        }
    }
    async unbanPlayer(interaction: Discord.CommandInteraction<Discord.CacheType>) {
        if(!interaction.member) return
        const loading = getTemplate()
        .setDescription('Checking for authorization...')
        await interaction.reply({embeds: [loading], ephemeral: true })

        var gamertag = interaction.options.getString('gamertag')
        var xuid = interaction.options.getString('xuid')

        var embed;

        if(!config.Admins.includes(interaction.member.user.id) && !config.Authorities.includes(interaction.member.user.id)) {
            embed = getTemplate()
            .setDescription(`You do not have permission to unban players!`)
            return interaction.editReply({ embeds: [embed]});
        }

        if(!gamertag && !xuid) {
            embed = getTemplate()
            .setDescription(`You must provide a gamertag or xuid!`)
            return interaction.editReply({ embeds: [embed]});
        }

        var gamertagORxuid;
        if(xuid) { gamertagORxuid = xuid } else { gamertagORxuid = gamertag }

        try {
            const response: UnbanningPlayerDelete = await (await axios.delete(`${DB_API}/BannedPlayers/Remove/${gamertagORxuid}`,{
                headers: {
                    "authorization": config.AuthKey
                }
            })).data
            embed = getTemplate()
            .setDescription(``+
            `\n${response.message}`+
            `\n**Xuid**: ${response.xuid}`+
            `\n**Gamertag**: ${response.gamertag}`)
            return interaction.editReply({ embeds: [embed]});
        } catch (err: any) {
            embed = getTemplate()
            .setDescription(err.response.data)
            return interaction.editReply({ embeds: [embed]});
        }
    }

    async requestBanPlayer(interaction: Discord.CommandInteraction<Discord.CacheType>) {
        //interaction.member.user.username
        if(!interaction.member) return
        const loading = getTemplate()
        .setDescription('Requesting player ban...')
        await interaction.reply({embeds: [loading], ephemeral: true })

        var gamertag: string | null | undefined = interaction.options.getString('gamertag')
        var xuid: string | null | undefined | number = interaction.options.getString('xuid')
        var reason = interaction.options.getString('reason')
        var proof = interaction.options.getString('proof')
        if(!proof) return // it shouldn't be null since it's required

        var embed;

        if(!gamertag && !xuid) {
            embed = getTemplate()
            .setDescription(`You must provide a gamertag or xuid!`)
            return interaction.editReply({ embeds: [embed]});
        }

        var gamertagORxuid;
        if(xuid) { gamertagORxuid = xuid } else { gamertagORxuid = gamertag }

        try{
            await (await axios.get(`${DB_API}/BannedPlayers/LookUp/${gamertagORxuid}`)).data //check if player is in db
            embed = getTemplate().setDescription(`Player is already databased banned.`)
            return interaction.editReply({ embeds: [embed]});
        } catch (err:any) {} // if catch then good

        const xbl = await auth.getXboxToken()
        // validate if gamertag or xuid exist
        if(xuid) {
            if(!await validateXuid(xbl,xuid)) {
                embed = getTemplate()
                .setDescription(`Not a valid xuid!`)
                return interaction.editReply({ embeds: [embed]});
            }
            gamertag = await getGamertagByXuid(xbl,xuid)
        } else {
            if(gamertag == null) return //shouldn't be nulled
            if(!await validateGamertag(xbl,gamertag)) {
                embed = getTemplate()
                .setDescription(`Not a valid gamertag!`)
                return interaction.editReply({ embeds: [embed]});
            }
            xuid = await getXuidByGamertag(xbl,gamertag)
        }


        if(!isValidUrl(proof)) {
            embed = getTemplate()
            .setDescription(`You did not provide a valid URL for proof!`)
            return interaction.editReply({ embeds: [embed]});
        }

        //send to private channel for admins to look over the report
        interaction.member.user.username
        const reportEmbed = new MessageEmbed().setAuthor('Ban Player Request', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96')
        .setDescription(``+
        `\n\n**Xuid**: ${xuid}`+
        `\n**Gamertag**: ${gamertag}`+
        `\n**Reason**: ${reason}`+
        `\n**Proof**: ${proof}`+
        `\n**Date**: ${new Date().toLocaleString()}`+
        `\n\n**From**`+
        `\nUsername: ${interaction.member.user.username}`+
        `\nID: ${interaction.member.user.id}`+
        `\nServer: ${interaction.guild?.name}`);

        ( client.channels.cache.get(config.LogChannel) as TextChannel ).send({embeds: [reportEmbed]})

        embed = getTemplate()
        .setDescription(``+
        `\nSuccesfully reported player!`+
        `\n**Xuid**: ${xuid}`+
        `\n**Gamertag**: ${gamertag}`+
        `\n**Reason**: ${reason}`+
        `\n**Proof**: ${proof}`+
        `\n**Date**: ${new Date().toLocaleString()}`)
        return interaction.editReply({ embeds: [embed]});
    }
}
const CMDMAN = new commandManager()

//////////////////////////////////////
function getTemplate(): MessageEmbed {
    return new MessageEmbed().setAuthor('United Realms', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96')
}

//////////////////////////////////////

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'db_lookup') CMDMAN.lookUp(interaction)
    if (interaction.commandName === 'db_ban_player') CMDMAN.banPlayer(interaction)
    if (interaction.commandName === 'db_unban_player') CMDMAN.unbanPlayer(interaction)
    if (interaction.commandName === 'db_request_ban') CMDMAN.requestBanPlayer(interaction)
    // if (interaction.commandName === 'db_help') CMDMAN.lookUp(interaction)
})

client.login('OTg0MjA2MzU2MzM0NjU3NjQ2.GlbCPM.4rud0IjRCCmx0S_jSfSFQp8e4hrfCTxH8zhIK8')