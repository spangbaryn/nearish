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
import { LayoutDashboard, Users, Building2, Settings, Menu, LogOut, Mail, SendHorizontal, FolderOpen, Palette, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MainSidebar() {
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canAccessBusiness = user?.role === 'business' || isAdmin;

  const routes = [
    ...(canAccessBusiness ? [{
      title: "Business",
      items: [
        { title: "All Businesses", href: "/businesses", icon: Building2 },
        { title: "Management", href: "/businesses/manage", icon: Building2 },
      ],
    }] : []),
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
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
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