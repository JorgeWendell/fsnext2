import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import LoginForm from "./components/login-form";
import SignUpForm from "./components/sign-up-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      <div className="relative z-10 w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="mb-8 flex flex-col items-center space-y-4 text-center">
          <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 p-3 shadow-lg ring-4 ring-primary/20">
            <Image
              src="/logo.png"
              alt="FS Eventos"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              FS Eventos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie seus eventos de forma simples e eficiente
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-2xl">
          <Tabs defaultValue="login" className="w-full">
            <div className="border-b border-border/50 p-6 pb-0">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
                >
                  Criar conta
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="login" className="mt-0">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © 2025 FS Eventos. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default AuthenticationPage;
