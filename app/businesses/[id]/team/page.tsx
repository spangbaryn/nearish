"use client"

import { TeamMembersList } from "./components/team-members-list"
import { InviteMemberDialog } from "./components/invite-member-dialog"
import { useParams } from "next/navigation"
import { PendingInvites } from "./components/pending-invites"
import { useAuth } from "@/lib/auth-context"

export default function TeamPage() {
  const { user } = useAuth()
  const params = useParams()
  const businessId = params.id as string

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Management</h1>
        {(user && typeof user.id === 'string' && user.id.trim().length > 0) ? <InviteMemberDialog businessId={businessId} /> : null}
      </div>
      <PendingInvites businessId={businessId} />
      <TeamMembersList businessId={businessId} />
    </div>
  )
} 