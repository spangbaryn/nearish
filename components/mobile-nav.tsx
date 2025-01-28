import { useAuth } from "@/lib/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { getUserBusinesses } from "@/lib/business"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { LayoutDashboard, Settings, Users, FileText, Mail, SendHorizontal, FolderOpen, MapPin, Sparkles, Palette, Store } from "lucide-react"
import type { BusinessRole } from '@/types/auth'
import type { LucideIcon } from "lucide-react"

interface BusinessRoute {
  id: string
  title?: string
  name: string
  role: BusinessRole
  items: {
    title: string
    href: string
    icon: LucideIcon
  }[]
}

interface AdminRoute {
  id?: string
  title: string
  name?: string
  items: {
    title: string
    href: string
    icon: LucideIcon
  }[]
}

type RouteSection = BusinessRoute | AdminRoute

interface MobileNavProps {
  onNavigate: () => void
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data: businesses } = useQuery({
    queryKey: ['user-businesses'],
    queryFn: () => getUserBusinesses(user?.id!),
    enabled: !!user?.id,
  })

  // Reuse the same route generation logic from MainSidebar
  const getBusinessRoutes = (businesses: Awaited<ReturnType<typeof getUserBusinesses>> | undefined) => {
    if (!businesses) return []
    return businesses.map(({ business, role }) => ({
      id: business.id,
      name: business.name,
      role,
      items: [
        { 
          title: "Dashboard", 
          href: `/businesses/${business.id}`, 
          icon: LayoutDashboard 
        },
        {
          title: "Business Page",
          href: `/businesses/${business.id}/profile`,
          icon: Store
        },
        { 
          title: "Settings", 
          href: `/businesses/${business.id}/settings`, 
          icon: Settings 
        },
        { 
          title: "Team", 
          href: `/businesses/${business.id}/team`, 
          icon: Users 
        },
        { 
          title: "Posts", 
          href: `/businesses/${business.id}/posts`, 
          icon: FileText 
        }
      ]
    }))
  }

  const routes: RouteSection[] = [
    ...getBusinessRoutes(businesses),
    ...(isAdmin ? [{
      title: "Admin Tools",
      name: "Admin",
      items: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Users", href: "/admin/users", icon: Users },
        { title: "Templates", href: "/admin/templates", icon: Mail },
        { title: "Campaigns", href: "/admin/campaigns", icon: SendHorizontal },
        { title: "Collections", href: "/admin/collections", icon: FolderOpen },
        { title: "Zip Codes", href: "/admin/zip-codes", icon: MapPin },
        { title: "AI Prompts", href: "/admin/prompts", icon: Sparkles },
        { title: "UI Kit", href: "/admin/ui-kit", icon: Palette },
      ],
    }] : [])
  ]

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-3">
          {routes.map((section) => (
            <div key={section.title ?? section.id} className="space-y-1">
              <h4 className="font-medium text-sm text-muted-foreground px-2">
                {section.title ?? section.name}
              </h4>
              <nav className="space-y-0.5">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href} onClick={onNavigate}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 