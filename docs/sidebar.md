# **Sidebar Component Documentation**

### **Overview**

A comprehensive sidebar solution built with React and Tailwind CSS, following shadcn/ui principles.

### **Application Integration**

- **Provider Setup**

The sidebar requires wrapping your application layout with SidebarProvider:

layout.tsxApply

import { SidebarProvider } from "@/components/ui/sidebar"

export default function RootLayout({ *children* }) {

return (

<SidebarProvider>

<div *className*="flex h-screen">

<MainSidebar />

<main *className*="flex-1">{children}</main>

</div>

</SidebarProvider>

)

}

- **Authentication Integration**

The sidebar integrates with your auth context for role-based navigation:

export function MainSidebar() {

const { user } = useAuth();

const isAdmin = user?.role === 'admin';

- **Route Configuration**

Define your navigation structure with optional role-based sections:

const routes = [

{ title: "All Businesses", href: "/businesses", icon: Building2 },

title: "Business",

items: [

{ title: "All Businesses", href: "/businesses", icon: Building2 },

{ title: "Registration", href: "/businesses/register", icon: Building2 },

{ title: "Management", href: "/businesses/manage", icon: Building2 },

],

},

...(isAdmin ? [{

title: "Admin Tools",

items: [

{ title: "Dashboard", href: "/admin", icon: LayoutDashboard },

{ title: "Users", href: "/admin/users", icon: Users },

{ title: "Settings", href: "/admin/settings", icon: Settings },

],

}] : [])

]

- **Layout Structure**

The sidebar follows a three-section layout pattern:

- Header with app branding and collapse trigger
- Content with navigation groups
- Footer with user information

return (

<Sidebar>

<SidebarHeader *className*="border-b px-6 py-3">

<div *className*="flex items-center justify-between">

<h1 *className*="text-xl font-semibold">Nearish</h1>

<SidebarTrigger>

<Menu *className*="h-4 w-4" />

</SidebarTrigger>

</div>

</SidebarHeader>

<item.icon *className*="h-4 w-4" />

<SidebarContent>

{routes.map((*section*) => (

<SidebarGroup *key*={section.title}>

<SidebarGroupLabel>{section.title}</SidebarGroupLabel>

{section.items.map((*item*) => (

<SidebarMenuItem *key*={item.href}>

<Link *href*={item.href}>

<SidebarMenuButton>

<item.icon *className*="h-4 w-4" />

{item.title}

</SidebarMenuButton>

</Link>

</SidebarMenuItem>

))}

</SidebarGroup>

))}

</SidebarContent>

<SidebarFooter *className*="border-t p-4">

<div *className*="flex items-center gap-2">

<div *className*="flex-1">

<p *className*="text-sm">{user?.email}</p>

</div>

</div>

</SidebarFooter>

</Sidebar>

)

### **State Management**

- **Context Usage**

Access sidebar state anywhere in your app:

import { useSidebar } from "@/components/ui/sidebar"

function MyComponent() {

const { open, toggleSidebar } = useSidebar()

*// Use sidebar state*

}

- **Persistence**

Sidebar state is automatically persisted via cookies:

*// This sets the cookie to keep the sidebar state.*

document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`

},

- **Keyboard Controls**

Global keyboard shortcuts are automatically registered:

React.useEffect(() => {

const handleKeyDown = (*event*: KeyboardEvent) => {

if (

event.key === SIDEBAR_KEYBOARD_SHORTCUT &&

(event.metaKey || event.ctrlKey)

) {

### **Mobile Responsiveness**

- **Mobile Detection**

Uses a custom hook to detect mobile devices:

const isMobile = useIsMobile()

const [openMobile, setOpenMobile] = React.useState(false)

- **Sheet Transform**

Automatically transforms into a sheet component on mobile:

const Sidebar = React.forwardRef<

HTMLDivElement,

React.ComponentProps<"div"> & {

side?: "left" | "right"

variant?: "sidebar" | "floating" | "inset"

collapsible?: "offcanvas" | "icon" | "none"

}

>(

(

{

side = "left",

variant = "sidebar",

collapsible = "offcanvas",

className,

children,

...props

},

ref

) => {

const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

if (collapsible === "none") {

return (

<div

*className*={cn(

"flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",

className

)}

*ref*={ref}

{...props}

>

{children}

</div>

)

}

if (isMobile) {

return (

<Sheet *open*={openMobile} *onOpenChange*={setOpenMobile} {...props}>

<SheetContent

*data-sidebar*="sidebar"

*data-mobile*="true"

*className*="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"

*style*={

{

"--sidebar-width": SIDEBAR_WIDTH_MOBILE,

} as React.CSSProperties

}

*side*={side}

>

<div *className*="flex h-full w-full flex-col">{children}</div>

</SheetContent>

</Sheet>

)

}

return (

<div

*ref*={ref}

*className*="group peer hidden md:block text-sidebar-foreground"

*data-state*={state}

*data-collapsible*={state === "collapsed" ? collapsible : ""}

*data-variant*={variant}

*data-side*={side}

>

{*/* This is what handles the sidebar gap on desktop */*}

<div

*className*={cn(

"duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",

"group-data-[collapsible=offcanvas]:w-0",

"group-data-[side=right]:rotate-180",

variant === "floating" || variant === "inset"

? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"

: "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"

)}

/>

<div

*className*={cn(

"duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",

side === "left"

? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"

: "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",

*// Adjust the padding for floating and inset variants.*

variant === "floating" || variant === "inset"

? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"

: "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",

className

)}

{...props}

>

<div

*data-sidebar*="sidebar"

*className*="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"

>

{children}

</div>

</div>

</div>

)

}

)

Sidebar.displayName = "Sidebar"

### **Customization**

- **Theme Integration**
- Uses CSS variables for theming
- Supports dark/light modes
- Customizable via Tailwind classes
- **Width Configuration**

Adjust sidebar widths through constants:

const SIDEBAR_WIDTH = "16rem"

const SIDEBAR_WIDTH_MOBILE = "18rem"

const SIDEBAR_WIDTH_ICON = "3rem"

- **Component Variants**

Multiple display options:

- Standard sidebar
- Floating panel
- Inset variant
- Icon-only mode

### **Best Practices**

- **Layout Organization**
- Keep navigation groups logically organized
- Use consistent icons
- Implement role-based access control
- **Performance**
- Lazy load route components
- Memoize route configurations
- Use dynamic imports for icons
- **Accessibility**
- Maintain keyboard navigation
- Include ARIA labels
- Support screen readers
- Handle focus management
- **State Management**
- Use controlled mode for complex integrations
- Handle mobile states appropriately
- Implement proper loading states