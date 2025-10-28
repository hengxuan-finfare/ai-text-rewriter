<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { user, loading: authLoading, initAuth, signUp, signIn, signOut, getAccessToken } = useAuth()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const authError = ref('')

const inputText = ref('')
const responseText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const selectedTone = ref('professional')

const SUPABASE_URL = 'https://iwinuithcugihfsgepgo.supabase.co'

onMounted(async () => {
  await initAuth()
})

const MAX_LENGTH = 5000
const MIN_LENGTH = 7

const toneOptions = [
  { value: 'formal', label: 'Formal', description: 'Very polished, official' },
  { value: 'professional', label: 'Professional', description: 'Business-appropriate' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'concise', label: 'Concise', description: 'Brief and direct' },
  { value: 'creative', label: 'Creative', description: 'Engaging and imaginative' },
]

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

const handleAuth = async () => {
  if (!email.value || !password.value) {
    authError.value = 'Please enter email and password'
    return
  }

  try {
    authError.value = ''
    errorMessage.value = ''
    
    if (isSignUp.value) {
      const { user: newUser } = await signUp(email.value, password.value)
      if (newUser) {
        authError.value = 'Account created! Please check your email to verify.'
      }
    } else {
      await signIn(email.value, password.value)
    }
    
    // Clear form
    email.value = ''
    password.value = ''
  } catch (error) {
    authError.value = error.message || (isSignUp.value ? 'Failed to sign up' : 'Failed to sign in')
    console.error('Auth error:', error)
  }
}

const toggleAuthMode = () => {
  isSignUp.value = !isSignUp.value
  authError.value = ''
  email.value = ''
  password.value = ''
}

const handleLogout = async () => {
  try {
    errorMessage.value = ''
    await signOut()
    responseText.value = ''
    inputText.value = ''
  } catch (error) {
    errorMessage.value = 'Failed to sign out. Please try again.'
    console.error('Logout error:', error)
  }
}

const handleSend = async () => {
  if (!inputText.value.trim()) return

  // Check if user is authenticated
  if (!user.value) {
    errorMessage.value = 'Please sign in to use this feature'
    return
  }

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
    const accessToken = getAccessToken()
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/rewrite-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requestText: inputText.value,
        userId: user.value.id,
        tone: selectedTone.value,
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
      <div v-if="!authLoading && user" class="user-info">
        <span class="user-email">{{ user.email }}</span>
        <button @click="handleLogout" class="logout-button">Sign Out</button>
      </div>
    </div>

    <!-- Loading Screen -->
    <div v-if="authLoading" class="loading-section">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Login Screen -->
    <div v-else-if="!user" class="login-section">
      <div class="login-content">
        <h2>{{ isSignUp ? 'Create Account' : 'Sign In' }}</h2>
        <p>{{ isSignUp ? 'Sign up to start using the text rewriter' : 'Sign in to continue' }}</p>
        
        <form @submit.prevent="handleAuth" class="auth-form">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="auth-input"
            required
          />
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="auth-input"
            required
            minlength="6"
          />
          
          <div v-if="authError" class="auth-error">
            {{ authError }}
          </div>
          
          <button type="submit" class="auth-button">
            {{ isSignUp ? 'Sign Up' : 'Sign In' }}
          </button>
        </form>
        
<!--        <button @click="toggleAuthMode" class="toggle-auth">-->
<!--          {{ isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }}-->
<!--        </button>-->
      </div>
    </div>

    <!-- Main App (only shown when authenticated) -->
    <div v-else class="input-section">
      <textarea v-model="inputText" placeholder="Enter text to rewrite..." rows="4" class="text-input"
        :class="{ 'input-error': isOverLimit, 'input-warning': isUnderLimit }" :maxlength="MAX_LENGTH + 100"></textarea>

      <div class="character-count" :class="{ 'count-error': isOverLimit, 'count-warning': isUnderLimit }">
        {{ characterCount }} / {{ MAX_LENGTH }} characters
        <span v-if="isOverLimit"> ({{ characterCount - MAX_LENGTH }} over limit)</span>
        <span v-if="isUnderLimit"> (minimum {{ MIN_LENGTH }})</span>
      </div>

      <div class="tone-section">
        <span class="tone-label">Tone:</span>
        <div class="tone-options">
          <button
            v-for="tone in toneOptions"
            :key="tone.value"
            @click="selectedTone = tone.value"
            :class="['tone-button', { 'tone-active': selectedTone === tone.value }]"
            :title="tone.description"
          >
            {{ tone.label }}
          </button>
        </div>
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
  background: #000000;
  color: #ffffff;
  padding: 20px;
}

.header h1 {
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
}

.user-email {
  color: #ffffff;
  opacity: 0.9;
}

.logout-button {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.loading-section {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #000000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-section p {
  font-size: 14px;
  color: #6b7280;
}

.login-section {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.login-content {
  text-align: center;
  max-width: 300px;
}

.login-content h2 {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 12px;
}

.login-content p {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 24px;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-bottom: 16px;
}

.auth-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.auth-input:focus {
  outline: none;
  border-color: #000000;
}

.auth-error {
  padding: 8px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  font-size: 12px;
  color: #991b1b;
  line-height: 1.4;
}

.auth-button {
  width: 100%;
  padding: 12px 24px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.auth-button:hover {
  opacity: 0.9;
}

.toggle-auth {
  width: 100%;
  padding: 8px;
  background: transparent;
  color: #000000;
  border: none;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  transition: opacity 0.2s;
}

.toggle-auth:hover {
  opacity: 0.7;
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
  border-color: #000000;
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

.tone-section {
  margin-bottom: 16px;
}

.tone-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 8px;
}

.tone-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tone-button {
  padding: 6px 12px;
  background: #ffffff;
  color: #000000;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tone-button:hover {
  border-color: #000000;
  background: #f9fafb;
}

.tone-button.tone-active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.send-button {
  width: 100%;
  padding: 12px;
  background: #000000;
  color: #ffffff;
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
  color: #000000;
  margin: 0;
}

.copy-button {
  padding: 6px 12px;
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-button:hover {
  background: #000000;
  color: #ffffff;
}

.copy-button.copied {
  background: #000000;
  color: #ffffff;
}

.response-content {
  padding: 16px;
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 8px;
  font-size: 14px;
  color: #000000;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
