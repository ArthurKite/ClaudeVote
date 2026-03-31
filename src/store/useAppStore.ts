import { create } from 'zustand'
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { User, Project } from '../types'

// Clear old localStorage data from persist middleware
localStorage.removeItem('claudevote-store')

interface AppState {
  currentUser: User | null
  projects: Project[]
  votes: Record<string, string[]>

  registerUser: (name: string, role: 'player' | 'admin' | 'superadmin') => void
  logout: () => Promise<void>
  addProject: (url: string, title: string, owner: string) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  toggleVote: (projectId: string) => Promise<string | void>
  getVotesForUser: (userId: string) => string[]

  updateCurrentUserName: (newName: string) => void

  // Internal setters for real-time sync
  _setProjects: (projects: Project[]) => void
  _setVotes: (votes: Record<string, string[]>) => void
}

export const useAppStore = create<AppState>()((set, get) => ({
  currentUser: (() => {
    const stored = sessionStorage.getItem('claudevote-user')
    return stored ? JSON.parse(stored) : null
  })(),
  projects: [],
  votes: {},

  registerUser: (name, role) => {
    const user: User = { id: crypto.randomUUID(), name, role }
    sessionStorage.setItem('claudevote-user', JSON.stringify(user))
    set({ currentUser: user })
  },

  logout: async () => {
    // Remove session doc if exists
    const sessionId = sessionStorage.getItem('claudevote-session-id')
    if (sessionId) {
      try {
        await deleteDoc(doc(db, 'sessions', sessionId))
      } catch {
        // Best-effort cleanup
      }
      sessionStorage.removeItem('claudevote-session-id')
    }
    sessionStorage.removeItem('claudevote-user')
    set({ currentUser: null })
  },

  addProject: async (url, title, owner) => {
    const thumbnailUrl = `/api/screenshot?url=${encodeURIComponent(url)}`
    const docRef = await addDoc(collection(db, 'projects'), {
      url,
      title,
      owner,
      thumbnailUrl,
      votes: 0,
      createdAt: Timestamp.now(),
    })
    // Update the doc to store its own ID
    await updateDoc(docRef, { id: docRef.id })
  },

  deleteProject: async (projectId) => {
    // Delete the project doc
    await deleteDoc(doc(db, 'projects', projectId))

    // Clean up votes referencing this project
    const { votes } = get()
    for (const [userId, projectIds] of Object.entries(votes)) {
      if (projectIds.includes(projectId)) {
        const voteRef = doc(db, 'votes', userId)
        await updateDoc(voteRef, {
          projectIds: arrayRemove(projectId),
        })
      }
    }
  },

  toggleVote: async (projectId) => {
    const { currentUser } = get()
    if (!currentUser) return

    // Check if project still exists before attempting vote
    const projectRef = doc(db, 'projects', projectId)
    const projectCheck = await getDoc(projectRef)
    if (!projectCheck.exists()) return 'project_deleted'

    const userVotes = get().votes[currentUser.id] ?? []
    const alreadyVoted = userVotes.includes(projectId)
    const voteRef = doc(db, 'votes', currentUser.id)

    if (alreadyVoted) {
      await runTransaction(db, async (transaction) => {
        const projectSnap = await transaction.get(projectRef)
        if (!projectSnap.exists()) return
        const currentVotes = projectSnap.data().votes ?? 0
        transaction.update(projectRef, { votes: Math.max(0, currentVotes - 1) })
        transaction.set(
          voteRef,
          { projectIds: arrayRemove(projectId) },
          { merge: true }
        )
      })
    } else {
      if (userVotes.length >= 3) return 'max_reached'
      await runTransaction(db, async (transaction) => {
        const projectSnap = await transaction.get(projectRef)
        if (!projectSnap.exists()) return
        const currentVotes = projectSnap.data().votes ?? 0
        transaction.update(projectRef, { votes: currentVotes + 1 })
        transaction.set(
          voteRef,
          { projectIds: arrayUnion(projectId) },
          { merge: true }
        )
      })
    }
  },

  getVotesForUser: (userId) => {
    return get().votes[userId] ?? []
  },

  updateCurrentUserName: (newName) => {
    const { currentUser } = get()
    if (!currentUser) return
    const updated = { ...currentUser, name: newName }
    sessionStorage.setItem('claudevote-user', JSON.stringify(updated))
    set({ currentUser: updated })
  },

  _setProjects: (projects) => set({ projects }),
  _setVotes: (votes) => set({ votes }),
}))
