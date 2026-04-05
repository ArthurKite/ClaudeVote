import { useEffect, useRef } from 'react'
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../store/useAppStore'
import type { Project } from '../types'

export function useFirestoreSync() {
  const _setProjects = useAppStore((s) => s._setProjects)
  const _setVotes = useAppStore((s) => s._setVotes)
  const updateCurrentUserName = useAppStore((s) => s.updateCurrentUserName)
  const logout = useAppStore((s) => s.logout)
  const currentUser = useAppStore((s) => s.currentUser)

  // Use refs to avoid stale closures in the snapshot listener
  const currentUserRef = useRef(currentUser)
  currentUserRef.current = currentUser
  const logoutRef = useRef(logout)
  logoutRef.current = logout
  const updateNameRef = useRef(updateCurrentUserName)
  updateNameRef.current = updateCurrentUserName

  useEffect(() => {
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    )
    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projects: Project[] = snapshot.docs.map((d) => {
        const data = d.data()
        return {
          id: d.id,
          url: data.url,
          title: data.title,
          owner: data.owner,
          thumbnailUrl: data.thumbnailUrl,
          votes: data.votes ?? 0,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          demoUrl: data.demoUrl ?? undefined,
        }
      })
      _setProjects(projects)
    })

    const unsubVotes = onSnapshot(collection(db, 'votes'), (snapshot) => {
      const votes: Record<string, string[]> = {}
      snapshot.docs.forEach((d) => {
        votes[d.id] = d.data().projectIds ?? []
      })
      _setVotes(votes)
    })

    return () => {
      unsubProjects()
      unsubVotes()
    }
  }, [_setProjects, _setVotes])

  // Subscribe to current user's session doc for name changes + kick detection
  useEffect(() => {
    const sessionId = sessionStorage.getItem('claudevote-session-id')
    if (!sessionId || !currentUser) return

    let initialLoad = true

    const unsubSession = onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
      if (!snap.exists()) {
        if (initialLoad) {
          initialLoad = false
          return
        }
        // If this was a voluntary logout, don't treat as kick
        if (sessionStorage.getItem('claudevote-voluntary-logout')) {
          sessionStorage.removeItem('claudevote-voluntary-logout')
          return
        }
        sessionStorage.setItem('claudevote-kicked', 'true')
        logoutRef.current()
        window.location.href = '/'
        return
      }
      initialLoad = false
      const data = snap.data()
      const serverName = data.playerName as string | undefined
      if (serverName && serverName !== currentUserRef.current?.name) {
        updateNameRef.current(serverName)
      }
    })

    return unsubSession
  }, [currentUser?.id])
}
