import supabase from "../supabase";

const getUserIDFromJWT = async (jwt: string): Promise<string> => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser(jwt);
        if (error || !user) throw error;
        return user.id;
    } catch (e) {
        console.error('A Auth Error Occurred on getUserIDFromJWT');
        throw e;

    }
}


export default {
    getUserIDFromJWT,
}