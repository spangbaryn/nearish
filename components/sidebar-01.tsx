"use client"

import * as React from "react"
import { LogOut, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

import { Protected } from "@/components/auth/protected"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ROLES, UserRole } from "@/lib/roles"

interface SidebarComponentProps {
  children: React.ReactNode
}

interface NavigationItem {
  title: string
  url: string
  icon?: React.ReactNode
  requiredRoles: UserRole[]
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

const navigationItems: NavigationSection[] = [
  {
    title: "General",
    items: [
      {
        title: "Home",
        url: "/home",
        requiredRoles: [ROLES.USER],
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        title: "Users",
        url: "/users",
        icon: <Users className="h-5 w-5" />,
        requiredRoles: [ROLES.ADMIN],
      },
    ],
  },
]

export default function SidebarComponent({ children }: SidebarComponentProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Logo size="md" className="bg-sidebar-primary text-sidebar-primary-foreground" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-lg">Nearish</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="flex flex-col justify-between">
          <div>
            {navigationItems.map((section) => (
              <Protected 
                key={section.title} 
                requiredRoles={section.items.map(item => item.requiredRoles).flat() as UserRole[]}
              >
                <SidebarGroup>
                  <SidebarGroupLabel className="text-base font-medium px-2 py-2">
                    {section.title}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => (
                        <Protected key={item.title} requiredRoles={item.requiredRoles}>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <Link href={item.url} className="flex items-center gap-2 text-base">
                                {item.icon}
                                {item.title}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </Protected>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </Protected>
            ))}
          </div>
          <div className="px-2 pb-4">
              <Button
              variant="ghost" 
              className="w-full justify-start gap-2 text-base" 
              onClick={handleSignOut}
              >
              <LogOut className="h-5 w-5" />
              Sign Out
              </Button>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-base">Home</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

