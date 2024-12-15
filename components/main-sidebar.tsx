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
import { LayoutDashboard, Users, Building2, Settings, Menu, LogOut, Mail, SendHorizontal, FolderOpen, Palette, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { getUserBusinesses } from "@/lib/business"
import type { BusinessRole } from '@/types/auth'

interface BusinessRoute {
  id: string
  name: string
  role: BusinessRole
  items: {
    title: string
    href: string
    icon: LucideIcon
  }[]
}

export function MainSidebar() {
  const { user, signOut } = useAuth()
  const isAdmin = user?.role === 'admin'

  const { data: businesses } = useQuery({
    queryKey: ['user-businesses'],
    queryFn: () => getUserBusinesses(user?.id!),
    enabled: !!user?.id,
  })

  const getBusinessRoutes = (businesses: Awaited<ReturnType<typeof getUserBusinesses>>) => {
    return businesses?.map(({ business, role }) => ({
      id: business.id,
      name: business.name,
      role,
      items: [
        { 
          title: "Dashboard", 
          href: `/businesses/${business.id}`, 
          icon: LayoutDashboard 
        },
        ...(role === 'owner' || role === 'admin' ? [
          { 
            title: "Settings", 
            href: `/businesses/${business.id}/settings`, 
            icon: Settings 
          },
          { 
            title: "Team", 
            href: `/businesses/${business.id}/team`, 
            icon: Users 
          }
        ] : []),
        { 
          title: "Posts", 
          href: `/businesses/${business.id}/posts`, 
          icon: FileText 
        }
      ]
    })) ?? []
  }

  const routes = [
    ...getBusinessRoutes(businesses),
    ...(isAdmin ? [{
      title: "Admin Tools",
      items: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Users", href: "/admin/users", icon: Users },
        { title: "Templates", href: "/admin/templates", icon: Mail },
        { title: "Campaigns", href: "/admin/campaigns", icon: SendHorizontal },
        { title: "Collections", href: "/admin/collections", icon: FolderOpen },
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

      <SidebarFooter className="border-t p-4">
        <div className="flex flex-col gap-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sm text-muted-foreground hover:text-foreground"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
} 