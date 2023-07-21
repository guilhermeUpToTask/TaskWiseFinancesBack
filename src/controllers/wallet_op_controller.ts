import supabase from '../supabase'
import { ResponseError, ServerResponse } from '../types'
import { getNewResponseError } from '../error_system';
import wallet_controller from './wallet_controller';

type Expanse ={
    name: string,
    value: number,
    description: string,
    wallet_id: number,
    user_id: string,
    type:'expanse',
    date: string
}

const wallet_op_map = {
    ['expanse']: (user_id: string, value: number) =>  wallet_controller.subtract(user_id, value),
    ['income']: (user_id: string, value: number) => wallet_controller.add(user_id, value)

}


const create = async ( expanse: Expanse): Promise<ServerResponse> => {
    try {

        const { error } = await supabase.from('wallets').insert(expanse);
        if (error)
            throw error;
        else{
            wallet_op_map[expanse.type](expanse.user_id, expanse.value);
            return { data: expanse, status: 201, error, message: 'sucessfully created wallet' }
        }

    } catch (error) {
        console.error('error while creating wallet', error);
        throw error
    }
}