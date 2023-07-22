import { PostgrestError } from "@supabase/supabase-js";

export type ServerResponse = {
    data: any | null,
    status: number,
    error: PostgrestError | Error | null,
    message: string
}
export interface ResponseError extends Error {
    status_code: number
}

export interface ValidationError extends Error {
    errors: []
}

type op_type = 'income' | 'expanse';

type operation = {
    name: string,
    value: number,
    description: string,
    wallet_id: number,
    user_id: string,
    operation_type: op_type,
    op_sub_type_id?: number,
    date: string
}
interface op_map {
    [key: string]: (user_id: string, value: number) => Promise<ServerResponse>;
}
