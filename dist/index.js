"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnbanningPlayerDelete = exports.BanningPlayerPost = exports.BannedPlayerInfo = exports.DB_API = exports.auth = exports.client = void 0;
const discord_js_1 = __importStar(require("discord.js"));
exports.client = new discord_js_1.default.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
const discord_modals_1 = require("discord-modals");
const config_1 = require("./config");
const prismarine_auth_1 = require("prismarine-auth");
const commands_1 = require("./commands");
const utils_1 = require("./utils");
exports.auth = new prismarine_auth_1.Authflow(`QSMX`, `./auth`, {});
exports.DB_API = 'http://localhost:5000';
exports.client.once('ready', () => {
    console.log('bot is online!');
    (0, commands_1.RegisterCommands)();
});
// TYPES ////////////////////////////
class BannedPlayerInfo {
}
exports.BannedPlayerInfo = BannedPlayerInfo;
class BanningPlayerPost {
}
exports.BanningPlayerPost = BanningPlayerPost;
class UnbanningPlayerDelete {
}
exports.UnbanningPlayerDelete = UnbanningPlayerDelete;
// TYPES ////////////////////////////
class buttonManager {
}
const BMAN = new buttonManager();
//////////////////////////////////////
//////////////////////////////////////
exports.client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'Request_Decline_Modal') {
            const reason_Input = interaction.components[0].components[0].value;
            //@ts-ignore // .delete() is not included in the discord js types
            interaction.message.delete();
            const declinedReport = (0, utils_1.getTemplate)().setDescription(`${interaction.user.username} has declined the report. Reason: ${reason_Input}`);
            //notify reporter
            exports.client.channels.cache.get(config_1.config.LogChannel).send({ embeds: [declinedReport] }).then(msg => { setTimeout(() => msg.delete(), 7000); }).catch();
        }
    }
    if (interaction.isButton()) {
        if (interaction.customId === 'Request_Accept') {
            if (!config_1.config.Admins.includes(interaction.user.id) && !config_1.config.Authorities.includes(interaction.user.id))
                return console.log('this user is not allowed to review reports');
            //@ts-ignore // .delete() is not included in the discord js types
            await interaction.message.delete();
            const acceptedReport = (0, utils_1.getTemplate)().setDescription(`${interaction.user.username} has accepted the report.`);
            //notify reporter
            console.log(interaction.message);
            exports.client.channels.cache.get(config_1.config.LogChannel).send({ embeds: [acceptedReport] }).then(msg => { setTimeout(() => msg.delete(), 7000); }).catch();
        }
        if (interaction.customId === 'Request_Decline') {
            if (!config_1.config.Admins.includes(interaction.user.id) && !config_1.config.Authorities.includes(interaction.user.id))
                return console.log('this user is not allowed to review reports');
            const modal = new discord_modals_1.Modal()
                .setCustomId('Request_Decline_Modal')
                .setTitle('test')
                .addComponents(new discord_modals_1.TextInputComponent()
                .setCustomId("Request_Decline_input")
                .setStyle('SHORT')
                .setLabel('Provide Reason for declining report')
                .setRequired(true));
            (0, discord_modals_1.showModal)(modal, {
                client: exports.client,
                interaction: interaction
            });
        }
    }
    if (interaction.isCommand()) {
        if (interaction.commandName === 'db_lookup')
            commands_1.CMDMAN.lookUp(interaction);
        if (interaction.commandName === 'db_ban_player')
            commands_1.CMDMAN.banPlayer(interaction);
        if (interaction.commandName === 'db_unban_player')
            commands_1.CMDMAN.unbanPlayer(interaction);
        if (interaction.commandName === 'db_request_ban')
            commands_1.CMDMAN.requestBanPlayer(interaction);
        // if (interaction.commandName === 'db_help') CMDMAN.lookUp(interaction)
    }
});
exports.client.login('OTg0MjA2MzU2MzM0NjU3NjQ2.GlbCPM.4rud0IjRCCmx0S_jSfSFQp8e4hrfCTxH8zhIK8');
