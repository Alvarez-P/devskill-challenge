export type Friend = { 
  "name"?: string
  "id"?: string
}

export type User = {
  "id"?: string
  "friends"?: Friend[]
}

export type Position = {
  wordOffset: number
  from: number
  to: number
}

export type QueryMatch = {
  friendId: string
  positions: Position[]
}
