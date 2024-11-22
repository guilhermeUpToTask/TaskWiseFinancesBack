"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = __importDefault(require("../supabase"));
const error_system_1 = require("../error_system");
const create = async (user_id) => {
    try {
        const wallet = {
            user_id: user_id,
            value: 0
        };
        const { error } = await supabase_1.default.from('wallets').insert(wallet);
        if (error)
            throw error;
        else
            return { data: wallet, status: 201, error, message: 'sucessfully created wallet' };
    }
    catch (error) {
        console.error('error while creating wallet', error);
        throw error;
    }
};
const get = async (user_id) => {
    try {
        const { data, error } = await supabase_1.default.from('wallets').select().eq('user_id', user_id);
        if (error)
            throw error;
        else {
            if (!data[0]) {
                return await create(user_id);
            }
            else
                return { data: data[0], status: 200, error, message: 'sucessfully got wallet' };
        }
    }
    catch (error) {
        console.error('error while getting wallet', error);
        throw error;
    }
};
const update = async (user_id, value) => {
    try {
        console.log('value from update', value);
        const { error, data } = await supabase_1.default.from('wallets').update({ value }).eq('user_id', user_id);
        if (error)
            throw error;
        else
            return { data: data, status: 200, error, message: 'sucessfully updated wallet' };
    }
    catch (error) {
        console.error('error while updating wallet', error);
        throw error;
    }
};
const add = async (user_id, value) => {
    try {
        const { data } = await get(user_id);
        if (data)
            return await update(user_id, (data.value + value));
        else {
            const newError = { name: '404 Error', message: 'wallet not Found', status_code: 404 };
            throw newError;
        }
    }
    catch (error) {
        console.error('error while add value to wallet', error);
        throw error;
    }
};
const subtract = async (user_id, value) => {
    try {
        console.log('from subtract wallet_controller.ts', 'value', value);
        const { data } = await get(user_id);
        if (!data)
            throw (0, error_system_1.getNewResponseError)('wallet not Found', 404);
        if (data.value < value)
            throw (0, error_system_1.getNewResponseError)('value must be below wallet value', 400);
        console.log('data.value', data.value);
        return await update(user_id, (data.value - value));
    }
    catch (error) {
        console.error('error while subtracting  value to wallet', error);
        throw error;
    }
};
exports.default = {
    get,
    add,
    subtract
};
//# sourceMappingURL=wallet_controller.js.map