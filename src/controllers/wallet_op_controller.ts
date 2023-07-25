import supabase from '../supabase'
import {ServerResponse, op_type, Operation, op_map } from '../types'
import wallet_controller from './wallet_controller';


const op_create_map: op_map = {
    ['expanse']: (user_id: string, value: number) => wallet_controller.subtract(user_id, value),
    ['income']: (user_id: string, value: number) => wallet_controller.add(user_id, value)
}
const op_delete_map: op_map = {
    ['income']: (user_id: string, value: number) => wallet_controller.subtract(user_id, value),
    ['expanse']: (user_id: string, value: number) => wallet_controller.add(user_id, value)
}

const create = async (
    name: string,
    value: number,
    description: string,
    wallet_id: number,
    operation_type: op_type,
    operation_type_id: number | undefined,
    date: string,
    user_id: string,
): Promise<ServerResponse> => {
    try {
        await op_create_map[operation_type](user_id, value);
        const { error } = await supabase.from('wallet_operations')
            .insert({ name, user_id, value, description, wallet_id, operation_type, operation_type_id, date });
        if (error)
            throw error;
        else {
            return {
                data: { name, user_id, value, description, wallet_id, operation_type, operation_type_id, date } as Operation,
                status: 201, error, message: 'sucessfully created wallet'}
        }

    } catch (error) {
        console.error('error while creating wallet operation', error);
        throw error
    }
}
const remove = async (
    user_id: string, operation_id: number, operation_type: op_type, value: number
): Promise<ServerResponse> => {
    try {
        await op_delete_map[operation_type](user_id, value);
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
        console.error('error while selecting all in wallet operation', error);
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
        console.error('error while selecting betweemdate wallet operation', error);
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