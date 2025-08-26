"use client";

import {
  BookImage,
  CircleDollarSign,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  School,
  Settings,
  UserPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

// Menu items.
const items = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Representantes",
    url: "/representantes",
    icon: UserPen,
  },
  {
    title: "Escolas",
    url: "/escolas",
    icon: School,
  },
  {
    title: "Alunos",
    url: "/alunos",
    icon: GraduationCap,
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: CircleDollarSign,
  },
  {
    title: "Albuns",
    url: "/albuns",
    icon: BookImage,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: Settings,
  },
];

export function AppSidebar() {
  const router = useRouter();

  const session = authClient.useSession();

  const pathname = usePathname();
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/authentication");
        },
      },
    });
  };
  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b items-center">
        <Image src="/logo.png" alt="Logo" width={70} height={70} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback>F</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm">{session.data?.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
