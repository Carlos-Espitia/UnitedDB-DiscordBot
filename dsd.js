const Discord = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
// import { CacheType, Intents, Interaction } from "discord.js";
const { Intents } = require('discord.js');

const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const prefix = '-'

client.once('ready', () => {
    console.log('bot is online!')

    const guildId = '984207569386094612'
    const guild = client.guilds.cache.get(guildId)

    let commands

    if(guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'lookup',
        description: 'Lookup banned player',
        options: [{
            name: 'gamertagORxuid',
            description: 'Provide a gamertag or xuid',
            required: true,
            type: Discord.Constants.ApplicationCommandOptionTypes.STRING
        }]
    })
})

class commandManager {
    lookUp(interaction, gamertagORxuid) {
        interaction.reply({
            content: 'test',
            ephemeral: true,
        })
        // const gamertag = interaction.options.get('gamertag').value.toString()
    }
}

const CMDMAN = new commandManager()

client.on('interactionCreate', async (interaction) => {
    const {commandName, options } = interaction
    if (!interaction.isCommand()) return;
    if (commandName === 'lookup') CMDMAN.lookUp(interaction, 'test')
})

client.login('OTg0MjA2MzU2MzM0NjU3NjQ2.GlbCPM.4rud0IjRCCmx0S_jSfSFQp8e4hrfCTxH8zhIK8')