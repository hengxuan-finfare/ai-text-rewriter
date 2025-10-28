import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iwinuithcugihfsgepgo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aW51aXRoY3VnaWhmc2dlcGdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjczNjgsImV4cCI6MjA3Njc0MzM2OH0.NOiIBFMjYfPCGmFfVakkgggeJjte8FY7UDISTS5OhP8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: {
      getItem: async (key) => {
        const result = await chrome.storage.local.get([key])
        return result[key] || null
      },
      setItem: async (key, value) => {
        await chrome.storage.local.set({ [key]: value })
      },
      removeItem: async (key) => {
        await chrome.storage.local.remove([key])
      }
    }
  }
})
