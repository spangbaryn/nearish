import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, Building2, Settings, Menu, LogOut, Mail, SendHorizontal, FolderOpen, Palette, Sparkles, FileText, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getUserBusinesses } from "@/lib/business"
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

export function MainSidebar() {
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data: businesses } = useQuery({
    queryKey: ['user-businesses'],
    queryFn: () => getUserBusinesses(user?.id!),
    enabled: !!user?.id,
  })

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
    <Sidebar className="pt-14">
      <SidebarContent>
        {routes.map((section) => (
          <SidebarGroup key={section.title ?? section.id}>
            <SidebarGroupLabel>
              {section.title ?? section.name}
            </SidebarGroupLabel>
            {section.items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton>
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
} 