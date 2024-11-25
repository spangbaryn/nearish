import Sidebar from "@/components/sidebar-01"

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Sidebar>{children}</Sidebar>
} 