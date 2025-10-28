import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const user = ref(null)
  const session = ref(null)
  const loading = ref(true)

  const initAuth = async () => {
    try {
      // Get initial session
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error
      
      return data
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      session.value = data.session
      user.value = data.user
      
      return data
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
      session.value = null
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const getAccessToken = () => {
    return session.value?.access_token
  }

  return {
    user,
    session,
    loading,
    initAuth,
    signUp,
    signIn,
    signOut,
    getAccessToken
  }
}
