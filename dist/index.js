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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_API = exports.auth = exports.client = void 0;
const discord_js_1 = __importStar(require("discord.js"));
exports.client = new discord_js_1.default.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES, discord_js_1.Intents.FLAGS.DIRECT_MESSAGES] });
const discord_modals_1 = require("discord-modals");
const config_1 = require("./config");
const prismarine_auth_1 = require("prismarine-auth");
const commands_1 = require("./commands");
const utils_1 = require("./utils");
const axios_1 = __importDefault(require("axios"));
exports.auth = new prismarine_auth_1.Authflow(`QSMX`, `./auth`, {});
exports.DB_API = 'http://localhost:5000';
// might add a looping status later 
const status = `/help`;
var place = -1;
exports.client.once('ready', () => {
    var _a;
    console.log('bot is online!');
    (0, commands_1.RegisterCommands)();
    (_a = exports.client.user) === null || _a === void 0 ? void 0 : _a.setActivity(`/help`, { type: `WATCHING` });
});
exports.client.on('interactionCreate', async (interaction) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'Request_Decline_Modal') {
            var reason_Input = interaction.components[0].components[0].value;
            //@ts-ignore // .delete() is not included in the discord js types
            try {
                interaction.message.delete();
            }
            catch (_l) { }
            //notify reporter
            var id = (_b = (_a = interaction.message) === null || _a === void 0 ? void 0 : _a.embeds[0].description) === null || _b === void 0 ? void 0 : _b.split('ID: ')[1].split('\n')[0].trim();
            var declinedReport = (0, utils_1.getTemplate)()
                .setDescription(`${interaction.user.username}#${interaction.user.discriminator} has declined the report. Reason: ${reason_Input}`);
            //@ts-ignore // .delete() is not included in the discord js types
            // interaction.reply({ embeds: [declinedReport]}).then(msg => {setTimeout(() => msg.delete(), 7000)}).catch();
            exports.client.channels.cache.get(config_1.config.LogChannel).send({ embeds: [declinedReport] }).then(msg => { setTimeout(() => msg.delete(), 7000); }).catch();
            if (!id)
                return; // not supposed to be undefined 
            const user = await exports.client.users.fetch(id).catch();
            user.send({ embeds: [declinedReport] }).catch(); // might change msg later
        }
    }
    if (interaction.isButton()) {
        if (interaction.customId === 'Request_Accept') {
            if (!config_1.config.Admins.includes(interaction.user.id) && !config_1.config.Staff.includes(interaction.user.id))
                return console.log('this user is not allowed to review reports');
            //@ts-ignore // .delete() is not included in the discord js types
            try {
                interaction.message.delete();
            }
            catch (_m) { }
            var xuid = (_d = (_c = interaction.message) === null || _c === void 0 ? void 0 : _c.embeds[0].description) === null || _d === void 0 ? void 0 : _d.split('**Xuid**: ')[1].split('\n')[0].trim();
            var reason = (_f = (_e = interaction.message) === null || _e === void 0 ? void 0 : _e.embeds[0].description) === null || _f === void 0 ? void 0 : _f.split('**Reason**: ')[1].split('\n')[0].trim();
            var proof = (_h = (_g = interaction.message) === null || _g === void 0 ? void 0 : _g.embeds[0].description) === null || _h === void 0 ? void 0 : _h.split('**Proof**: ')[1].split('\n')[0].trim();
            if (!interaction.member)
                return; // not supposed to be undefined 
            var loading = (0, utils_1.getTemplate)()
                .setDescription('Checking for authorization...');
            await interaction.reply({ embeds: [loading] });
            try {
                const response = await (await axios_1.default.post(`${exports.DB_API}/BannedPlayers/Add/${xuid}`, {
                    reason: reason,
                    proof: proof,
                    discordUser: `${interaction.member.user.username}#${interaction.member.user.discriminator}`
                }, {
                    headers: {
                        "authorization": config_1.config.UnitedDBLoginStaff
                    }
                })).data;
                const embed = (0, utils_1.getTemplate)()
                    .setDescription(`` +
                    `\n${response.message}` +
                    `\n**Xuid**: ${response.xuid}` +
                    `\n**Gamertag**: ${response.gamertag}` +
                    `\n**Reason**: ${response.reason}` +
                    `\n**Proof**: ${response.proof}` +
                    `\n**Banned by**: ${response.bannedBy}` +
                    `\n**Date**: <t:${(Date.now() / 1000).toString().split('.')[0]}:F>`);
                interaction.editReply({ embeds: [embed] }).then(msg => {
                    //@ts-ignore
                    setTimeout(() => msg.delete(), 7000);
                }).catch();
            }
            catch (err) {
                const embed = (0, utils_1.getTemplate)()
                    .setDescription(err.response.data);
                return interaction.editReply({ embeds: [embed] }).then(msg => {
                    //@ts-ignore
                    setTimeout(() => msg.delete(), 7000);
                }).catch();
            }
            const id = (_k = (_j = interaction.message) === null || _j === void 0 ? void 0 : _j.embeds[0].description) === null || _k === void 0 ? void 0 : _k.split('ID: ')[1].split('\n')[0].trim();
            const acceptedReport = (0, utils_1.getTemplate)()
                .setDescription(`${interaction.user.username}#${interaction.user.discriminator} has accepted the report.`);
            if (!id)
                return; // not supposed to be undefined 
            const user = await exports.client.users.fetch(id).catch();
            user.send({ embeds: [acceptedReport] }).catch(); // might change msg later
        }
        if (interaction.customId === 'Request_Decline') {
            if (!config_1.config.Admins.includes(interaction.user.id) && !config_1.config.Staff.includes(interaction.user.id))
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
        if (interaction.commandName === 'invite')
            commands_1.CMDMAN.invite(interaction);
        if (interaction.commandName === 'info')
            commands_1.CMDMAN.info(interaction);
        if (interaction.commandName === 'help')
            commands_1.CMDMAN.help(interaction);
    }
});
exports.client.login(config_1.config.botToken);
