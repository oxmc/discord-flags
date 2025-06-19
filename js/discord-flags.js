/*!
 * discord-flags.js - Part of the discord-flags project
 * https://github.com/lewisakura/discord-flags
 *
 * Copyright (c) 2024-2025 Lewis Akura
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(async function () {
    const userFlagsJson = await fetch("https://raw.githubusercontent.com/lewisakura/discord-flags/master/flags/user.json").then(r => r.json());
    const applicationFlagsJson = await fetch("https://raw.githubusercontent.com/lewisakura/discord-flags/master/flags/application.json").then(r => r.json());
    
    window.DiscordFlags = {
        flags: { userFlags: userFlagsJson, applicationFlags: applicationFlagsJson },
        
        _checkFlags: function (flags, flagNumber) {
            let results = [];
            for (let i = 0; i <= 64; i++) {
                const bitwise = 1n << BigInt(i);
                if (flagNumber & bitwise) {
                    const flag = Object.entries(flags).find((f) => f[1].shift === i)?.[0] || `UNKNOWN_FLAG_${i}`;
                    results.push(flag);
                }
            }
            return results.join(", ") || "NONE";
        },
        
        getFlags: function (number, type = "both") {
            let flagNum, resp = {};
            try {
                flagNum = BigInt(number);
            } catch (e) {
                console.warn(e);
                return "Bad flag number";
            }
            resp.user = this._checkFlags(this.flags.userFlags, flagNum);
            resp.application = this._checkFlags(this.flags.applicationFlags, flagNum);
            switch (type) {
                case "user":
                    return resp.user;
                case "application":
                    return resp.application;
                case "both":
                default:
                    return resp;
            }
        },
        
        getFlagDetails: function(type = "both") {
            const result = {};
            
            if (type === "user" || type === "both") {
                result.user = {};
                for (const flag of Object.keys(this.flags.userFlags)) {
                    const shift = this.flags.userFlags[flag].shift;
                    result.user[flag] = {
                        description: this.flags.userFlags[flag].description,
                        bitshift: shift,
                        value: 1n << BigInt(shift),
                        undocumented: this.flags.userFlags[flag].undocumented,
                        deprecated: this.flags.userFlags[flag]?.deprecated ?? false
                    };
                }
            }
            
            if (type === "application" || type === "both") {
                result.application = {};
                for (const flag of Object.keys(this.flags.applicationFlags)) {
                    const shift = this.flags.applicationFlags[flag].shift;
                    result.application[flag] = {
                        description: this.flags.applicationFlags[flag].description,
                        bitshift: shift,
                        value: 1n << BigInt(shift),
                        undocumented: this.flags.applicationFlags[flag].undocumented,
                        deprecated: this.flags.applicationFlags[flag]?.deprecated ?? false
                    };
                }
            }
            
            return type === "both" ? result : result[type];
        }
    };
})();
