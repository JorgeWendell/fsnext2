"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { representantesTable } from "@/db/schema";

import UpsertRepresentanteForm from "./upsert-repre-form";

interface RepresentanteCardProps {
  representante: typeof representantesTable.$inferSelect;
}

const RepresentanteCard = ({ representante }: RepresentanteCardProps) => {
  const representanteInitials = representante.name
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{representanteInitials}</AvatarFallback>
          </Avatar>
          <h3 className="text-sm font-medium">{representante.name}</h3>
          <p className="text-sm text-muted-foreground">{representante.phone}</p>
        </div>
      </CardHeader>
      <Separator />
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Ver Detalhes</Button>
          </DialogTrigger>
          <UpsertRepresentanteForm />
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default RepresentanteCard;
