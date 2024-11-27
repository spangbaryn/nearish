import AuthenticatedLayout from "@/components/layouts/authenticated-layout"

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