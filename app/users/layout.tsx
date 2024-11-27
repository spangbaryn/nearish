'use client'

import AuthenticatedLayout from "@/components/features/auth/authenticated-layout"

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout requiredRoles={['admin']}>
      {children}
    </AuthenticatedLayout>
  )
} 