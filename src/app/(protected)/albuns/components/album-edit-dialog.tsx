"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateAlbum } from "@/actions/update-album";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { alunosTable } from "@/db/schema";

const schema = z.object({
  id: z.string(),
  album: z.boolean().optional(),
  valor_album: z.string().optional(),
  pendrive: z.boolean().optional(),
  valor_pendrive: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

const formatCurrency = (v: string) => {
  const only = (v || "").replace(/\D/g, "");
  const cents = parseInt(only || "0", 10);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL"}).format(cents/100);
};

interface Props {
  aluno: typeof alunosTable.$inferSelect;
  onClose: () => void;
}

const AlbumEditDialog = ({ aluno, onClose }: Props) => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: aluno.id,
      album: (aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string }).album ?? true,
      valor_album: (aluno as typeof alunosTable.$inferSelect & { album?: boolean; valor_album?: string }).valor_album ?? "",
      pendrive:
        (
          aluno as typeof alunosTable.$inferSelect & {
            pendrive?: boolean;
            valor_pendrive?: string;
          }
        ).pendrive ?? false,
      valor_pendrive:
        (
          aluno as typeof alunosTable.$inferSelect & {
            pendrive?: boolean;
            valor_pendrive?: string;
          }
        ).valor_pendrive ?? "",
    }
  });

  const action = useAction(updateAlbum, {
    onSuccess: () => { toast.success("Álbum atualizado"); onClose(); },
    onError: () => toast.error("Erro ao atualizar álbum"),
  });

  const onSubmit = (values: Schema) => action.execute(values);

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const only = e.target.value.replace(/\D/g, "");
    const val = only ? (parseInt(only, 10)/100).toFixed(2) : "";
    form.setValue("valor_album", val);
  };

  const handlePendriveValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const only = e.target.value.replace(/\D/g, "");
    const val = only ? (parseInt(only, 10)/100).toFixed(2) : "";
    form.setValue("valor_pendrive", val);
  };

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Editar Produtos - {aluno.name}</DialogTitle>
        <DialogDescription>Atualize álbum e pendrive</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="album"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <input type="checkbox" checked={Boolean(field.value)} onChange={(e)=>field.onChange(e.target.checked)} />
                </FormControl>
                <FormLabel className="!mt-0">Álbum</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("album") && (
            <FormField
              control={form.control}
              name="valor_album"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Álbum</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" value={field.value ? formatCurrency(field.value) : ""} onChange={handleValorChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="pendrive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <input type="checkbox" checked={Boolean(field.value)} onChange={(e)=>field.onChange(e.target.checked)} />
                </FormControl>
                <FormLabel className="!mt-0">Pendrive</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("pendrive") && (
            <FormField
              control={form.control}
              name="valor_pendrive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Pendrive</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" value={field.value ? formatCurrency(field.value) : ""} onChange={handlePendriveValueChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={action.isExecuting}>Salvar</Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AlbumEditDialog;
