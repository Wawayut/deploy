import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/lib/types'

export interface AuthState {
  token: string | null
  user: User | null
  hydrated: boolean
}

const initialState: AuthState = { token: null, user: null, hydrated: false }

export const SESSION_KEY = 'charms.session'

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionRestored(state, action: PayloadAction<{ token: string; user: User } | null>) {
      state.token = action.payload?.token ?? null
      state.user = action.payload?.user ?? null
      state.hydrated = true
    },
    signedIn(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token
      state.user = action.payload.user
    },
    signedOut(state) {
      state.token = null
      state.user = null
    },
  },
})

export const { sessionRestored, signedIn, signedOut } = authSlice.actions
export default authSlice.reducer
