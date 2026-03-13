"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

const LoginForm = () => {
  return (
    <div className="p-6">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Bem-vindo de volta
        </h2>
        <p className="text-sm text-muted-foreground">
          Clique abaixo para acessar a nova tela de autenticação.
        </p>
        <Button asChild className="w-full h-11 text-base font-medium">
          <Link href="/login">Ir para login</Link>
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;