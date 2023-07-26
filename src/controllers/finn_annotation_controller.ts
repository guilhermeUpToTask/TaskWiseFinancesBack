/*
Consistency in Table Names:
The code seems to be interacting with two tables: "wallet_operations" and "finn_annotation." Ensure that the table names are consistent throughout the code.

Improve Naming Conventions:
Try to use consistent and descriptive names for variables and functions. For example, instead of getAllFiltered, which doesn't provide much context, use a more descriptive name that reflects what the function is supposed to achieve.

DRY (Don't Repeat Yourself) Principle:
Some of the functions, such as getAll and getAllType, share similar logic. Consider refactoring and creating a more generic function that accepts different filter criteria as arguments to avoid code duplication.

Proper Error Handling:
When handling errors, consider providing more meaningful error messages, especially when propagating errors to the calling code. This will help with debugging and understanding the issues better.

Dates:
It appears you have date and date-now hardcoded in the code. Consider using a proper date format or a library for managing dates more effectively.

Proper Use of async/await:
Make sure to use await for asynchronous calls inside your try-catch blocks. For example, in getAllFiltered, you're using insert, but you're not awaiting it.

Commenting:
Consider adding comments to explain the purpose and functionality of each function, especially the more complex ones like operationHandler.

Typo Fix:
In the create function, you have const { error } = await supabase.from('wallet_operations').insert({ ... }), but you're returning it as return { data: { ... }, status: 201, error, message: '...' }. It might be a typo, and you might want to change it to return { data: { ... }, status: 201, error: null, message: '...' }.

Here's a suggested refactoring for the getAll and getAllType functions to make them more reusable:
*/


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
        const { error, data } = await supabase.from('wallet_operations')
            .insert({
                user_id, annon_type_id, annon_type, name, description, value, date, repeat, status,
            }).select();
        if (error)
            throw error;
        else {
            return {
                data, status: 201, error:null, message: 'sucessfully created Annotation'
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
        const { data, error } = await supabase.from('finn_annotation').delete().match({ annotation_id }).select();
        if (error) throw error;

        else {
            return { data, status: 201, error, message: 'sucessfully deleted Annotation' }
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
    annon_type: AnnotationType,
    name: string,
    description: string,
    value: number,
    date: 'string',
    repeat: AnnotationRepeat,
    status: AnnotationStatus,
    annon_type_id?: number,

): Promise<ServerResponse> => {
    try {
        const newAnnotation: Annotation = {
            id: annotation_id, user_id, annon_type_id, annon_type, name, description, value, date, repeat, status
        }
     
        await createOperationByStatus(
            annotation_id, name, value, user_id, status, annon_type)

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
const getStatus = async (
    user_id: string,
    annotation_id: number
): Promise<ServerResponse> => {
    try {
        const { data, error } = await supabase.from('finn_annotation').select('status').match({ id: annotation_id, user_id });
        if (error)
            throw error;
        else
            return { data: data[0], status: 200, error, message: 'sucessfully selected  annotation' }

    } catch (error) {
        console.error('error while selecting annotation status', error);
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


const createOperationByStatus = async (
    annotation_id: number,
    annotation_name: string,
    annotation_value: number,
    user_id: string,
    newStatus: AnnotationStatus,
    annotation_type: AnnotationType
): Promise<ServerResponse> => {
    try {
        const { data: { status: oldStatus } } = await getStatus(user_id, annotation_id);
        const op_action = checkStatus(newStatus, oldStatus, annotation_id);
        const op_type = (annotation_type === 'payment') ? 'income' : 'expanse';

        if (!op_action)
            return { data: null, error: null, status: 200, message: 'no action to perform' }
        else if (op_action === 'create') {
            const { data } = await wallet_op_controller.create(
                `Operation from ${annotation_name}`,
                annotation_value,
                `This Operation was created from ${annotation_name} annotation of type ${annotation_type}`,
                op_type,
                'date-now',
                user_id,
                undefined,
                annotation_id
            )
            return { data, error: null, status: 200, message: 'operation created by Annotation Change' }
        } else {
            const { data } = await wallet_op_controller.removeByAnnotation(
                user_id,
                annotation_id,
                op_type,
                annotation_value)
            return { data, error: null, status: 200, message: 'operation deleted by Annotation Change' }

        }
    } catch (error) {
        console.error('error while creating operation from annotation', error);
        throw error
    }

}





const checkStatus = (
    newStatus: AnnotationStatus,
    oldStatus: AnnotationStatus,
    annotation_id: number
): 'create' | 'delete' | null => {
    if (newStatus === oldStatus)
        return null
    if ((newStatus === 'expired' && oldStatus === 'pendent') ||
        (newStatus === 'pendent' && oldStatus === 'expired'))
        return null

    if (newStatus === 'recived' || newStatus === 'payed')
        return 'create'

    return 'delete'

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