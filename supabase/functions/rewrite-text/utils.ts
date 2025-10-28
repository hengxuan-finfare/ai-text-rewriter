const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
        },
        status
    });
}
export function corsResponse() {
    return new Response('ok', {
        headers: corsHeaders
    });
}
export function errorResponse(message, status = 500) {
    return jsonResponse({
        success: false,
        error: message
    }, status);
}
export function successResponse(data) {
    return jsonResponse({
        success: true,
        data
    }, 200);
}
