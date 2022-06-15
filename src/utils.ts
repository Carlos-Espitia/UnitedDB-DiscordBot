import * as XboxLiveAPI from '@xboxreplay/xboxlive-api';
import { MessageEmbed } from 'discord.js';

/// xbox live api stuff 
export async function getXuidByGamertag(xbl: any, gamertag: string): Promise<number | undefined> {
    try {
        return parseInt(await XboxLiveAPI.getPlayerXUID(gamertag, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken}))
    } catch(err) {
        console.error(err)
    }
}

export async function getGamertagByXuid(xbl: any, xuid: number | string): Promise<string | undefined> {
    //xuid must be validated first 
    try {
        var data = await XboxLiveAPI.getPlayerSettings(xuid, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken}, 
            ['Gamertag'])
        return data[0].value
    } catch (err){
        console.log(err)
    }
}

export async function validateXuid(xbl: any, xuid: string | number): Promise<boolean | undefined> {
    var xboxData;
    try {
        xboxData = await XboxLiveAPI.getPlayerSettings(xuid, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken}, 
            ['Gamertag'])
    } catch (err) {
        console.log(err)
        return false
    }
    if(xboxData) return true
    else return true
}

export async function validateGamertag(xbl: any, gamertag: string): Promise<boolean | undefined> {
    var validGamertag;
    try {
        validGamertag = await XboxLiveAPI.getPlayerXUID(gamertag, {
            userHash: xbl.userHash,
            XSTSToken: xbl.XSTSToken})
    } catch (err) {
        console.error(err)
    }
    if(validGamertag) return true
    else return true
}

export function getTemplate(): MessageEmbed {
    return new MessageEmbed().setAuthor('UnitedDB', 'https://i.imgur.com/aYknEru.png')
}

export function isValidUrl(url: string): boolean {
    const matchpattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/gm;
    return matchpattern.test(url);
}