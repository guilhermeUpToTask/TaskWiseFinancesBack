import { PostgrestError, isAuthError } from '@supabase/supabase-js'
import { ResponseError, ServerResponse, ValidationError } from '../types'
import errorToStatus from './postgresErrorToHttpStatus';

//Logging: You are using console.error to log errors. It is a good practice to include more 
//contextual information in the logs, like the timestamp 
//or a unique identifier for the request. This can be helpful for debugging and monitoring.
//later we will use as middeware to refactor the code and englobe all routes better


export const getNewResponseError = (message: string, status_code: number): ResponseError => {
    return { name: 'Response Error', message, status_code }
}

const isPostgrestError = (error: any): error is PostgrestError => {
    return error.code !== undefined
}
const isResponseError = (error: any): error is ResponseError => {
    return error.status_code !== undefined
}
const isValidationError = (error: any): error is ValidationError => {
    return error.errors !== undefined
}


export const routerErrorHandler = (error: any): ServerResponse => {
    if (isPostgrestError(error)) {
        console.error('A Postgrest Error Occurred', error);
        return {
            data: null,
            error: error,
            message: error.message,
            status: errorToStatus[error.code] || 500,
        }
    } else if (isResponseError(error)) {
        console.error('A Denied Response Error Occurred', error);
        return {
            data: null,
            error: error,
            message: error.message,
            status: error.status_code,
        }

    } else if (isValidationError(error)) {
        console.error('A Validation Error Occurred', error);
        return {
            data: null,
            error: error,
            message: 'Invalid Request',
            status: 400,
        }
    
    }else if (isAuthError(error)) {
        console.error('A Auth Error Occurred', error);
        return {
            data:null,
            error: error,
            message: 'Unauthorized',
            status: 401,
        }
    } else {
        console.error('A Server Error Occurred', error);
        return {
            data: null,
            error: error,
            message: 'Server Error',
            status: 500,
        }
    }
}
