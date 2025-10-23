# Length Limitations

## Configuration

### Browser Extension (App.vue)
- **Minimum Length**: 10 characters
- **Maximum Length**: 5,000 characters

### Edge Function (validation.ts)
- **Minimum Length**: 10 characters
- **Maximum Length**: 5,000 characters

## Features

### Browser Extension
1. **Real-time Character Counter**: Shows current count vs. maximum
2. **Visual Feedback**:
   - Red border when over limit
   - Orange border when under minimum
   - Gray counter normally
   - Red counter when over limit
   - Orange counter when under minimum
3. **Button Disabled**: Send button is disabled when text is invalid
4. **Error Messages**: Clear error messages for validation failures

### Edge Function
1. **Server-side Validation**: Double-checks length limits
2. **Consistent Error Messages**: Returns same error format
3. **400 Status Code**: Returns appropriate HTTP status for validation errors

## Adjusting Limits

To change the limits, update these values:

### Browser Extension
File: `src/popup/App.vue`
```typescript
const MAX_LENGTH = 5000  // Change this
const MIN_LENGTH = 10    // Change this
```

### Edge Function
File: `supabase/functions/rewrite-text/validation.ts`
```typescript
export const MAX_TEXT_LENGTH = 5000  // Change this
export const MIN_TEXT_LENGTH = 10    // Change this
```

**Important**: Keep both values in sync!

## Why These Limits?

- **Minimum (10 chars)**: Ensures meaningful text for rewriting
- **Maximum (5,000 chars)**: 
  - Prevents API abuse
  - Controls costs (Gemini API charges per token)
  - Ensures reasonable response times
  - Typical paragraph/article length

## Testing

Test these scenarios:
1. Empty text → Error
2. 9 characters → Under limit error
3. 10 characters → Valid
4. 5,000 characters → Valid
5. 5,001 characters → Over limit error
