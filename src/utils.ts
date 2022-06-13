import * as XboxLiveAPI from '@xboxreplay/xboxlive-api';
import { MessageEmbed } from 'discord.js';

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
    if(!validGamertag) return false
    if(validGamertag) return true
}

export function getTemplate(): MessageEmbed {
    return new MessageEmbed().setAuthor('United Realms', 'https://cdn.discordapp.com/icons/958156910480216174/ad9d2b5e3aca1f23fa830cab9ff4048e.webp?size=96')
}

export function isValidUrl(url: string) {
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return matchpattern.test(url);
}
