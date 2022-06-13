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
exports.isValidUrl = exports.getTemplate = exports.validateGamertag = exports.validateXuid = exports.getGamertagByXuid = exports.getXuidByGamertag = void 0;
const XboxLiveAPI = __importStar(require("@xboxreplay/xboxlive-api"));
const discord_js_1 = require("discord.js");
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
    if (!validGamertag)
        return false;
    if (validGamertag)
        return true;
}
exports.validateGamertag = validateGamertag;
function getTemplate() {
    return new discord_js_1.MessageEmbed().setAuthor('UnitedDB', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96');
}
exports.getTemplate = getTemplate;
function isValidUrl(url) {
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return matchpattern.test(url);
}
exports.isValidUrl = isValidUrl;
