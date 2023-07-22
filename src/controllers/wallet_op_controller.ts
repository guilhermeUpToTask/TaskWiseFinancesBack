import supabase from '../supabase'
import { ResponseError, ServerResponse, op_type, operation } from '../types'
import wallet_controller from './wallet_controller';

interface op_map {
    [key: string]: (user_id: string, value: number) => Promise<ServerResponse>;
}


const op_create_map: op_map = {
    ['expanse']: (user_id: string, value: number) => wallet_controller.subtract(user_id, value),
    ['income']: (user_id: string, value: number) => wallet_controller.add(user_id, value)
}
const op_delete_map: op_map = {
    ['income']: (user_id: string, value: number) => wallet_controller.subtract(user_id, value),
    ['expanse']: (user_id: string, value: number) => wallet_controller.add(user_id, value)
}


const create = async (operation: operation): Promise<ServerResponse> => {
    try {
        await op_create_map[operation.operation_type](operation.user_id, operation.value);
        const { error } = await supabase.from('wallet_operations').insert(operation);
        if (error)
            throw error;
        else {
            return { data: operation, status: 201, error, message: 'sucessfully created wallet' }
        }

    } catch (error) {
        console.error('error while creating wallet operation', error);
        throw error
    }
}
const remove = async (operation: operation, operation_id: number): Promise<ServerResponse> => {
    try {
        await op_delete_map[operation.operation_type](operation.user_id, operation.value);
        const { data, error } = await supabase.from('wallet_operations').delete().match({ operation_id });
        if (error)
            throw error;
        else {
            return { data, status: 200, error, message: 'sucessfully deleted wallet operation' }
        }

    } catch (error) {
        console.error('error while deleting wallet operation', error);
        throw error
    }
}

const getAll = async (user_id: string): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('wallet_operations').select().match({ user_id });
        if (error)
            throw error;
        else
            return { data, status: 200, error, message: 'sucessfully selected all wallet operation' }

    } catch (error) {
        console.error('error while selecting wallet operation', error);
        throw error
    }
}
const getAllType = async (user_id: string, operation_type: op_type): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('wallet_operations').select().match({ user_id, operation_type });
        if (error)
            throw error;
        else
            return { data, status: 200, error, message: 'sucessfully selected type wallet operation' }

    } catch (error) {
        console.error('error while selecting type wallet operation', error);
        throw error
    }
}

// need to know how to work with date type
const getAllBetweenDates = async (user_id: string, startDate: string, endDate: string): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('wallet_operations').select()
            .gte('date', startDate).lte('date', endDate).match({ user_id });
        if (error)
            throw error;
        else
            return { data, status: 200, error, message: 'sucessfully selected date wallet operation' }

    } catch (error) {
        console.error('error while selecting date wallet operation', error);
        throw error
    }
}


export default {
    create,
    remove,
    getAll,
    getAllType,
    getAllBetweenDates
}