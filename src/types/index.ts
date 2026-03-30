export type User = {
  id: string
  name: string
  role: 'player' | 'admin'
}

export type Project = {
  id: string
  url: string
  title: string
  owner: string
  thumbnailUrl: string
  votes: number
  createdAt: Date
}
