"use client";

import {
  BookImage,
  CircleDollarSign,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  School,
  Settings,
  UserPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navigationItems: NavItem[] = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Representantes",
    href: "/representantes",
    icon: UserPen,
  },
  {
    name: "Escolas",
    href: "/escolas",
    icon: School,
  },
  {
    name: "Alunos",
    href: "/alunos",
    icon: GraduationCap,
  },
  {
    name: "Financeiro",
    href: "/financeiro",
    icon: CircleDollarSign,
  },
  {
    name: "Albuns",
    href: "/albuns",
    icon: BookImage,
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: Settings,
  },
  {
    name: "Suporte",
    href: "/suporte",
    icon: HelpCircle,
  },
];

export const SidebarStocky = () => {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3 p-6">
        <Image
          src={theme === "dark" ? "/logo.png" : "/logo2.png"}
          alt="ERP Industrial Logo"
          width={150}
          height={150}
          priority
          unoptimized
          className="mx-auto items-center justify-center"
        />
        <div className="flex flex-col" />
      </div>

      <nav className="flex flex-1 flex-col px-4 py-6">
        <div className="space-y-1">
          {navigationItems
            .filter((item) => item.href !== "/suporte")
            .map((item) => {
              const navItem = item as NavItem;
              const isActive = pathname === navItem.href;
              const Icon = navItem.icon;

              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-slate-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{navItem.name}</span>
                </Link>
              );
            })}
        </div>

        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
          {navigationItems
            .filter((item) => item.href === "/suporte")
            .map((item) => {
              const navItem = item as NavItem;
              const isActive = pathname === navItem.href;
              const Icon = navItem.icon;

              return (
                <Link
                  key={navItem.href}
                  href={navItem.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-slate-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{navItem.name}</span>
                </Link>
              );
            })}
        </div>
      </nav>
    </div>
  );
};

