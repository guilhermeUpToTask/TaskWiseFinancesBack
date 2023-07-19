import { PostgrestError } from '@supabase/supabase-js'

const isPostgrestError = (error: any): error is PostgrestError => {
    return error.code !== undefined
}