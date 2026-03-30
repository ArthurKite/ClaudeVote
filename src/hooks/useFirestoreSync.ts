import { useEffect } from 'react'
import {
  collection,
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

  useEffect(() => {
    // Subscribe to projects collection
    const projectsQuery = query(
      collection(db, 'projects'),
      orderBy('createdAt', 'desc')
    )
    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projects: Project[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
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
      snapshot.docs.forEach((doc) => {
        votes[doc.id] = doc.data().projectIds ?? []
      })
      _setVotes(votes)
    })

    return () => {
      unsubProjects()
      unsubVotes()
    }
  }, [_setProjects, _setVotes])
}
