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

export type op_type = 'income' | 'expanse';

export type Operation = {
    name: string,
    value: number,
    description: string,
    user_id: string,
    wallet_id: number,
    annotation_id?: number,
    type: op_type,
    date: string,
}
interface op_map {
    [key: string]: (user_id: string, value: number) => Promise<ServerResponse>;

}
export type AnnotationType = 'bill' | 'payment';
export type AnnotationStatus = 'pendent' | 'expired' | 'payed' | 'recived';
export type AnnotationRepeat = 'never' | 'day' | 'week' | 'month';

export type Annotation = {
    id: number,
    user_id: string,
    annon_type: AnnotationType,
    name: string,
    description: string,
    value: number,
    date: string,
    repeat: AnnotationRepeat, // on this we create a array if month create 12, if dayly create 31 or 30 if weakly create 4
    status: AnnotationStatus,
    annon_type_id?: number,
}

export type AnnotationV2 = {
    id: number,
    user_id: string,
    type: AnnotationType,
    name: string,
    description: string,
    value: number,
    date: string,
    repeat: AnnotationRepeat, // on this we create a array if month create 12, if dayly create 31 or 30 if weakly create 4
    status: AnnotationStatus,
}
export type NewAnnotation = Omit<Annotation, 'id'>;
