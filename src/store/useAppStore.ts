import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Project } from '../types'

interface AppState {
  currentUser: User | null
  projects: Project[]
  votes: Record<string, string[]>

  registerUser: (name: string, role: 'player' | 'admin') => void
  logout: () => void
  addProject: (url: string, title: string, owner: string) => void
  toggleVote: (projectId: string) => string | void
  getVotesForUser: (userId: string) => string[]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      projects: [],
      votes: {},

      registerUser: (name, role) => {
        const user: User = { id: crypto.randomUUID(), name, role }
        set({ currentUser: user })
      },

      logout: () => set({ currentUser: null }),

      addProject: (url, title, owner) => {
        const thumbnailUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
        const project: Project = {
          id: crypto.randomUUID(),
          url,
          title,
          owner,
          thumbnailUrl,
          votes: 0,
          createdAt: new Date(),
        }
        set((state) => ({ projects: [...state.projects, project] }))
      },

      toggleVote: (projectId) => {
        const { currentUser, votes, projects } = get()
        if (!currentUser) return

        const userVotes = votes[currentUser.id] ?? []
        const alreadyVoted = userVotes.includes(projectId)

        if (alreadyVoted) {
          set({
            votes: {
              ...votes,
              [currentUser.id]: userVotes.filter((id) => id !== projectId),
            },
            projects: projects.map((p) =>
              p.id === projectId ? { ...p, votes: p.votes - 1 } : p
            ),
          })
        } else {
          if (userVotes.length >= 3) return 'max_reached'
          set({
            votes: {
              ...votes,
              [currentUser.id]: [...userVotes, projectId],
            },
            projects: projects.map((p) =>
              p.id === projectId ? { ...p, votes: p.votes + 1 } : p
            ),
          })
        }
      },

      getVotesForUser: (userId) => {
        return get().votes[userId] ?? []
      },
    }),
    { name: 'claudevote-store' }
  )
)
