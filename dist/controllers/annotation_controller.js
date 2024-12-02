"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = __importDefault(require("../supabase"));
const error_system_1 = require("../error_system");
const wallet_op_controller_1 = __importDefault(require("./wallet_op_controller"));
const dayjs_1 = __importDefault(require("dayjs"));
const create = async (user_id, name, description, value, repeat, status, date, type) => {
    try {
        const { error, data } = await supabase_1.default.from('annotations')
            .insert({
            user_id, type, name, description, value, date, repeat, status,
        }).select();
        if (error)
            throw error;
        else {
            return {
                data, status: 201, error: null, message: 'sucessfully created Annotation'
            };
        }
    }
    catch (error) {
        console.error('error while creating Annotation', error);
        throw error;
    }
};
const bulkCreate = async (annotations) => {
    try {
        const { data, error } = await supabase_1.default.from('annotations').insert(annotations).select();
        if (error)
            throw error;
        else {
            return {
                data, status: 201, error: null, message: 'sucessfully bulk created Annotation'
            };
        }
    }
    catch (error) {
        console.error('error while bulk creating Annotation', error);
        throw error;
    }
};
const remove = async (annotation_id, user_id) => {
    try {
        const { data, error } = await supabase_1.default.from('annotations')
            .delete().match({ id: annotation_id, user_id }).select();
        if (error)
            throw error;
        if (data.length === 0)
            throw (0, error_system_1.getNewResponseError)('Annotation to delete not found', 404);
        if (data[0].status === 'recived' || data[0].status === 'payed') {
            const op_type = (data[0].status === 'recived') ? 'income' : 'expanse';
            await wallet_op_controller_1.default
                .removeByAnnotation(user_id, annotation_id, op_type, data[0].value);
        }
        return { data, status: 200, error, message: 'sucessfully deleted Annotation' };
    }
    catch (error) {
        console.error('error while deleting Annotation', error);
        throw error;
    }
};
const reduceCheckedAnnotations = (annotations) => {
    return annotations.reduce((acc, curr) => {
        if (['recived', 'payed'].includes(curr.status)) {
            console.log(curr);
            return {
                ids: [...acc.ids, curr.id],
                value: (curr.annon_type === 'payment') ? acc.value + curr.value :
                    acc.value - curr.value
            };
        }
        else {
            return acc;
        }
    }, { ids: [], value: 0 });
};
const bulkRemove = async (user_id, annotation_ids) => {
    try {
        const { data, error } = await supabase_1.default.from('annotations')
            .delete()
            .match({ user_id })
            .in('id', annotation_ids)
            .select();
        if (error)
            throw error;
        if (data.length === 0)
            throw (0, error_system_1.getNewResponseError)('Annotation to delete not found', 404);
        else {
            const reduceResult = reduceCheckedAnnotations(data);
            if (reduceResult.ids.length > 0) {
                wallet_op_controller_1.default.removeByBulkAnnotation(user_id, reduceResult);
            }
            return { data, status: 200, error, message: 'sucessfully bulk deleted Annotations' };
        }
    }
    catch (error) {
        console.error('error while bulk deleting Annotations', error);
        throw error;
    }
};
//change to object into route
const update = async (annotation_id, user_id, name, description, value, date, repeat, status, annon_type, annon_type_id) => {
    try {
        const { message: operationMessage } = await createOperationByStatus(annotation_id, name, value, user_id, status, annon_type);
        const { error, data } = await supabase_1.default.from('annotations').update({ user_id, annon_type_id, annon_type, name, description, value, date, repeat, status })
            .match({ id: annotation_id, user_id: user_id }).select();
        if (error)
            throw error;
        else {
            return {
                data, status: 200, error,
                message: `Annotation: Sucessfully update annotation 
                Wallet Operation: ${operationMessage}
                `
            };
        }
    }
    catch (error) {
        console.error('error while creating Annotation', error);
        throw error;
    }
};
const uncheckStatus = async (user_id, annotation_id) => {
    try {
        const { error, data } = await supabase_1.default.from('annotations').update({ status: 'pendent' })
            .match({ id: annotation_id, user_id: user_id }).select();
        if (error)
            throw error;
        else {
            return {
                data, status: 200, error,
                message: `Annotation: Sucessfully unchecked 
                `
            };
        }
    }
    catch (error) {
        console.error('error while unchecking Annotation', error);
        throw error;
    }
};
const get = async (user_id, annotation_id) => {
    try {
        const { data, error } = await supabase_1.default.from('annotations').select().match({ id: annotation_id, user_id });
        if (error)
            throw error;
        else
            return { data: data[0] || [], status: 200, error, message: 'sucessfully selected  annotation' };
    }
    catch (error) {
        console.error('error while selecting annotation', error);
        throw error;
    }
};
const getStatus = async (user_id, annotation_id) => {
    try {
        const { data, error } = await supabase_1.default.from('annotations').select('status').match({ id: annotation_id, user_id });
        if (error)
            throw error;
        if (!data[0])
            throw (0, error_system_1.getNewResponseError)('Annotation not Found', 404);
        else
            return { data: data[0], status: 200, error, message: 'sucessfully selected  annotation' };
    }
    catch (error) {
        console.error('error while selecting annotation status', error);
        throw error;
    }
};
const confirmStatus = async (user_id, annotation_id, name, value, status, annon_type) => {
    try {
        if (status === 'payed' || status === 'recived') {
            throw (0, error_system_1.getNewResponseError)('Annotation already confirmed', 400);
        }
        else if (status === 'expired' || status === 'pendent') {
            const newStatus = (annon_type === 'payment') ? 'recived' : 'payed';
            const { message: operationMessage } = await createOperationByStatus(annotation_id, name, value, user_id, newStatus, annon_type);
            const { data, error } = await supabase_1.default.from('annotations').update({ status: newStatus })
                .match({ id: annotation_id, user_id }).select();
            if (error)
                throw error;
            else
                return {
                    data, status: 200, error,
                    message: `Annotation: Sucessfully confirmed status 
                Wallet Operation: ${operationMessage}
                `
                };
        }
    }
    catch (error) {
        console.error('error while selecting annotation status', error);
        throw error;
    }
};
const checkStatus = (newStatus, oldStatus) => {
    if (newStatus === oldStatus)
        return null;
    if ((newStatus === 'expired' && oldStatus === 'pendent') ||
        (newStatus === 'pendent' && oldStatus === 'expired'))
        return null;
    if (newStatus === 'recived' || newStatus === 'payed')
        return 'create';
    // case old status is alread confirmed and will reverse it back
    return 'delete';
};
const createOperationByStatus = async (annotation_id, annotation_name, annotation_value, user_id, newStatus, annotation_type) => {
    try {
        const { data: { status: oldStatus } } = await getStatus(user_id, annotation_id);
        const op_action = checkStatus(newStatus, oldStatus);
        const op_type = (annotation_type === 'payment') ? 'income' : 'expanse';
        if (!op_action)
            return { data: null, error: null, status: 200, message: 'no action to perform' };
        else if (op_action === 'create') {
            const { data } = await wallet_op_controller_1.default.create(`Operation from ${annotation_name}`, annotation_value, `This Operation was created from ${annotation_name} annotation of type ${annotation_type}`, op_type, user_id, undefined, annotation_id);
            return { data, error: null, status: 200, message: 'operation created by Annotation Change' };
        }
        else {
            const { data } = await wallet_op_controller_1.default.removeByAnnotation(user_id, annotation_id, op_type, annotation_value);
            return { data, error: null, status: 200, message: 'operation deleted by Annotation Change' };
        }
    }
    catch (error) {
        console.error('error while creating operation from annotation', error);
        throw error;
    }
};
const filterAnnotation = async (user_id, annon_type, status, minValue, maxValue, startDate, endDate) => {
    try {
        let query = supabase_1.default.from('annotations').select()
            .match({
            user_id,
            ...(annon_type && { annon_type }),
        });
        query = (status) ? query.in('status', status) : query;
        query = (minValue) ? query.gte('value', minValue) : query;
        query = (maxValue) ? query.lte('value', maxValue) : query;
        query = (startDate) ? query.gte('date', startDate) : query;
        query = (endDate) ? query.lte('date', endDate) : query;
        const { data, error } = await query;
        if (error)
            throw error;
        else {
            return {
                data: data || [], status: 201, error,
                message: 'sucessfully get Annotations'
            };
        }
    }
    catch (error) {
        console.error('error while getting Annotation', error);
        throw error;
    }
};
const getAll = async (user_id) => {
    try {
        const { data } = await filterAnnotation(user_id);
        return {
            data: data || [], status: 200, error: null,
            message: 'sucessfully selected all annotations'
        };
    }
    catch (error) {
        console.error('error while selecting all in annotation', error);
        throw error;
    }
};
const getAllType = async (user_id, annotation_type) => {
    try {
        const { data } = await filterAnnotation(user_id, annotation_type);
        return {
            data: data || [], status: 200, error: null,
            message: 'sucessfully selected all by  type annotations'
        };
    }
    catch (error) {
        console.error('error while selecting all by type in annotation', error);
        throw error;
    }
};
const getAllStatus = async (user_id, status) => {
    try {
        const { data } = await filterAnnotation(user_id, undefined, [status]);
        return {
            data: data || [], status: 200, error: null,
            message: 'sucessfully selected all by  status annotations'
        };
    }
    catch (error) {
        console.error('error while selecting all by status in annotation', error);
        throw error;
    }
};
const getAllBetweenDates = async (user_id, startDate, endDate) => {
    try {
        const { data } = await filterAnnotation(user_id, undefined, undefined, undefined, undefined, startDate, endDate);
        const annotations = data;
        // Group annotations by date
        const groupedData = annotations.reduce((acc, annotation) => {
            const dateKey = annotation.date; // Extract the annotation's date as a key
            if (!acc[dateKey]) { // Check if the dateKey does not already exist in the accumulator
                acc[dateKey] = []; // If not, initialize it as an empty array
            }
            acc[dateKey].push(annotation); // Add the annotation to the corresponding array
            return acc; // Return the accumulator for the next iteration
        }, {}); // Initialize the accumulator as an empty object of type GroupedResponse
        return {
            data: groupedData || [], status: 200, error: null,
            message: 'sucessfully selected all between dates in annotations'
        };
    }
    catch (error) {
        console.error('error while selecting all in annotation', error);
        throw error;
    }
};
const checkIfShouldBeExpired = (annotation) => {
    const today = (0, dayjs_1.default)();
    return (annotation.status === 'pendent' &&
        (0, dayjs_1.default)(annotation.date).isBefore(today));
};
const checkForNewExpireds = (annotations) => {
    return (annotations.filter(checkIfShouldBeExpired).length > 0);
};
const setBillsPendentsToExpired = async (user_id) => {
    try {
        const { data, error } = await supabase_1.default.from('annotations')
            .update({ status: 'expired' })
            .match({
            user_id,
            status: 'pendent',
            annon_type: 'bill'
        })
            .lte('date', (0, dayjs_1.default)().format('YYYY-MM-DD'));
        if (error)
            throw error;
        return {
            data: data || [], status: 200, error: null,
            message: 'sucessfully set pendents to expired'
        };
    }
    catch (error) {
        console.error('error while setting pendents to expired', error);
        throw error;
    }
};
const getAllPendentOrExpired = async (user_id, offsetDate) => {
    try {
        const { data } = await filterAnnotation(user_id, undefined, ['pendent', 'expired'], undefined, undefined, undefined, offsetDate);
        if (checkForNewExpireds(data))
            await setBillsPendentsToExpired(user_id);
        return {
            data: data || [], status: 200, error: null,
            message: 'sucessfully selected all pendent or expired in annotations'
        };
    }
    catch (error) {
        console.error('error while selecting all pendent or expired  in annotation', error);
        throw error;
    }
};
exports.default = {
    create,
    bulkCreate,
    remove,
    bulkRemove,
    update,
    uncheckStatus,
    confirmStatus,
    get,
    filterAnnotation,
    getAll,
    getAllType,
    getAllStatus,
    getAllBetweenDates,
    getAllPendentOrExpired
};
//# sourceMappingURL=annotation_controller.js.map