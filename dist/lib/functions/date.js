"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstAndLastDayOfMonth = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
function getFirstAndLastDayOfMonth(year, month) {
    const firstDay = (0, dayjs_1.default)(`${year}-${month}-01`);
    const lastDay = firstDay.endOf('month');
    return { firstDay: firstDay.format('YYYY-MM-DD'), lastDay: lastDay.format('YYYY-MM-DD') };
}
exports.getFirstAndLastDayOfMonth = getFirstAndLastDayOfMonth;
function getHashMapFromDates(dates, objs) {
    const hashMap = {};
    return hashMap;
}
//# sourceMappingURL=date.js.map