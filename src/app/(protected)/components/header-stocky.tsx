"use client";

import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const pageTitleMap: Record<string, string> = {
  "/dashboard": "Visão Geral",
  "/estoque": "Estoque",
  "/relatorios": "Relatórios",
  "/configuracoes": "Configurações",
  "/ordens-de-servico": "Ordens de Serviço",
  "/suporte": "Suporte",
  "/perfil": "Meu Perfil",
};

const getBreadcrumbs = (
  pathname: string,
): { label: string; path: string }[] => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [
    { label: "Console Principal", path: "/dashboard" },
  ];

  if (segments.length === 0) {
    return breadcrumbs;
  }

  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const title =
      pageTitleMap[currentPath] ||
      segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    breadcrumbs.push({ label: title, path: currentPath });
  });

  return breadcrumbs;
};

type HeaderStockyProps = {
  onToggleSidebar?: () => void;
};

export const HeaderStocky = ({ onToggleSidebar }: HeaderStockyProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [searchValue, setSearchValue] = useState("");

  const session = authClient.useSession();
  const userName = session.data?.user.name || "Usuário";

  const breadcrumbs = getBreadcrumbs(pathname);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const value = searchValue.trim();
      if (!value) {
        return;
      }

      router.push(`/alunos?search=${encodeURIComponent(value)}`);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2">
          {onToggleSidebar && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onToggleSidebar}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div
                  key={`${crumb.path}-${index}`}
                  className="flex items-center gap-2"
                >
                  {isLast ? (
                    <span className="text-blue-500">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="text-gray-600 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                    >
                      {crumb.label}
                    </Link>
                  )}
                  {!isLast && (
                    <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar aluno (ex: 001/100/26)"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full rounded-lg bg-slate-100 pr-4 pl-10 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-blue-600 hover:bg-slate-100 dark:text-blue-400 dark:hover:bg-slate-800"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Avatar>
                  <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col text-left sm:flex">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userName}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={cn(
                "w-56 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800",
              )}
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/perfil"
                  className="flex cursor-pointer items-center text-gray-900 focus:bg-slate-100 focus:text-gray-900 dark:text-white dark:focus:bg-slate-700 dark:focus:text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer text-gray-900 focus:bg-slate-100 focus:text-gray-900 dark:text-white dark:focus:bg-slate-700 dark:focus:text-white"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Tema Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Tema Escuro</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:bg-slate-100 focus:text-red-700 dark:text-red-400 dark:focus:bg-slate-700 dark:focus:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
