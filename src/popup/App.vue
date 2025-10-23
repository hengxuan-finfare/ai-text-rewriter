<script setup>
import { ref, computed } from 'vue'

const inputText = ref('')
const responseText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const SUPABASE_URL = 'https://iwinuithcugihfsgepgo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aW51aXRoY3VnaWhmc2dlcGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjczNjgsImV4cCI6MjA3Njc0MzM2OH0.NOiIBFMjYfPCGmFfVakkgggeJjte8FY7UDISTS5OhP8' // Replace with your actual anon key

const MAX_LENGTH = 5000
const MIN_LENGTH = 7

const characterCount = computed(() => inputText.value.length)
const isOverLimit = computed(() => characterCount.value > MAX_LENGTH)
const isUnderLimit = computed(() => characterCount.value < MIN_LENGTH && characterCount.value > 0)
const copySuccess = ref(false)

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(responseText.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const handleSend = async () => {
  if (!inputText.value.trim()) return

  // Validate length
  if (characterCount.value < MIN_LENGTH) {
    errorMessage.value = `Text must be at least ${MIN_LENGTH} characters`
    return
  }

  if (characterCount.value > MAX_LENGTH) {
    errorMessage.value = `Text must not exceed ${MAX_LENGTH} characters`
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  responseText.value = ''

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/rewrite-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        requestText: inputText.value,
        userId: null,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to rewrite text')
    }

    responseText.value = data.data.responseText
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred'
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="popup-container">
    <div class="header">
      <h1>Rewrite for Me</h1>
    </div>

    <div class="input-section">
      <textarea v-model="inputText" placeholder="Enter text to rewrite..." rows="4" class="text-input"
        :class="{ 'input-error': isOverLimit, 'input-warning': isUnderLimit }" :maxlength="MAX_LENGTH + 100"></textarea>

      <div class="character-count" :class="{ 'count-error': isOverLimit, 'count-warning': isUnderLimit }">
        {{ characterCount }} / {{ MAX_LENGTH }} characters
        <span v-if="isOverLimit"> ({{ characterCount - MAX_LENGTH }} over limit)</span>
        <span v-if="isUnderLimit"> (minimum {{ MIN_LENGTH }})</span>
      </div>

      <button @click="handleSend" :disabled="!inputText.trim() || isLoading || isOverLimit || isUnderLimit"
        class="send-button">
        {{ isLoading ? 'Sending...' : 'Send' }}
      </button>
    </div>

    <div class="error-section" v-if="errorMessage">
      <div class="error-content">
        ⚠️ {{ errorMessage }}
      </div>
    </div>

    <div class="response-section" v-if="responseText">
      <div class="response-header">
        <h2>Response</h2>
        <button @click="copyToClipboard" class="copy-button" :class="{ 'copied': copySuccess }">
          {{ copySuccess ? '✓ Copied' : 'Copy' }}
        </button>
      </div>
      <div class="response-content">
        {{ responseText }}
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.popup-container {
  width: 400px;
  min-height: 300px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: white;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: lightcoral;
  padding: 20px;
  text-align: center;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
}

.input-section {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  margin-bottom: 8px;
}

.text-input:focus {
  outline: none;
  border-color: #667eea;
}

.text-input.input-error {
  border-color: #ef4444;
}

.text-input.input-warning {
  border-color: #f59e0b;
}

.character-count {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
  margin-bottom: 12px;
  transition: color 0.2s;
}

.character-count.count-error {
  color: #ef4444;
  font-weight: 600;
}

.character-count.count-warning {
  color: #f59e0b;
}

.send-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.send-button:hover:not(:disabled) {
  opacity: 0.9;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-section {
  padding: 20px;
  padding-top: 0;
}

.error-content {
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 14px;
  color: #991b1b;
  line-height: 1.6;
}

.response-section {
  padding: 20px;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.response-section h2 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.copy-button {
  padding: 6px 12px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-button:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.copy-button.copied {
  background: #d1fae5;
  color: #065f46;
  border-color: #6ee7b7;
}

.response-content {
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
