export const MAX_TEXT_LENGTH = 5000
export const MIN_TEXT_LENGTH = 7

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export function validateRequestText(text: string): ValidationResult {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: 'requestText is required'
    }
  }

  const length = text.length

  if (length < MIN_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Text must be at least ${MIN_TEXT_LENGTH} characters`
    }
  }

  if (length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Text must not exceed ${MAX_TEXT_LENGTH} characters`
    }
  }

  return { isValid: true }
}
