"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = __importDefault(require("../supabase"));
const getUserIDFromJWT = async (jwt) => {
    try {
        const { data: { user }, error } = await supabase_1.default.auth.getUser(jwt);
        if (error || !user)
            throw error;
        return user.id;
    }
    catch (e) {
        console.error('A Auth Error Occurred on getUserIDFromJWT');
        throw e;
    }
};
exports.default = {
    getUserIDFromJWT,
};
//# sourceMappingURL=user_controller.js.map