import AuthenticatedLayout from "@/components/features/auth/authenticated-layout"

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthenticatedLayout requiredRoles={['user']}>
      {children}
    </AuthenticatedLayout>
  )
} 