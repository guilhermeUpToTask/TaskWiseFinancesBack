"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerErrorHandler = exports.getNewResponseError = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const postgresErrorToHttpStatus_1 = __importDefault(require("./postgresErrorToHttpStatus"));
//Logging: You are using console.error to log errors. It is a good practice to include more 
//contextual information in the logs, like the timestamp 
//or a unique identifier for the request. This can be helpful for debugging and monitoring.
//later we will use as middeware to refactor the code and englobe all routes better
const getNewResponseError = (message, status_code) => {
    return { name: 'Response Error', message, status_code };
};
exports.getNewResponseError = getNewResponseError;
const isPostgrestError = (error) => {
    return error.code !== undefined;
};
const isResponseError = (error) => {
    return error.status_code !== undefined;
};
const isValidationError = (error) => {
    return error.errors !== undefined;
};
const routerErrorHandler = (error) => {
    if (isPostgrestError(error)) {
        console.error('A Postgrest Error Occurred', error);
        return {
            data: null,
            error: error,
            message: error.message,
            status: postgresErrorToHttpStatus_1.default[error.code] || 500,
        };
    }
    else if (isResponseError(error)) {
        console.error('A Denied Response Error Occurred', error);
        return {
            data: null,
            error: error,
            message: error.message,
            status: error.status_code,
        };
    }
    else if (isValidationError(error)) {
        console.error('A Validation Error Occurred', error);
        return {
            data: null,
            error: error,
            message: 'Invalid Request',
            status: 400,
        };
    }
    else if ((0, supabase_js_1.isAuthError)(error)) {
        console.error('A Auth Error Occurred', error);
        return {
            data: null,
            error: error,
            message: 'Unauthorized',
            status: 401,
        };
    }
    else {
        console.error('A Server Error Occurred', error);
        return {
            data: null,
            error: error,
            message: 'Server Error',
            status: 500,
        };
    }
};
exports.routerErrorHandler = routerErrorHandler;
//# sourceMappingURL=index.js.map