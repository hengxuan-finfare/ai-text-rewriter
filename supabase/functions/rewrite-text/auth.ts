import { createSupabaseClient } from "./database.ts";

export async function authenticateUser(authHeader: string | null) {
    if (!authHeader) {
        throw new Error('Authorization header is required');
    }
    
    const supabaseClient = createSupabaseClient(authHeader);
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
        throw new Error('Unauthorized. Please sign in.');
    }
    
    return { user, supabaseClient };
}
