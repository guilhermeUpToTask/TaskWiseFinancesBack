"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArrOfStrToInt = void 0;
const index_1 = require("../../error_system/index");
function parseArrOfStrToInt(arr) {
    return arr.map((str) => {
        const parsedInt = parseInt(str, 10);
        if (!Number.isNaN(parsedInt))
            return parsedInt;
        else
            throw (0, index_1.getNewResponseError)('array must be an array of numbers', 400);
    });
}
exports.parseArrOfStrToInt = parseArrOfStrToInt;
//# sourceMappingURL=commun_fns.js.map