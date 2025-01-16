export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/50 via-background to-muted/50">
      {children}
    </div>
  )
} 