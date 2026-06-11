'use client'

import { useSession } from 'next-auth/react'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export function PostHogIdentifier() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      posthog.identify(session.user.id ?? session.user.email!, {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      })
    } else if (status === 'unauthenticated') {
      posthog.reset()
    }
  }, [status, session])

  return null
}
