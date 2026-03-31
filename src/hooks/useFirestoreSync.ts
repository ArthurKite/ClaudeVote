import { useEffect } from 'react'
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
  const currentUser = useAppStore((s) => s.currentUser)

  useEffect(() => {
    // Subscribe to projects collection
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
        }
      })
      _setProjects(projects)
    })

    // Subscribe to votes collection
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

  // Subscribe to current user's session doc for name changes
  useEffect(() => {
    const sessionId = sessionStorage.getItem('claudevote-session-id')
    if (!sessionId || !currentUser) return

    const unsubSession = onSnapshot(doc(db, 'sessions', sessionId), (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      const serverName = data.playerName as string | undefined
      if (serverName && serverName !== currentUser.name) {
        updateCurrentUserName(serverName)
      }
    })

    return unsubSession
  }, [currentUser?.id, updateCurrentUserName])
}
