import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
export function createSupabaseClient(authHeader) {
    return createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
        global: {
            headers: {
                Authorization: authHeader
            }
        }
    });
}
export async function saveRewriteRequest(client, requestText, responseText, userId, prompt, tone) {
    const { data, error } = await client.from('rewrite_requests').insert({
        request_text: requestText,
        response_text: responseText,
        user_id: userId || null,
        status: 'completed',
        prompt: prompt,
        tone: tone || null,
        metadata: {
            model: 'gemini-2.0-flash-exp'
        }
    }).select().single();
    if (error) {
        throw error;
    }
    return data;
}
