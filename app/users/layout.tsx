'use client'

import AuthenticatedLayout from "@/components/layouts/authenticated-layout"

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