import { BellDotIcon, Calendar, CircleHelp, FileText, Home, Inbox, LayoutDashboard, MailboxIcon, Search, Settings, Settings2 } from "lucide-react"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    url: "/invoices",
    icon: FileText,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: BellDotIcon,
  },
  {
    title: "Connect",
    url: "/connect",
    icon: MailboxIcon
  },
  {
    title: "Setting",
    url: "/settings",
    icon: Settings2,
  },
  {
    title: "Help and Support",
    url: "/help",
    icon: CircleHelp,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-start gap-2 mb-6 mt-5">
            <Image src="/logov4.png" alt="logo" width={30} height={30} className="rounded-lg" />
            <span className="font-bold text-[1rem] text-black dark:text-white">Invoicemanager</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
