"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = __importDefault(require("../supabase"));
const dayjs_1 = __importDefault(require("dayjs"));
const create = async (user_id) => {
    try {
        const prediction_date = {
            user_id: user_id,
            current_date: (0, dayjs_1.default)().format('YYYY-MM-DD')
        };
        const { error } = await supabase_1.default.from('prediction_dates').insert(prediction_date);
        if (error)
            throw error;
        else
            return { data: prediction_date, status: 201, error, message: 'sucessfully created prediction date' };
    }
    catch (error) {
        console.error('error while creating prediction date', error);
        throw error;
    }
};
const get = async (user_id) => {
    try {
        const { data, error } = await supabase_1.default.from('prediction_dates').select().eq('user_id', user_id);
        if (error)
            throw error;
        else {
            if (!data[0]) {
                return await create(user_id);
            }
            else
                return { data: data[0].current_date, status: 200, error, message: 'sucessfully got prediction date' };
        }
    }
    catch (error) {
        console.error('error while getting prediction date', error);
        throw error;
    }
};
const update = async (user_id, current_date) => {
    try {
        const { error, data } = await supabase_1.default.from('prediction_dates')
            .update({ current_date }).eq('user_id', user_id).select();
        if (error)
            throw error;
        else
            return { data: data, status: 200, error, message: 'sucessfully updated prediction date' };
    }
    catch (error) {
        console.error('error while updating prediction date', error);
        throw error;
    }
};
exports.default = {
    get,
    update,
};
//# sourceMappingURL=prediction_date_controler.js.map