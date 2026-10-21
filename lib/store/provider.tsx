'use client'

import { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './index'
import { SESSION_KEY, sessionRestored } from './auth-slice'
import { charmsApi } from './api'

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore)

  useEffect(() => {
    let saved = null
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      saved = raw ? JSON.parse(raw) : null
    } catch {
      saved = null
    }
    store.dispatch(sessionRestored(saved))

    let lastToken = store.getState().auth.token
    return store.subscribe(() => {
      const { token, user, hydrated } = store.getState().auth
      if (!hydrated || token === lastToken) return
      lastToken = token
      if (token && user) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, user }))
      else {
        sessionStorage.removeItem(SESSION_KEY)
        store.dispatch(charmsApi.util.resetApiState())
      }
    })
  }, [store])

  return <Provider store={store}>{children}</Provider>
}
