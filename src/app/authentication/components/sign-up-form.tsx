"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";


const SignUpForm = () => {
  return (
    <div className="p-6">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Criar nova conta
        </h2>
        <p className="text-sm text-muted-foreground">
          Agora a criação de conta acontece em uma nova tela dedicada.
        </p>
        <Button asChild className="w-full h-11 text-base font-medium">
          <Link href="/signup">Ir para cadastro</Link>
        </Button>
      </div>
    </div>
  );
};

export default SignUpForm;