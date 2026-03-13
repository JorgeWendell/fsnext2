import { HeaderStocky } from "./components/header-stocky";
import { SidebarStocky } from "./components/sidebar-stocky";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <SidebarStocky />
      <main className="flex-1 flex flex-col">
        <div className="sticky top-0 z-10">
          <HeaderStocky />
        </div>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
