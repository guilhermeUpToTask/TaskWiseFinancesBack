import supabase from '../supabase'
import { ServerResponse } from '../types'
import dayjs from 'dayjs';

const create = async (user_id: string): Promise<ServerResponse> => {
    try {
        const prediction_date = {
            user_id: user_id,
            current_date: dayjs().format('YYYY-MM-DD')
        }

        const { error } = await supabase.from('prediction_dates').insert(prediction_date);
        if (error)
            throw error;
        else
            return { data: prediction_date, status: 201, error, message: 'sucessfully created prediction date' }

    } catch (error) {
        console.error('error while creating prediction date', error);
        throw error
    }
}
const get = async (user_id: string): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('prediction_dates').select().eq('user_id', user_id);
        if (error)
            throw error;
        else {
            if (!data[0]) {
                return await create(user_id);
            }
            else
                return { data: data[0].current_date as string, status: 200, error, message: 'sucessfully got prediction date' }
        }

    } catch (error) {
        console.error('error while getting prediction date', error);
        throw error
    }
}

const update = async (user_id: string, current_date: string): Promise<ServerResponse> => {
    try {

        const { error, data } = await supabase.from('prediction_dates')
            .update({ current_date }).eq('user_id', user_id).select();
        if (error)
            throw error;
        else
            return { data: data, status: 200, error, message: 'sucessfully updated prediction date' };

    } catch (error) {
        console.error('error while updating prediction date', error);
        throw error
    }
}

export default {
    get,
    update,
}
