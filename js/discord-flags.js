/*!
 * discord-flags.js - Part of the discord-flags project
 * https://github.com/lewisakura/discord-flags
 *
 * Copyright (c) 2024-2025 Lewis Akura
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

class DiscordFlags {
    constructor() {
        this.cache = {
            user: null,
            application: null
        };
    }

    async _fetchFlags(type) {
        const url = `https://raw.githubusercontent.com/lewisakura/discord-flags/master/flags/${type}.json`;
        const response = await fetch(url);
        const data = await response.json();
        this.cache[type] = data;
        return data;
    }

    async getFlagsData(type = 'user') {
        if (!this.cache[type]) {
            await this._fetchFlags(type);
        }
        return this.cache[type];
    }

    _checkFlags(flags, flagNumber) {
        let results = [];
        for (let i = 0; i <= 64; i++) {
            const bitwise = 1n << BigInt(i);
            if (flagNumber & bitwise) {
                const flag = Object.entries(flags).find((f) => f[1].shift === i)?.[0] || `UNKNOWN_FLAG_${i}`;
                results.push(flag);
            }
        }
        return results.join(", ") || "NONE";
    }

    async getFlags(number, type = "both") {
        let flagNum, resp = {};
        try {
            flagNum = BigInt(number);
        } catch (e) {
            console.warn(e);
            return "Bad flag number";
        }

        if (type === 'user' || type === 'both') {
            const userFlags = await this.getFlagsData('user');
            resp.user = this._checkFlags(userFlags, flagNum);
        }
        
        if (type === 'application' || type === 'both') {
            const appFlags = await this.getFlagsData('application');
            resp.application = this._checkFlags(appFlags, flagNum);
        }

        return type === "both" ? resp : resp[type];
    }

    async getFlagDetails(type = "both") {
        const result = {};

        if (type === "user" || type === "both") {
            const userFlags = await this.getFlagsData('user');
            result.user = {};
            for (const flag of Object.keys(userFlags)) {
                const shift = userFlags[flag].shift;
                result.user[flag] = {
                    description: userFlags[flag].description,
                    bitshift: shift,
                    value: 1n << BigInt(shift),
                    undocumented: userFlags[flag].undocumented,
                    deprecated: userFlags[flag]?.deprecated ?? false
                };
            }
        }

        if (type === "application" || type === "both") {
            const appFlags = await this.getFlagsData('application');
            result.application = {};
            for (const flag of Object.keys(appFlags)) {
                const shift = appFlags[flag].shift;
                result.application[flag] = {
                    description: appFlags[flag].description,
                    bitshift: shift,
                    value: 1n << BigInt(shift),
                    undocumented: appFlags[flag].undocumented,
                    deprecated: appFlags[flag]?.deprecated ?? false
                };
            }
        }

        return type === "both" ? result : result[type];
    }
}
