import supabase from '../supabase'
import { PostgrestError } from '@supabase/supabase-js'
//{data: null, status: 200}

const isPostgrestError = (error: any): error is PostgrestError => {
    return error.code !== undefined
}

const createRow = async (user_id: string) => {
    try {
        const wallet = {
            user_id: user_id,
            value: 0
        }
        const { error } = await supabase.from('wallets').insert(wallet);
        if (error) 
            throw error;
        else 
            return { data: null, status: 201 }

    } catch (error) {
        if ( isPostgrestError(error)) {
        console.error('error while creating wallet', error);
        console.log(error.message);
        }
        
        throw error
    }
}

export default {
    createRow: createRow,
}
