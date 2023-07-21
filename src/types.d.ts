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

