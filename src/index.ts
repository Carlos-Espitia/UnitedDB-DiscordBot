import Discord, {Intents, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
export const client = new Discord.Client({ intents: [ Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES ] });
import { Modal, TextInputComponent, showModal } from "discord-modals";
import { config } from './config'
import { Authflow } from 'prismarine-auth';
import { CMDMAN, RegisterCommands } from "./commands";
import { getTemplate } from "./utils";
import axios from "axios";
export const auth = new Authflow(`QSMX`, `./auth`, {})

export const DB_API = 'http://localhost:5000'

client.once('ready', () => {
    console.log('bot is online!')
    RegisterCommands()
})

// TYPES ////////////////////////////
export class BannedPlayerInfo {
    xuid: number | undefined
    gamertag: string | undefined
    reason: string | undefined
    proof: string | undefined
    bannedBy: string | undefined
    date: string | undefined
}
export class BanningPlayerPost {
    message: string | undefined
    xuid: number | undefined
    gamertag: string | undefined
    reason: string | undefined
    proof: string | undefined
    bannedBy: string | undefined
    date: string | undefined
}
export class UnbanningPlayerDelete {
    message: string | undefined
    xuid: number | undefined
    gamertag: string | undefined
}
// TYPES ////////////////////////////

class buttonManager {

}

const BMAN = new buttonManager()

//////////////////////////////////////
//////////////////////////////////////

client.on('interactionCreate', async (interaction) => {
    if(interaction.isModalSubmit()) {
        if(interaction.customId === 'Request_Decline_Modal') {
            const reason_Input = interaction.components[0].components[0].value

            //@ts-ignore // .delete() is not included in the discord js types
            try{interaction.message.delete()} catch {}

            // ( client.channels.cache.get(config.LogChannel) as TextChannel ).send({embeds: [declinedReport]}).then(msg => {setTimeout(() => msg.delete(), 7000)}).catch()

            //notify reporter
            const id = interaction.message?.embeds[0].description?.split('ID: ')[1].split('\n')[0].trim()
            const declinedReport = getTemplate().setDescription(`${interaction.user.username} has declined the report. Reason: ${reason_Input}`);

            //@ts-ignore // .delete() is not included in the discord js types
            interaction.reply({ embeds: [declinedReport]}).then(msg => {setTimeout(() => msg.delete(), 7000)}).catch();
            if(!id) return // not supposed to be undefined 
            const user = await client.users.fetch(id).catch();
            user.send({ embeds: [ declinedReport ] }).catch(); // might change msg later
        }
    }

    if (interaction.isButton()) {
        if(interaction.customId === 'Request_Accept') {
            if(!config.Admins.includes(interaction.user.id) && !config.Staff.includes(interaction.user.id)) return console.log('this user is not allowed to review reports')

            //@ts-ignore // .delete() is not included in the discord js types
            try{interaction.message.delete()} catch {}

            //notify reporter

            //@ts-ignore // .delete() is not included in the discord js types
            // interaction.reply({ embeds: [acceptedReport]}).then(msg => {setTimeout(() => msg.delete(), 7000)}).catch();

            // ( client.channels.cache.get(config.LogChannel) as TextChannel ).send({embeds: [acceptedReport]}).then(msg => {setTimeout(() => msg.delete(), 7000)}).catch()

            // console.log(interaction.message?.embeds[0].description)

            const xuid = interaction.message?.embeds[0].description?.split('**Xuid**: ')[1].split('\n')[0].trim()
            const reason = interaction.message?.embeds[0].description?.split('**Reason**: ')[1].split('\n')[0].trim()
            const proof = interaction.message?.embeds[0].description?.split('**Proof**: ')[1].split('\n')[0].trim()

            if(!interaction.member) return // not supposed to be undefined 

            const loading = getTemplate()
            .setDescription('Checking for authorization...')
            await interaction.reply({embeds: [loading]})

            try {
                const response: BanningPlayerPost = await (await axios.post(`${DB_API}/BannedPlayers/Add/${xuid}`, {
                    reason: reason, 
                    proof: proof,
                    discordUser: `${interaction.member.user.username}#${interaction.member.user.discriminator}`
                },{
                    headers: {
                        "authorization": config.UnitedDBLoginStaff
                    }
                })).data
                const embed = getTemplate()
                .setDescription(``+
                `\n${response.message}`+
                `\n**Xuid**: ${response.xuid}`+
                `\n**Gamertag**: ${response.gamertag}`+
                `\n**Reason**: ${response.reason}`+
                `\n**Proof**: ${response.proof}`+
                `\n**Banned by**: ${response.bannedBy}`+
                `\n**Date**: <t:${(Date.now()/1000).toString().split('.')[0]}:F>`)
                //@ts-ignore
                interaction.editReply({ embeds: [embed]}).then(msg => {setTimeout(() => msg.delete(), 7000)}).catch();
            } catch (err: any) {
                const embed = getTemplate()
                .setDescription(err.response.data)
                //@ts-ignore
                return interaction.editReply({ embeds: [embed]}).then(msg => {setTimeout(() => msg.delete(), 7000)}).catch();
            }

            const id = interaction.message?.embeds[0].description?.split('ID: ')[1].split('\n')[0].trim();
            const acceptedReport = getTemplate().setDescription(`${interaction.user.username} has accepted the report.`);

            if(!id) return // not supposed to be undefined 
            const user = await client.users.fetch(id).catch();
            user.send({ embeds: [ acceptedReport ] }).catch(); // might change msg later
        }

        if(interaction.customId === 'Request_Decline') {
            if(!config.Admins.includes(interaction.user.id) && !config.Staff.includes(interaction.user.id)) return console.log('this user is not allowed to review reports')

            const modal = new Modal()
                .setCustomId('Request_Decline_Modal')
                .setTitle('test')
                .addComponents(
                    new TextInputComponent()
                    .setCustomId("Request_Decline_input")
                    .setStyle('SHORT')
                    .setLabel('Provide Reason for declining report')
                    .setRequired(true)
                );
            
            showModal(modal, {
                client: client,
                interaction: interaction
            })
        }
    }
    if(interaction.isCommand()) {
        if (interaction.commandName === 'db_lookup') CMDMAN.lookUp(interaction)
        if (interaction.commandName === 'db_ban_player') CMDMAN.banPlayer(interaction)
        if (interaction.commandName === 'db_unban_player') CMDMAN.unbanPlayer(interaction)
        if (interaction.commandName === 'db_request_ban') CMDMAN.requestBanPlayer(interaction)
        if (interaction.commandName === 'invite') CMDMAN.invite(interaction)
        if (interaction.commandName === 'info') CMDMAN.info(interaction)

    }
})

client.login(config.botToken)