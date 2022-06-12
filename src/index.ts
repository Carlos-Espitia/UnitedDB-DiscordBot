import Discord, {Intents, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from "discord.js";
export const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
import { Modal, TextInputComponent, showModal } from "discord-modals";
import { config } from './config'
import { Authflow } from 'prismarine-auth';
import { CMDMAN, RegisterCommands } from "./commands";
import { getTemplate } from "./utils";
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
    date: string | undefined
}
export class BanningPlayerPost {
    message: string | undefined
    xuid: number | undefined
    gamertag: string | undefined
    reason: string | undefined
    proof: string | undefined
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
    if (interaction.isButton()) {
        if(interaction.customId === 'Request_Accept') {
            if(!config.Admins.includes(interaction.user.id) && !config.Authorities.includes(interaction.user.id)) return console.log('this user is not allowed to review reports')

            //@ts-ignore // .delete() is not included in the discord js types
            await interaction.message.delete()

            const acceptedReport = getTemplate().setDescription(`${interaction.user.username} has accepted the report.`);
    
            //after msg sent it delete in 3 sec
            ( client.channels.cache.get(config.LogChannel) as TextChannel ).send({embeds: [acceptedReport]}).then(msg => {setTimeout(() => msg.delete(), 5000)}).catch()
        }
        if(interaction.customId === 'Request_Decline') {
            if(!config.Admins.includes(interaction.user.id) && !config.Authorities.includes(interaction.user.id)) return console.log('this user is not allowed to review reports')

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
        
            console.log(interaction.user) //find who clicked on the buttons 
            //use api to add to db
        }
    }
    if(interaction.isCommand()) {
        if (interaction.commandName === 'db_lookup') CMDMAN.lookUp(interaction)
        if (interaction.commandName === 'db_ban_player') CMDMAN.banPlayer(interaction)
        if (interaction.commandName === 'db_unban_player') CMDMAN.unbanPlayer(interaction)
        if (interaction.commandName === 'db_request_ban') CMDMAN.requestBanPlayer(interaction)
        // if (interaction.commandName === 'db_help') CMDMAN.lookUp(interaction)
    }
})


// not working, ill fix later
client.on('modalSubmit', async (modal) => {
    console.log('worked2?')
    if(modal.customId === 'Request_Decline_Modal') {
        console.log('worked?')
        //@ts-ignore type not included
        const decline_response = modal.getTextInputValue('Request_Decline_input')
        modal.reply(`reason: ${decline_response} | reply modal test`);
    }  
});

client.login('OTg0MjA2MzU2MzM0NjU3NjQ2.GlbCPM.4rud0IjRCCmx0S_jSfSFQp8e4hrfCTxH8zhIK8')