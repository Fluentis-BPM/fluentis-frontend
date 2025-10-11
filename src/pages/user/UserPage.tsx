"use client"

import UserProfile from "@/components/user/UserProfile"

export default function UserPage(){
    return (
        <main className="flex-1 overflow-auto p-6">
              <UserProfile />
        </main>
    )
}