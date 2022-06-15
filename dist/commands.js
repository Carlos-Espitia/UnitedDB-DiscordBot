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
exports.CMDMAN = exports.RegisterCommands = void 0;
const index_1 = require("./index");
const discord_js_1 = __importStar(require("discord.js"));
const config_1 = require("./config");
const utils_1 = require("./utils");
const axios_1 = __importDefault(require("axios"));
const registerCommands = [
    {
        name: 'db_lookup',
        description: 'Lookup banned player, provide gamertag or xuid',
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
    },
    {
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
    },
    {
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
    },
    {
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
    },
    {
        name: 'invite',
        description: 'Invite bot to discord'
    },
    {
        name: 'info',
        description: 'DB and bot information'
    },
    {
        name: 'help',
        description: 'Shows all UnitedDB commands'
    },
];
function RegisterCommands() {
    var _a;
    //remove guildid for global cmds
    const guildId = ''; //'984207569386094612'
    const guild = index_1.client.guilds.cache.get(guildId);
    let commands = (guild === null || guild === void 0 ? void 0 : guild.commands) || ((_a = index_1.client.application) === null || _a === void 0 ? void 0 : _a.commands);
    if (!commands)
        return;
    //@ts-ignore
    for (var command of registerCommands)
        commands.create(command);
}
exports.RegisterCommands = RegisterCommands;
/////////////////////////////////////////////////////////////////////////////////////
class commandManager {
    async info(interaction) {
        if (!interaction.member)
            return;
        const loading = (0, utils_1.getTemplate)()
            .setDescription('Fetching banned players...');
        await interaction.reply({ embeds: [loading], ephemeral: false });
        var embed;
        try {
            const bannedPlayers = await (await axios_1.default.get(`${index_1.DB_API}/BannedPlayers`, {
                headers: {
                    "authorization": config_1.config.UnitedDBLoginAdmin
                }
            })).data;
            embed = (0, utils_1.getTemplate)()
                .setDescription(`Banned player count: ${bannedPlayers.length}`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            embed = (0, utils_1.getTemplate)().setDescription(err.response.data);
            return interaction.editReply({ embeds: [embed] });
        }
    }
    async invite(interaction) {
        if (!interaction.member)
            return;
        const inviteMsg = new discord_js_1.MessageEmbed()
            .setTitle('Click Here')
            .setURL('https://discord.com/api/oauth2/authorize?client_id=958167252652421230&permissions=8&scope=bot%20applications.commands')
            .setDescription(`**Invite UnitedDB To Your Discord!**`);
        return await interaction.reply({ embeds: [inviteMsg] });
    }
    async lookUp(interaction) {
        if (!interaction.member)
            return;
        const loading = (0, utils_1.getTemplate)()
            .setDescription('Fetching user...');
        await interaction.reply({ embeds: [loading], ephemeral: true });
        const gamertag = interaction.options.getString('gamertag');
        const xuid = interaction.options.getString('xuid');
        const embed = (0, utils_1.getTemplate)();
        if (!gamertag && !xuid) {
            embed
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        const gamertagORxuid = xuid || gamertag;
        try {
            const playerInfo = await (await axios_1.default.get(`${index_1.DB_API}/BannedPlayers/LookUp/${gamertagORxuid}`)).data;
            embed
                .setDescription(`` +
                `\n**xuid**: ${playerInfo.xuid}` +
                `\n**gamertag**: ${playerInfo.gamertag}` +
                `\n**reason**: ${playerInfo.reason}` +
                `\n**proof**: ${playerInfo.proof}` +
                `\n**Banned by**: ${playerInfo.bannedBy}` +
                `\n**Date**: ${playerInfo.date}`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            embed.setDescription(err.response.data);
            return interaction.editReply({ embeds: [embed] });
        }
    }
    async banPlayer(interaction) {
        if (!interaction.member)
            return;
        const loading = (0, utils_1.getTemplate)()
            .setDescription('Checking for authorization...');
        await interaction.reply({ embeds: [loading], ephemeral: true });
        const gamertag = interaction.options.getString('gamertag');
        const xuid = interaction.options.getString('xuid');
        const reason = interaction.options.getString('reason');
        const proof = interaction.options.getString('proof');
        const embed = (0, utils_1.getTemplate)();
        if (!config_1.config.Admins.includes(interaction.member.user.id) && !config_1.config.Staff.includes(interaction.member.user.id)) {
            embed
                .setDescription(`You do not have permission to ban players!`);
            return interaction.editReply({ embeds: [embed] });
        }
        if (!gamertag && !xuid) {
            embed
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        const gamertagORxuid = xuid || gamertag;
        //auth filter
        if (!config_1.config.Admins.includes(interaction.member.user.id)) {
            try {
                const response = await (await axios_1.default.post(`${index_1.DB_API}/BannedPlayers/Add/${gamertagORxuid}`, {
                    reason: reason,
                    proof: proof,
                    discordUser: `${interaction.member.user.username}#${interaction.member.user.discriminator}`
                }, {
                    headers: {
                        "authorization": config_1.config.UnitedDBLoginStaff
                    }
                })).data;
                embed
                    .setDescription(`` +
                    `\n${response.message}` +
                    `\n**Xuid**: ${response.xuid}` +
                    `\n**Gamertag**: ${response.gamertag}` +
                    `\n**Reason**: ${response.reason}` +
                    `\n**Proof**: ${response.proof}` +
                    `\n**Banned by**: ${response.bannedBy}` +
                    `\n**Date**: <t:${(Date.now() / 1000).toString().split('.')[0]}:F>`);
                return interaction.editReply({ embeds: [embed] });
            }
            catch (err) {
                embed
                    .setDescription(err.response.data);
                return interaction.editReply({ embeds: [embed] });
            }
        }
        try {
            const response = await (await axios_1.default.post(`${index_1.DB_API}/BannedPlayers/Add/${gamertagORxuid}`, {
                reason: reason,
                proof: proof,
                discordUser: `${interaction.member.user.username}#${interaction.member.user.discriminator}`
            }, {
                headers: {
                    "authorization": config_1.config.UnitedDBLoginAdmin
                }
            })).data;
            embed
                .setDescription(`` +
                `\n${response.message}` +
                `\n**Xuid**: ${response.xuid}` +
                `\n**Gamertag**: ${response.gamertag}` +
                `\n**Reason**: ${response.reason}` +
                `\n**Proof**: ${response.proof}` +
                `\n**Banned by**: ${response.bannedBy}` +
                `\n**Date**: <t:${(Date.now() / 1000).toString().split('.')[0]}:F>`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            embed
                .setDescription(err.response.data);
            return interaction.editReply({ embeds: [embed] });
        }
    }
    async unbanPlayer(interaction) {
        if (!interaction.member)
            return;
        const loading = (0, utils_1.getTemplate)()
            .setDescription('Checking for authorization...');
        await interaction.reply({ embeds: [loading], ephemeral: true });
        const gamertag = interaction.options.getString('gamertag');
        const xuid = interaction.options.getString('xuid');
        const embed = (0, utils_1.getTemplate)();
        if (!config_1.config.Admins.includes(interaction.member.user.id)) {
            embed
                .setDescription(`You do not have permission to unban players!`);
            return interaction.editReply({ embeds: [embed] });
        }
        if (!gamertag && !xuid) {
            embed
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        const gamertagORxuid = xuid || gamertag;
        try {
            const response = await (await axios_1.default.delete(`${index_1.DB_API}/BannedPlayers/Remove/${gamertagORxuid}`, {
                headers: {
                    "authorization": config_1.config.UnitedDBLoginAdmin
                }
            })).data;
            embed
                .setDescription(`` +
                `\n${response.message}` +
                `\n**Xuid**: ${response.xuid}` +
                `\n**Gamertag**: ${response.gamertag}`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            embed
                .setDescription(err.response.data);
            return interaction.editReply({ embeds: [embed] });
        }
    }
    async requestBanPlayer(interaction) {
        var _a;
        //interaction.member.user.username
        if (!interaction.member)
            return;
        const loading = (0, utils_1.getTemplate)()
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
            embed = (0, utils_1.getTemplate)()
                .setDescription(`You must provide a gamertag or xuid!`);
            return interaction.editReply({ embeds: [embed] });
        }
        const gamertagORxuid = xuid || gamertag;
        try {
            await (await axios_1.default.get(`${index_1.DB_API}/BannedPlayers/LookUp/${gamertagORxuid}`)).data; //check if player is in db
            embed = (0, utils_1.getTemplate)().setDescription(`Player is already databased banned.`);
            return interaction.editReply({ embeds: [embed] });
        }
        catch (err) { } // if catch then good
        const xbl = await index_1.auth.getXboxToken();
        // validate if gamertag or xuid exist
        if (xuid) {
            if (!await (0, utils_1.validateXuid)(xbl, xuid)) {
                embed = (0, utils_1.getTemplate)()
                    .setDescription(`Not a valid xuid!`);
                return interaction.editReply({ embeds: [embed] });
            }
            gamertag = await (0, utils_1.getGamertagByXuid)(xbl, xuid);
        }
        else {
            if (gamertag == null)
                return; //shouldn't be nulled
            if (!await (0, utils_1.validateGamertag)(xbl, gamertag)) {
                embed = (0, utils_1.getTemplate)()
                    .setDescription(`Not a valid gamertag!`);
                return interaction.editReply({ embeds: [embed] });
            }
            xuid = await (0, utils_1.getXuidByGamertag)(xbl, gamertag);
        }
        if (!(0, utils_1.isValidUrl)(proof)) {
            embed = (0, utils_1.getTemplate)()
                .setDescription(`You did not provide a valid URL for proof!`);
            return interaction.editReply({ embeds: [embed] });
        }
        //send to private channel for admins to look over the report
        const reportEmbed = new discord_js_1.MessageEmbed().setAuthor('Ban Player Request', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96')
            .setDescription(`` +
            `\n\n**Xuid**: ${xuid}` +
            `\n**Gamertag**: ${gamertag}` +
            `\n**Reason**: ${reason}` +
            `\n**Proof**: ${proof}` +
            `\n**Date**: <t:${(Date.now() / 1000).toString().split('.')[0]}:F>` +
            `\n\n**From**` +
            `\nUsername: ${interaction.member.user.username}#${interaction.member.user.discriminator}` +
            `\nID: ${interaction.member.user.id}` +
            `\nServer: ${(_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.name}`);
        const row = new discord_js_1.MessageActionRow()
            .addComponents(new discord_js_1.MessageButton()
            .setCustomId('Request_Accept')
            .setLabel('Accept')
            .setStyle('SUCCESS'), new discord_js_1.MessageButton()
            .setCustomId('Request_Decline')
            .setLabel('Decline')
            .setStyle('DANGER')
        //add option why it was declined 
        );
        index_1.client.channels.cache.get(config_1.config.LogChannel).send({ embeds: [reportEmbed], components: [row] });
        embed = (0, utils_1.getTemplate)()
            .setDescription(`` +
            `\nSuccesfully reported player!` +
            `\n**Xuid**: ${xuid}` +
            `\n**Gamertag**: ${gamertag}` +
            `\n**Reason**: ${reason}` +
            `\n**Proof**: ${proof}` +
            `\n**Date**: <t:${(Date.now() / 1000).toString().split('.')[0]}:F>`);
        return interaction.editReply({ embeds: [embed] });
    }
    async help(interaction) {
        if (!interaction.member)
            return;
        var cmdlist = ``;
        for (var command of registerCommands) {
            cmdlist += `**/${command.name}**\n${command.description}\n`;
        }
        const embed = (0, utils_1.getTemplate)()
            .setDescription(cmdlist);
        await interaction.reply({ embeds: [embed], ephemeral: false });
    }
}
exports.CMDMAN = new commandManager();
