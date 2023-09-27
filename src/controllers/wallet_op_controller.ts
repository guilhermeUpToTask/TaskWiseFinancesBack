
import dayjs from 'dayjs';
import { getNewResponseError } from '../error_system';
import supabase from '../supabase'
import { ServerResponse, op_type, Operation, op_map } from '../types'
import wallet_controller from './wallet_controller';
import annotation_controller from './annotation_controller';

enum OperationType {
    Expanse = 'expanse',
    Income = 'income',
}

const op_create_map: op_map = {
    [OperationType.Expanse]: (user_id: string, value: number) => wallet_controller.subtract(user_id, value),
    [OperationType.Income]: (user_id: string, value: number) => wallet_controller.add(user_id, value)
}
const op_delete_map: op_map = {
    [OperationType.Income]: (user_id: string, value: number) => wallet_controller.subtract(user_id, value),
    [OperationType.Expanse]: (user_id: string, value: number) => wallet_controller.add(user_id, value)
}


const create = async (
    name: string,
    value: number,
    description: string,
    operation_type: op_type,
    user_id: string,
    operation_type_id?: number,
    annotation_id?: number
): Promise<ServerResponse> => {
    try {
        const currentDate = dayjs().format('YYYY-MM-DD');
        await op_create_map[operation_type](user_id, value);
        const { error } = await supabase.from('wallet_operations')
            .insert({ name, user_id, value, description, operation_type, operation_type_id, date: currentDate, annotation_id });
        if (error)
            throw error;
        else {
            return {
                data: { name, user_id, value, description, operation_type, operation_type_id, date: currentDate } as Operation,
                status: 201, error, message: 'sucessfully created wallet'
            }
        }

    } catch (error) {
        console.error('error while creating wallet operation', error);
        throw error
    }
}
const get = async (
    operation_id: number,
    user_id: string
): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('wallet_operations').select().match({ id: operation_id, user_id });
        if (error)
            throw error;
        if (!data[0]) { throw getNewResponseError('operation not Found', 404) }
        else {
            return { data: data[0], status: 200, error, message: 'sucessfully get wallet' }
        }

    } catch (error) {
        console.error('error while get wallet operation', error);
        throw error
    }
}


//we unfurtunely have to make one more query because we dont have transaction, to be sure all querys will be execute
//se a exemple, if we try to delete a unistente operation_id, we would delete from wallet because of it even if there is non matching id
//we will use later on stored procedures

const remove = async (
    user_id: string, operation_id: number
): Promise<ServerResponse> => {
    try {

        const { data, error } = await supabase.from('wallet_operations').delete()
            .match({ id: operation_id, user_id }).select();

        await op_delete_map[data[0].operation_type as op_type](user_id, data[0].value);
        if (error)
            throw error;

        if (data[0].annotation_id) {
           await updateAnnByRemoveOp(user_id, data[0].annotation_id)
        }

        return { data: data[0] as Operation, status: 200, error, message: 'sucessfully deleted wallet operation' }

    } catch (error) {
        console.error('error while deleting wallet operation', error);
        throw error
    }
}

const updateAnnByRemoveOp = async (user_id: string, annotation_id: number): Promise<ServerResponse> => {
    try {
        const { data, error } = await annotation_controller.get(user_id, annotation_id);

        if (error)
            throw error;
        if (!data)
            throw getNewResponseError('annotation not Found', 404);

        await annotation_controller.uncheckStatus(user_id, annotation_id)

        return { data, status: 200, error, message: 'sucessfully updated annotation' }

    } catch (error) {
        console.error('error while updating annotation by operation', error);
        throw error
    }
}


//need to analys
const removeByAnnotation = async (
    user_id: string, annotation_id: number,
    operation_type: op_type, value: number
): Promise<ServerResponse> => {
    try {
        await op_delete_map[operation_type](user_id, value);
        const { data, error } = await supabase.from('wallet_operations').delete().match({ annotation_id });
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

const removeByBulkAnnotation = async (
    user_id: string,
    reduceResult: { ids: number[], value: number }
): Promise<ServerResponse> => {
    try {
        await wallet_controller.add(user_id, reduceResult.value);

        const { data, error } = await supabase.from('wallet_operations')
            .delete().in('annotation_id', reduceResult.ids);

        if (error)
            throw error;
        else {
            return {
                data,
                status: 200,
                error,
                message: 'sucessfully deleted wallet operation by bulk remove from annotation'
            }
        }

    } catch (error) {
        console.error('error while deleting wallet operation by bulk remove from annotation', error);
        throw error
    }
}

const filterWalletOperations = async (
    user_id: string,
    operation_type?: string,
    minValue?: number,
    maxValue?: number,
    startDate?: string,
    endDate?: string,
): Promise<ServerResponse> => {
    try {
        let query = supabase.from('wallet_operations').select()
            .match({
                user_id,
                ...(operation_type && { operation_type }),
            })

        query = (minValue) ? query.gte('value', minValue) : query;
        query = (maxValue) ? query.lte('value', maxValue) : query;
        query = (startDate) ? query.gte('date', startDate) : query;
        query = (endDate) ? query.lte('date', endDate) : query;
        const { data, error } = await query;

        if (error)
            throw error;
        else
            return { data: data || [], status: 200, error, message: 'sucessfully selected all wallet operation' }
    } catch (error) {
        console.error('error while dynamic filthered selecting  in wallet operation');
        throw error
    }
}


const getAll = async (user_id: string): Promise<ServerResponse> => {
    try {
        const { data } = await filterWalletOperations(user_id);
        return { data: data || [], status: 200, error: null, message: 'sucessfully selected all wallet operation' }

    } catch (error) {
        console.error('error while selecting all in wallet operation');
        throw error
    }
}

const getAllType = async (user_id: string, operation_type: op_type): Promise<ServerResponse> => {
    try {
        const { data } = await filterWalletOperations(user_id, operation_type);
        return { data: data || [], status: 200, error: null, message: 'sucessfully selected all by type wallet operation' }

    } catch (error) {
        console.error('error while selecting all by type wallet operation');
        throw error
    }
}

// need to know how to work with date type
const getAllBetweenDates = async (user_id: string, startDate: string, endDate: string): Promise<ServerResponse> => {
    try {
        const { data } = await filterWalletOperations(user_id, undefined, undefined, undefined, startDate, endDate)

        return { data: data || [], status: 200, error: null, message: 'sucessfully selecting all between date  from wallet operation' }

    } catch (error) {
        console.error('error while selecting all between date from wallet operation');
        throw error;
    }
}


export default {
    create,
    remove,
    removeByAnnotation,
    removeByBulkAnnotation,
    filterWalletOperations,
    getAll,
    getAllType,
    getAllBetweenDates
}