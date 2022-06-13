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