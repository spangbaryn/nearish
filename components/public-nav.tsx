import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [isRippling, setIsRippling] = React.useState(false)
  const [coords, setCoords] = React.useState({ x: -1, y: -1 })

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsRippling(true)
  }

  React.useEffect(() => {
    if (isRippling) {
      const timer = setTimeout(() => setIsRippling(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isRippling])

  return (
    <Link 
      href={href}
      className="relative text-sm font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground group"
      onClick={handleClick}
    >
      {children}
      <span className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-foreground scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
      {isRippling && (
        <span 
          className="absolute rounded-full bg-foreground/5 animate-ripple"
          style={{
            left: coords.x,
            top: coords.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </Link>
  )
}

export function PublicNav() {
  const { user } = useAuth()
  
  if (user) return null

  return (
    <nav className="flex items-center gap-8">
      <NavLink href="/business">Business Sign Up</NavLink>
      <NavLink href="/login">Login</NavLink>
    </nav>
  )
} 