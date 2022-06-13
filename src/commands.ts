import { auth, BannedPlayerInfo, BanningPlayerPost, client, DB_API, UnbanningPlayerDelete } from "./index"
import Discord, { Intents, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
import { config } from "./config";
import { getGamertagByXuid, getTemplate, getXuidByGamertag, isValidUrl, validateGamertag, validateXuid } from "./utils";
import axios from "axios";

    
export function RegisterCommands() {
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

    commands?.create({
        name: 'invite',
        description: 'Invite bot to discord'
    })

    commands?.create({
        name: 'info',
        description: 'DB and bot information'
    })
}

/////////////////////////////////////////////////////////////////////////////////////


class commandManager {

    async info(interaction: Discord.CommandInteraction<Discord.CacheType>) {
        if(!interaction.member) return

        const loading = getTemplate()
        .setDescription('Fetching banned players...')
        await interaction.reply({embeds: [loading], ephemeral: true })

        var embed;
        try {
            const bannedPlayers: object[] = await (await axios.get(`${DB_API}/BannedPlayers`, {
                headers: {
                    "authorization": config.UnitedDBLoginStaff
                }
            })).data

            embed = getTemplate()
                .setDescription(`Banned player count: ${bannedPlayers.length}`)

            return interaction.editReply({ embeds: [embed]});
        } catch (err: any) {
                embed = getTemplate().setDescription(err.response.data)
            return interaction.editReply({ embeds: [embed]});
        }

    }

    async invite(interaction: Discord.CommandInteraction<Discord.CacheType>) {
        if(!interaction.member) return

        const inviteMsg = new MessageEmbed()
        .setTitle('Click Here')
        .setURL('https://discord.com/oauth2/authorize?client_id=984206356334657646&scope=bot&permissions=549755289087')
        .setDescription(`**Invite UnitedDB To Your Discord!**`)
        return await interaction.reply({embeds: [inviteMsg]})
    }

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
                `\n**proof**: ${playerInfo.proof}`+
                `\n**Banned by**: ${playerInfo.bannedBy}`+
                `\n**Date**: ${playerInfo.date}`)

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
        if(!config.Admins.includes(interaction.member.user.id) && !config.Staff.includes(interaction.member.user.id)) {
            embed = getTemplate()
            .setDescription(`You do not have permission to ban players!`)
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
                    proof: proof,
                    discordUser: `${interaction.member.user.username}#${interaction.member.user.discriminator}`
                },{
                    headers: {
                        "authorization": config.UnitedDBLoginStaff
                    }
                })).data
                embed = getTemplate()
                .setDescription(``+
                `\n${response.message}`+
                `\n**Xuid**: ${response.xuid}`+
                `\n**Gamertag**: ${response.gamertag}`+
                `\n**Reason**: ${response.reason}`+
                `\n**Proof**: ${response.proof}`+
                `\n**Banned by**: ${response.bannedBy}`+
                `\n**Date**: <t:${(Date.now()/1000).toString().split('.')[0]}:F>`)
                return interaction.editReply({ embeds: [embed]});
            } catch (err: any) {
                embed = getTemplate()
                .setDescription(err.response.data)
                return interaction.editReply({ embeds: [embed]});
            }
        }

        try {
            const response: BanningPlayerPost = await (await axios.post(`${DB_API}/BannedPlayers/Add/${gamertagORxuid}`, {
                discordUser: `${interaction.member.user.username}#${interaction.member.user.discriminator}`
            },{
                headers: {
                    "authorization": config.UnitedDBLoginAdmin
                }
            })).data
            embed = getTemplate()
            .setDescription(``+
            `\n${response.message}`+
            `\n**Xuid**: ${response.xuid}`+
            `\n**Gamertag**: ${response.gamertag}`+
            `\n**Reason**: ${response.reason}`+
            `\n**Proof**: ${response.proof}`+
            `\n**Banned by**: ${response.bannedBy}`+
            `\n**Date**: <t:${(Date.now()/1000).toString().split('.')[0]}:F>`)
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

        if(!config.Admins.includes(interaction.member.user.id)) {
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
                    "authorization": config.UnitedDBLoginAdmin
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
        const reportEmbed = new MessageEmbed().setAuthor('Ban Player Request', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96')
        .setDescription(``+
        `\n\n**Xuid**: ${xuid}`+
        `\n**Gamertag**: ${gamertag}`+
        `\n**Reason**: ${reason}`+
        `\n**Proof**: ${proof}`+
        `\n**Date**: <t:${(Date.now()/1000).toString().split('.')[0]}:F>`+
        `\n\n**From**`+
        `\nUsername: ${interaction.member.user.username}#${interaction.member.user.discriminator}`+
        `\nID: ${interaction.member.user.id}`+
        `\nServer: ${interaction.guild?.name}`);

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('Request_Accept')
                .setLabel('Accept')
                .setStyle('SUCCESS'),

            new MessageButton()
                .setCustomId('Request_Decline')
                .setLabel('Decline')
                .setStyle('DANGER')
            //add option why it was declined 
        );


        ( client.channels.cache.get(config.LogChannel) as TextChannel ).send({embeds: [reportEmbed], components: [row]})

        embed = getTemplate()
        .setDescription(``+
        `\nSuccesfully reported player!`+
        `\n**Xuid**: ${xuid}`+
        `\n**Gamertag**: ${gamertag}`+
        `\n**Reason**: ${reason}`+
        `\n**Proof**: ${proof}`+
        `\n**Date**: <t:${(Date.now()/1000).toString().split('.')[0]}:F>`)
        return interaction.editReply({ embeds: [embed]});
    }
}
export const CMDMAN = new commandManager()
