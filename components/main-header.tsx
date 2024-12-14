"use client"

import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
  User,
  Settings,
  Bell,
  LogOut,
  Mail
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function MainHeader() {
  const { user, signOut } = useAuth()
  
  const initials = user?.email
    ?.split('@')[0]
    ?.split('.')
    ?.map(n => n[0])
    ?.join('')
    ?.toUpperCase() ?? '?'
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b bg-sidebar px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
        </div>
        <Card className="flex items-center px-2 py-1 bg-white transition-shadow hover:shadow-md">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-sm hover:bg-transparent focus:bg-transparent active:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url ?? ''} alt={user?.email ?? ''} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-foreground hover:text-foreground">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      </div>
    </header>
  )
} 