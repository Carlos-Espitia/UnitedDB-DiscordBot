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
exports.isValidUrl = exports.validateGamertag = exports.validateXuid = exports.getGamertagByXuid = exports.getXuidByGamertag = exports.auth = void 0;
const discord_js_1 = __importStar(require("discord.js"));
const axios_1 = __importDefault(require("axios"));
const client = new discord_js_1.default.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_MESSAGES] });
const config_1 = require("./config");
const XboxLiveAPI = __importStar(require("@xboxreplay/xboxlive-api"));
const prismarine_auth_1 = require("prismarine-auth");
exports.auth = new prismarine_auth_1.Authflow(`QSMX`, `./auth`, {});
/// xbox live api stuff 
async function getXuidByGamertag(xbl, gamertag) {
    try {
        return parseInt(await XboxLiveAPI.getPlayerXUID(gamertag, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken
        }));
    }
    catch (_a) { }
}
exports.getXuidByGamertag = getXuidByGamertag;
async function getGamertagByXuid(xbl, xuid) {
    //xuid must be validated first 
    try {
        var data = await XboxLiveAPI.getPlayerSettings(xuid, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken
        }, ['Gamertag']);
        return data[0].value;
    }
    catch (err) {
        console.log(err);
    }
}
exports.getGamertagByXuid = getGamertagByXuid;
async function validateXuid(xbl, xuid) {
    var xboxData;
    try {
        xboxData = await XboxLiveAPI.getPlayerSettings(xuid, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken
        }, ['Gamertag']);
    }
    catch (err) {
        console.log(err);
    }
    if (!xboxData)
        return false;
    if (xboxData)
        return true;
}
exports.validateXuid = validateXuid;
async function validateGamertag(xbl, gamertag) {
    var validGamertag;
    try {
        validGamertag = await XboxLiveAPI.getPlayerXUID(gamertag, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken
        });
    }
    catch (_a) { }
    console.log(validGamertag);
    if (!validGamertag)
        return false;
    if (validGamertag)
        return true;
}
exports.validateGamertag = validateGamertag;
///
client.once('ready', () => {
    var _a;
    console.log('bot is online!');
    //remove guildid for global cmds
    const guildId = '984207569386094612';
    const guild = client.guilds.cache.get(guildId);
    let commands;
    if (guild) {
        commands = guild.commands;
    }
    else {
        commands = (_a = client.application) === null || _a === void 0 ? void 0 : _a.commands;
    }
    commands === null || commands === void 0 ? void 0 : commands.create({
        name: 'db_lookup',
        description: 'Lookup banned player, provide gamertag or xuid.',
        options: [
            {
                name: 'gamertag',
                description: 'Provide a gamertag',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'xuid',
                description: 'Provide a xuid',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });
    commands === null || commands === void 0 ? void 0 : commands.create({
        name: 'db_ban_player',
        description: 'Ban player',
        options: [
            {
                name: 'gamertag',
                description: 'Provide a gamertag',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'xuid',
                description: 'Provide a xuid',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'reason',
                description: 'Provide a reason',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'proof',
                description: 'Provide proof',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });
    commands === null || commands === void 0 ? void 0 : commands.create({
        name: 'db_unban_player',
        description: 'Unban player',
        options: [
            {
                name: 'gamertag',
                description: 'Provide a gamertag',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'xuid',
                description: 'Provide a xuid',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    });
    commands === null || commands === void 0 ? void 0 : commands.create({
        name: 'db_request_ban',
        description: 'Request to ban a player',
        options: [
            {
                name: 'reason',
                description: 'Provide a reason',
                required: true,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'proof',
                description: 'Provide proof',
                required: true,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'gamertag',
                description: 'Provide a gamertag',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
            {
                name: 'xuid',
                description: 'Provide a xuid',
                required: false,
                type: discord_js_1.default.Constants.ApplicationCommandOptionTypes.STRING
            },
        ]
    });
});
const DB_API = 'http://localhost:5000';
// TYPES ////////////////////////////
class BannedPlayerInfo {
}
class BanningPlayerPost {
}
class UnbanningPlayerDelete {
}
// TYPES ////////////////////////////
// CHECKS //////////////////////////
function isValidUrl(url) {
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return matchpattern.test(url);
}
exports.isValidUrl = isValidUrl;
// CHECKS //////////////////////////
class commandManager {
    async lookUp(interaction) {
        if (!interaction.member)
            return;
        const loading = getTemplate()
            .setDescription('Fetching user...');
        await interaction.reply({ embeds: [loading], ephemeral: true });
        var gamertag = interaction.options.getString('gamertag');
        var xuid = interaction.options.getString('xuid');
        var embed;
        if (!gamertag && !xuid) {
            embed = getTemplate()
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        var gamertagORxuid;
        if (xuid) {
            gamertagORxuid = xuid;
        }
        else {
            gamertagORxuid = gamertag;
        }
        try {
            const playerInfo = await (await axios_1.default.get(`${DB_API}/BannedPlayers/LookUp/${gamertagORxuid}`)).data;
            embed = getTemplate()
                .setDescription(`` +
                `\n**xuid**: ${playerInfo.xuid}` +
                `\n**gamertag**: ${playerInfo.gamertag}` +
                `\n**reason**: ${playerInfo.reason}` +
                `\n**proof**: ${playerInfo.proof}`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            embed = getTemplate().setDescription(err.response.data);
            return interaction.editReply({ embeds: [embed] });
        }
    }
    async banPlayer(interaction) {
        if (!interaction.member)
            return;
        const loading = getTemplate()
            .setDescription('Checking for authorization...');
        await interaction.reply({ embeds: [loading], ephemeral: true });
        var gamertag = interaction.options.getString('gamertag');
        var xuid = interaction.options.getString('xuid');
        var reason = interaction.options.getString('reason');
        var proof = interaction.options.getString('proof');
        var embed;
        if (!config_1.config.Admins.includes(interaction.member.user.id) && !config_1.config.Authorities.includes(interaction.member.user.id)) {
            embed = getTemplate()
                .setDescription(`You do not have permission to unban players!`);
            return interaction.editReply({ embeds: [embed] });
        }
        if (!gamertag && !xuid) {
            embed = getTemplate()
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        var gamertagORxuid;
        if (xuid) {
            gamertagORxuid = xuid;
        }
        else {
            gamertagORxuid = gamertag;
        }
        //auth filter
        if (!config_1.config.Admins.includes(interaction.member.user.id)) {
            try {
                const response = await (await axios_1.default.post(`${DB_API}/BannedPlayers/Add/${gamertagORxuid}`, {
                    reason: reason,
                    proof: proof
                }, {
                    headers: {
                        "authorization": config_1.config.AuthKey
                    }
                })).data;
                embed = getTemplate()
                    .setDescription(`` +
                    `\n${response.message}` +
                    `\n**Xuid**: ${response.xuid}` +
                    `\n**Gamertag**: ${response.gamertag}` +
                    `\n**Reason**: ${response.reason}` +
                    `\n**Proof**: ${response.proof}` +
                    `\n**Date**: ${response.date}`);
                return interaction.editReply({ embeds: [embed] });
            }
            catch (err) {
                embed = getTemplate()
                    .setDescription(err.response.data);
                return interaction.editReply({ embeds: [embed] });
            }
        }
        try {
            const response = await (await axios_1.default.post(`${DB_API}/BannedPlayers/Add/${gamertagORxuid}`, undefined, {
                headers: {
                    "authorization": config_1.config.AdminKey
                }
            })).data;
            embed = getTemplate()
                .setDescription(`` +
                `\n${response.message}` +
                `\n**Xuid**: ${response.xuid}` +
                `\n**Gamertag**: ${response.gamertag}` +
                `\n**Reason**: ${response.reason}` +
                `\n**Proof**: ${response.proof}` +
                `\n**Date**: ${response.date}`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            embed = getTemplate()
                .setDescription(err.response.data);
            return interaction.editReply({ embeds: [embed] });
        }
    }
    async unbanPlayer(interaction) {
        if (!interaction.member)
            return;
        const loading = getTemplate()
            .setDescription('Checking for authorization...');
        await interaction.reply({ embeds: [loading], ephemeral: true });
        var gamertag = interaction.options.getString('gamertag');
        var xuid = interaction.options.getString('xuid');
        var embed;
        if (!config_1.config.Admins.includes(interaction.member.user.id) && !config_1.config.Authorities.includes(interaction.member.user.id)) {
            embed = getTemplate()
                .setDescription(`You do not have permission to unban players!`);
            return interaction.editReply({ embeds: [embed] });
        }
        if (!gamertag && !xuid) {
            embed = getTemplate()
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        var gamertagORxuid;
        if (xuid) {
            gamertagORxuid = xuid;
        }
        else {
            gamertagORxuid = gamertag;
        }
        try {
            const response = await (await axios_1.default.delete(`${DB_API}/BannedPlayers/Remove/${gamertagORxuid}`, {
                headers: {
                    "authorization": config_1.config.AuthKey
                }
            })).data;
            embed = getTemplate()
                .setDescription(`` +
                `\n${response.message}` +
                `\n**Xuid**: ${response.xuid}` +
                `\n**Gamertag**: ${response.gamertag}`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            embed = getTemplate()
                .setDescription(err.response.data);
            return interaction.editReply({ embeds: [embed] });
        }
    }
    async requestBanPlayer(interaction) {
        var _a;
        //interaction.member.user.username
        if (!interaction.member)
            return;
        const loading = getTemplate()
            .setDescription('Requesting player ban...');
        await interaction.reply({ embeds: [loading], ephemeral: true });
        var gamertag = interaction.options.getString('gamertag');
        var xuid = interaction.options.getString('xuid');
        var reason = interaction.options.getString('reason');
        var proof = interaction.options.getString('proof');
        if (!proof)
            return; // it shouldn't be null since it's required
        var embed;
        if (!gamertag && !xuid) {
            embed = getTemplate()
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        var gamertagORxuid;
        if (xuid) {
            gamertagORxuid = xuid;
        }
        else {
            gamertagORxuid = gamertag;
        }
        try {
            await (await axios_1.default.get(`${DB_API}/BannedPlayers/LookUp/${gamertagORxuid}`)).data; //check if player is in db
            embed = getTemplate().setDescription(`Player is already databased banned.`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) { } // if catch then good
        const xbl = await exports.auth.getXboxToken();
        // validate if gamertag or xuid exist
        if (xuid) {
            if (!await validateXuid(xbl, xuid)) {
                embed = getTemplate()
                    .setDescription(`Not a valid xuid!`);
                return interaction.editReply({ embeds: [embed] });
            }
            gamertag = await getGamertagByXuid(xbl, xuid);
        }
        else {
            if (gamertag == null)
                return; //shouldn't be nulled
            if (!await validateGamertag(xbl, gamertag)) {
                embed = getTemplate()
                    .setDescription(`Not a valid gamertag!`);
                return interaction.editReply({ embeds: [embed] });
            }
            xuid = await getXuidByGamertag(xbl, gamertag);
        }
        if (!isValidUrl(proof)) {
            embed = getTemplate()
                .setDescription(`You did not provide a valid URL for proof!`);
            return interaction.editReply({ embeds: [embed] });
        }
        //send to private channel for admins to look over the report
        interaction.member.user.username;
        const reportEmbed = new discord_js_1.MessageEmbed().setAuthor('Ban Player Request', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96')
            .setDescription(`` +
            `\n\n**Xuid**: ${xuid}` +
            `\n**Gamertag**: ${gamertag}` +
            `\n**Reason**: ${reason}` +
            `\n**Proof**: ${proof}` +
            `\n**Date**: ${new Date().toLocaleString()}` +
            `\n\n**From**` +
            `\nUsername: ${interaction.member.user.username}` +
            `\nID: ${interaction.member.user.id}` +
            `\nServer: ${(_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.name}`);
        client.channels.cache.get(config_1.config.LogChannel).send({ embeds: [reportEmbed] });
        embed = getTemplate()
            .setDescription(`` +
            `\nSuccesfully reported player!` +
            `\n**Xuid**: ${xuid}` +
            `\n**Gamertag**: ${gamertag}` +
            `\n**Reason**: ${reason}` +
            `\n**Proof**: ${proof}` +
            `\n**Date**: ${new Date().toLocaleString()}`);
        return interaction.editReply({ embeds: [embed] });
    }
}
const CMDMAN = new commandManager();
//////////////////////////////////////
function getTemplate() {
    return new discord_js_1.MessageEmbed().setAuthor('United Realms', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96');
}
//////////////////////////////////////
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand())
        return;
    if (interaction.commandName === 'db_lookup')
        CMDMAN.lookUp(interaction);
    if (interaction.commandName === 'db_ban_player')
        CMDMAN.banPlayer(interaction);
    if (interaction.commandName === 'db_unban_player')
        CMDMAN.unbanPlayer(interaction);
    if (interaction.commandName === 'db_request_ban')
        CMDMAN.requestBanPlayer(interaction);
    // if (interaction.commandName === 'db_help') CMDMAN.lookUp(interaction)
});
client.login('OTg0MjA2MzU2MzM0NjU3NjQ2.GlbCPM.4rud0IjRCCmx0S_jSfSFQp8e4hrfCTxH8zhIK8');
