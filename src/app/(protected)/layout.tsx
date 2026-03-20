"use client";

import { useState } from "react";

import { HeaderStocky } from "./components/header-stocky";
import { SidebarStocky } from "./components/sidebar-stocky";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-svh bg-background">
      {/* Sidebar desktop */}
      <div className="hidden md:flex">
        <SidebarStocky />
      </div>

      {/* Sidebar mobile como overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64">
            <SidebarStocky />
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            className="flex-1 bg-black/40"
            onClick={handleCloseSidebar}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <div className="sticky top-0 z-30">
          <HeaderStocky onToggleSidebar={handleToggleSidebar} />
        </div>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
