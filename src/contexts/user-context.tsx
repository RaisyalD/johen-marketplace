"use client"

import { createContext, useContext } from "react"

type UserInfo = {
  email?: string
  full_name?: string | null
  role?: string | null
} | null

const UserContext = createContext<UserInfo>(null)

export function UserProvider({ user, children }: { user: UserInfo; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}