import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { rewriteWithGemini } from "./gemini.ts"
import { createSupabaseClient, saveRewriteRequest } from "./database.ts"
import { corsResponse, errorResponse, successResponse } from "./utils.ts"
import { validateRequestText } from "./validation.ts"
import type { RewriteRequest } from "./types.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return corsResponse()
  }

  try {
    // Parse request body
    const { requestText, userId }: RewriteRequest = await req.json()

    // Validate request text
    const validation = validateRequestText(requestText)
    if (!validation.isValid) {
      return errorResponse(validation.error!, 400)
    }

    // Initialize clients
    const supabaseClient = createSupabaseClient(req.headers.get('Authorization'))
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ''

    // Rewrite text using Gemini
    const responseText = await rewriteWithGemini(requestText, geminiApiKey)

    // Save to database
    const data = await saveRewriteRequest(
      supabaseClient,
      requestText,
      responseText,
      userId || null
    )

    // Return success response
    return successResponse({
      id: data.id,
      requestText: data.request_text,
      responseText: data.response_text,
      createdAt: data.created_at,
    })

  } catch (error) {
    console.error('Error:', error)
    return errorResponse(error.message || 'An error occurred')
  }
})
