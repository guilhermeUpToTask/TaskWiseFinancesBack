import supabase from '../supabase'
import { ResponseError, ServerResponse } from '../types'
import { getNewResponseError } from '../error_system';

const create = async (user_id: string): Promise<ServerResponse> => {
    try {
        const wallet = {
            user_id: user_id,
            value: 0
        }
        const { error } = await supabase.from('wallets').insert(wallet);
        if (error)
            throw error;
        else
            return { data: wallet, status: 201, error, message: 'sucessfully created wallet' }

    } catch (error) {
        console.error('error while creating wallet', error);
        throw error
    }
}
const get = async (user_id: string): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('wallets').select().eq('user_id', user_id);
        if (error)
            throw error;
        else {
            if (!data[0]) {
                return await create(user_id);
            }
            else
                return { data: data[0], status: 200, error, message: 'sucessfully got wallet' }
        }

    } catch (error) {
        console.error('error while getting wallet', error);
        throw error
    }
}
const update = async (user_id: string, value: number): Promise<ServerResponse> => {
    try {
        const { error, data } = await supabase.from('wallets').update({ value }).eq('user_id', user_id);
        if (error)
            throw error;
        else
            return { data: data, status: 200, error, message: 'sucessfully updated wallet' };

    } catch (error) {
        console.error('error while updating wallet', error);
        throw error
    }
}

const add = async (user_id: string, value: number): Promise<ServerResponse> => {
    try {
        const { data } = await get(user_id);
        if (data)
            return await update(user_id, data.value + value);
        else {
            const newError: ResponseError = { name: '404 Error', message: 'wallet not Found', status_code: 404 }
            throw newError
        }
    } catch (error) {
        console.error('error while add value to wallet', error);
        throw error
    }
}
const subtract = async (user_id: string, value: number): Promise<ServerResponse> => {
    try {
        console.log('from subtract wallet_controller.ts', 'value', value);
        const { data } = await get(user_id);
        if (!data)
            throw getNewResponseError('wallet not Found', 404)
        if (data.value as number < value)
            throw getNewResponseError('value must be below wallet value', 400)

        return await update(user_id, data.value as number - value);
    } catch (error) {
        console.error('error while subtracting  value to wallet', error);
        throw error
    }
}

export default {
    get,
    add,
    subtract
}
