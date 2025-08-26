import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { upsertRepresentante } from "@/actions/upsert-representante";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { representantesTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  phone: z.string().trim().min(1, { message: "Telefone é obrigatório" }),
});

interface UpsertRepresentanteFormProps {
  representante?: typeof representantesTable.$inferSelect;
  onSuccess?: () => void;
}

const UpsertRepresentanteForm = ({
  representante,
  onSuccess,
}: UpsertRepresentanteFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: representante?.name ?? "",
      phone: representante?.phone ?? "",
    },
  });

  const upsertRepresentanteAction = useAction(upsertRepresentante, {
    onSuccess: () => {
      toast.success("Representante adicionado com sucesso");
      onSuccess?.();
      form.reset();
    },
    onError: () => {
      toast.error("Erro ao adicionar Representante");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    upsertRepresentanteAction.execute({
      ...values,
      id: representante?.id,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {representante ? representante.name : "Adicionar Representante"}
        </DialogTitle>
        <DialogDescription>
          {representante ? "Editar Representante" : "Adicionar Representante"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Celular</FormLabel>
                <FormControl>
                  <Input placeholder="Numero do Celular" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="submit"
              disabled={upsertRepresentanteAction.isPending}
            >
              {upsertRepresentanteAction.isPending
                ? "Salvando..."
                : representante
                  ? "Salvar"
                  : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertRepresentanteForm;
