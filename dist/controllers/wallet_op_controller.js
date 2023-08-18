"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const error_system_1 = require("../error_system");
const supabase_1 = __importDefault(require("../supabase"));
const wallet_controller_1 = __importDefault(require("./wallet_controller"));
var OperationType;
(function (OperationType) {
    OperationType["Expanse"] = "expanse";
    OperationType["Income"] = "income";
})(OperationType || (OperationType = {}));
const op_create_map = {
    [OperationType.Expanse]: (user_id, value) => wallet_controller_1.default.subtract(user_id, value),
    [OperationType.Income]: (user_id, value) => wallet_controller_1.default.add(user_id, value)
};
const op_delete_map = {
    [OperationType.Income]: (user_id, value) => wallet_controller_1.default.subtract(user_id, value),
    [OperationType.Expanse]: (user_id, value) => wallet_controller_1.default.add(user_id, value)
};
const create = async (name, value, description, operation_type, user_id, operation_type_id, annotation_id) => {
    try {
        const currentDate = (0, dayjs_1.default)().format('YYYY-MM-DD');
        await op_create_map[operation_type](user_id, value);
        const { error } = await supabase_1.default.from('wallet_operations')
            .insert({ name, user_id, value, description, operation_type, operation_type_id, date: currentDate, annotation_id });
        if (error)
            throw error;
        else {
            return {
                data: { name, user_id, value, description, operation_type, operation_type_id, date: currentDate },
                status: 201, error, message: 'sucessfully created wallet'
            };
        }
    }
    catch (error) {
        console.error('error while creating wallet operation', error);
        throw error;
    }
};
const get = async (operation_id, user_id) => {
    try {
        const { data, error } = await supabase_1.default.from('wallet_operations').select().match({ id: operation_id, user_id });
        if (error)
            throw error;
        if (!data[0]) {
            throw (0, error_system_1.getNewResponseError)('operation not Found', 404);
        }
        else {
            return { data: data[0], status: 200, error, message: 'sucessfully get wallet' };
        }
    }
    catch (error) {
        console.error('error while get wallet operation', error);
        throw error;
    }
};
//we unfurtunely have to make one more query because we dont have transaction, to be sure all querys will be execute
//se a exemple, if we try to delete a unistente operation_id, we would delete from wallet because of it even if there is non matching id
//we will use later on stored procedures
const remove = async (user_id, operation_id) => {
    try {
        const { data: { value, operation_type } } = await get(operation_id, user_id);
        await op_delete_map[operation_type](user_id, value);
        const { data, error } = await supabase_1.default.from('wallet_operations').delete()
            .match({ id: operation_id, user_id });
        return { data, status: 200, error, message: 'sucessfully deleted wallet operation' };
    }
    catch (error) {
        console.error('error while deleting wallet operation', error);
        throw error;
    }
};
//need to analys
const removeByAnnotation = async (user_id, annotation_id, operation_type, value) => {
    try {
        await op_delete_map[operation_type](user_id, value);
        const { data, error } = await supabase_1.default.from('wallet_operations').delete().match({ annotation_id });
        if (error)
            throw error;
        else {
            return { data, status: 200, error, message: 'sucessfully deleted wallet operation' };
        }
    }
    catch (error) {
        console.error('error while deleting wallet operation', error);
        throw error;
    }
};
const filterWalletOperations = async (user_id, operation_type, minValue, maxValue, startDate, endDate) => {
    try {
        let query = supabase_1.default.from('wallet_operations').select()
            .match({
            user_id,
            ...(operation_type && { operation_type }),
        });
        query = (minValue) ? query.gte('value', minValue) : query;
        query = (maxValue) ? query.lte('value', maxValue) : query;
        query = (startDate) ? query.gte('date', startDate) : query;
        query = (endDate) ? query.lte('date', endDate) : query;
        const { data, error } = await query;
        if (error)
            throw error;
        else
            return { data: data || [], status: 200, error, message: 'sucessfully selected all wallet operation' };
    }
    catch (error) {
        console.error('error while dynamic filthered selecting  in wallet operation');
        throw error;
    }
};
const getAll = async (user_id) => {
    try {
        const { data } = await filterWalletOperations(user_id);
        return { data: data || [], status: 200, error: null, message: 'sucessfully selected all wallet operation' };
    }
    catch (error) {
        console.error('error while selecting all in wallet operation');
        throw error;
    }
};
const getAllType = async (user_id, operation_type) => {
    try {
        const { data } = await filterWalletOperations(user_id, operation_type);
        return { data: data || [], status: 200, error: null, message: 'sucessfully selected all by type wallet operation' };
    }
    catch (error) {
        console.error('error while selecting all by type wallet operation');
        throw error;
    }
};
// need to know how to work with date type
const getAllBetweenDates = async (user_id, startDate, endDate) => {
    try {
        const { data } = await filterWalletOperations(user_id, undefined, undefined, undefined, startDate, endDate);
        return { data: data || [], status: 200, error: null, message: 'sucessfully selecting all between date  from wallet operation' };
    }
    catch (error) {
        console.error('error while selecting all between date from wallet operation');
        throw error;
    }
};
exports.default = {
    create,
    remove,
    removeByAnnotation,
    filterWalletOperations,
    getAll,
    getAllType,
    getAllBetweenDates
};
//# sourceMappingURL=wallet_op_controller.js.map