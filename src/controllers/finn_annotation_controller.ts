import supabase from '../supabase'
import { ServerResponse, AnnotationType, Annotation, op_map, AnnotationStatus, AnnotationRepeat, Operation, op_type } from '../types'
import wallet_op_controller from './wallet_op_controller';

const create = async (
    user_id: string,
    annon_type_id: number,
    annon_type: AnnotationType,
    name: string,
    description: string,
    value: number,
    date: 'string',
    repeat: AnnotationRepeat,
    status: AnnotationStatus,
): Promise<ServerResponse> => {
    try {
        const { error } = await supabase.from('wallet_operations')
            .insert({
                user_id, annon_type_id, annon_type, name, description, value, date, repeat, status,
            });
        if (error)
            throw error;
        else {
            return {
                data: {
                    user_id, annon_type_id, annon_type, name, description, value, date, repeat, status,
                } as Annotation,
                status: 201, error, message: 'sucessfully created Annotation'
            }
        }

    } catch (error) {
        console.error('error while creating Annotation', error);
        throw error
    }
}

const remove = async (
    annotation_id: string,
): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('finn_annotation').delete().match({ annotation_id });
        if (error) throw error;

        else {
            return { data: data, status: 201, error, message: 'sucessfully deleted Annotation' }
        }
    } catch (error) {
        console.error('error while deleting Annotation', error);
        throw error
    }
}

//change to object into route
const update = async (
    annotation_id: number,
    user_id: string,
    annon_type_id: number,
    annon_type: AnnotationType,
    name: string,
    description: string,
    value: number,
    date: 'string',
    repeat: AnnotationRepeat,
    status: AnnotationStatus,

): Promise<ServerResponse> => {
    // need a usecase if status has been changed to perfom certain operations
    try {
        const newAnnotation: Annotation = {
            id: annotation_id, user_id, annon_type_id, annon_type, name, description, value, date, repeat, status
        }
        const { error, data } = await supabase.from('finn_annotations').update({ newAnnotation })
            .match({ id: annotation_id, user_id: user_id }).select();
        if (error) throw error;

        else {
            return {
                data, status: 201, error, message: 'sucessfully created wallet'
            }
        }

    } catch (error) {
        console.error('error while creating Annotation', error);
        throw error
    }
}
const get = async (
    user_id: string,
    annotation_id: number
): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('finn_annotation').select().match({ id: annotation_id, user_id });
        if (error)
            throw error;
        else
            return { data, status: 200, error, message: 'sucessfully selected  annotation' }

    } catch (error) {
        console.error('error while selecting annotation', error);
        throw error
    }
}

const getAll = async (
    user_id: string
): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('finn_annotation').select().match({ user_id });
        if (error)
            throw error;
        else
            return { data, status: 200, error, message: 'sucessfully selected all wallet operation' }

    } catch (error) {
        console.error('error while selecting all in annotation', error);
        throw error
    }
}
const getAllType = async (
    user_id: string,
    annon_type: AnnotationType
): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('finn_annotation').select().match({ user_id, annon_type });
        if (error)
            throw error;
        else
            return { data, status: 200, error, message: 'sucessfully selected all wallet operation' }

    } catch (error) {
        console.error('error while selecting all in annotation', error);
        throw error
    }
}

const getAllBetweenDates = async (
    user_id: string,
    startDate: string,
    endDate: string
): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('finn_annotation').select()
            .gte('date', startDate).lte('date', endDate).match({ user_id });
        if (error)
            throw error;
        else
            return { data, status: 200, error, message: 'sucessfully selected date finn_annotation operation' }

    } catch (error) {
        console.error('error while selecting between date finn_annotation', error);
        throw error
    }
}



const checkStatus = async (
    newStatus: AnnotationStatus,
    user_id: string,
    annotation_id: number
): Promise<boolean> => {
    try {
        const { data: annotations } = await get(user_id, annotation_id);
        const oldStatus = annotations[0].status;
        return oldStatus === newStatus;
    } catch (error) {
        console.error('error while checking status in annotation', error);
        throw error
    }
}


//need futher analysis

const getAllFiltered = async (

): Promise<ServerResponse> => {
    try {
        const { error } = await supabase.from('wallet_operations')
            .insert({});
        if (error)
            throw error;
        else {
            return {
                data: {} as Annotation,
                status: 201, error, message: 'sucessfully created wallet'
            }
        }

    } catch (error) {
        console.error('error while creating Annotation', error);
        throw error
    }
}