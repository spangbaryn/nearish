'use client'

import { useAuthorization } from "@/components/hooks/use-authorization"
import { ROLES } from "@/lib/roles"
import { redirect } from "next/navigation"

export default function UsersPage() {
  const { checkAccess } = useAuthorization()

  if (!checkAccess([ROLES.ADMIN])) {
    redirect('/unauthorized')
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-2 text-muted-foreground">
        This page is only accessible to administrators.
      </p>
    </div>
  )
} 