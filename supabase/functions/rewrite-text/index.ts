import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateUser } from "./auth.ts";
import { rewriteWithGemini } from "./gemini.ts";
import { saveRewriteRequest } from "./database.ts";
import { corsResponse, errorResponse, successResponse } from "./utils.ts";
import { validateRequestText } from "./validation.ts";

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return corsResponse();
    }

    try {
        // Authenticate user
        const authHeader = req.headers.get('Authorization');
        const { user, supabaseClient } = await authenticateUser(authHeader);

        // Parse and validate request body
        const { requestText, tone } = await req.json();
        const validation = validateRequestText(requestText);
        if (!validation.isValid) {
            return errorResponse(validation.error, 400);
        }

        // Rewrite text using Gemini
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
        const { responseText, fullPrompt } = await rewriteWithGemini(
            requestText,
            geminiApiKey,
            tone
        );

        // Save to database
        const data = await saveRewriteRequest(
            supabaseClient,
            requestText,
            responseText,
            user.id,
            fullPrompt,
            tone
        );

        // Return success response
        return successResponse({
            id: data.id,
            requestText: data.request_text,
            responseText: data.response_text,
            createdAt: data.created_at
        });
    } catch (error) {
        console.error('Error:', error);
        const statusCode = error.message.includes('Unauthorized') || 
                          error.message.includes('Authorization') ? 401 : 500;
        return errorResponse(error.message || 'An error occurred', statusCode);
    }
});
