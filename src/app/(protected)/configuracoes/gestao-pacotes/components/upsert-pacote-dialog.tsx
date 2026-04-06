"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { upsertPacote } from "@/actions/upsert-pacote";
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
import { pacotesTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  colacao: z.string().trim().optional(),
  baile: z.string().trim().optional(),
  album: z.string().trim().optional(),
  pendrive: z.string().trim().optional(),
  conviteInteira: z.string().trim().optional(),
  conviteMeia: z.string().trim().optional(),
  conviteExtraInteira: z.string().trim().optional(),
  conviteExtraMeia: z.string().trim().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

type Pacote = typeof pacotesTable.$inferSelect;

interface UpsertPacoteDialogProps {
  onSuccess?: () => void;
  isOpen?: boolean;
  pacote?: Pacote | null;
}

const currencyFormatProps = {
  thousandSeparator: ".",
  decimalSeparator: ",",
  prefix: "R$ ",
  allowNegative: false,
  decimalScale: 2,
  fixedDecimalScale: true,
};

const UpsertPacoteDialog = ({
  onSuccess,
  isOpen,
  pacote,
}: UpsertPacoteDialogProps) => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: pacote?.name ?? "",
      colacao: pacote?.colacao ?? "",
      baile: pacote?.baile ?? "",
      album: pacote?.album ?? "",
      pendrive: pacote?.pendrive ?? "",
      conviteInteira: pacote?.conviteInteira ?? "",
      conviteMeia: pacote?.conviteMeia ?? "",
      conviteExtraInteira: pacote?.conviteExtraInteira ?? "",
      conviteExtraMeia: pacote?.conviteExtraMeia ?? "",
    },
  });

  const upsertPacoteAction = useAction(upsertPacote, {
    onSuccess: () => {
      toast.success("Pacote salvo com sucesso");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar pacote");
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      return;
    }

    if (pacote) {
      form.reset({
        name: pacote.name ?? "",
        colacao: pacote.colacao ?? "",
        baile: pacote.baile ?? "",
        album: pacote.album ?? "",
        pendrive: pacote.pendrive ?? "",
        conviteInteira: pacote.conviteInteira ?? "",
        conviteMeia: pacote.conviteMeia ?? "",
        conviteExtraInteira: pacote.conviteExtraInteira ?? "",
        conviteExtraMeia: pacote.conviteExtraMeia ?? "",
      });
    } else {
      form.reset({
        name: "",
        colacao: "",
        baile: "",
        album: "",
        pendrive: "",
        conviteInteira: "",
        conviteMeia: "",
        conviteExtraInteira: "",
        conviteExtraMeia: "",
      });
    }
  }, [isOpen, pacote, form]);

  const onSubmit = (values: FormSchema) => {
    upsertPacoteAction.execute({
      ...values,
      id: pacote?.id,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{pacote ? "Editar Pacote" : "Novo Pacote"}</DialogTitle>
        <DialogDescription>
          Informe os valores utilizados como padrão para este pacote.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do pacote" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="colacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colação</FormLabel>
                  <FormControl>
                    <NumericFormat
                      {...currencyFormatProps}
                      customInput={Input}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Baile</FormLabel>
                  <FormControl>
                    <NumericFormat
                      {...currencyFormatProps}
                      customInput={Input}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="album"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Álbum</FormLabel>
                  <FormControl>
                    <NumericFormat
                      {...currencyFormatProps}
                      customInput={Input}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pendrive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pendrive</FormLabel>
                  <FormControl>
                    <NumericFormat
                      {...currencyFormatProps}
                      customInput={Input}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="conviteInteira"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Convite Inteira</FormLabel>
                  <FormControl>
                    <NumericFormat
                      {...currencyFormatProps}
                      customInput={Input}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="conviteMeia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Convite Meia</FormLabel>
                  <FormControl>
                    <NumericFormat
                      {...currencyFormatProps}
                      customInput={Input}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conviteExtraInteira"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Convite Extra Inteira</FormLabel>
                  <FormControl>
                    <NumericFormat
                      {...currencyFormatProps}
                      customInput={Input}
                      value={field.value ?? ""}
                      onValueChange={(values) => {
                        field.onChange(values.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="conviteExtraMeia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Convite Extra Meia</FormLabel>
                <FormControl>
                  <NumericFormat
                    {...currencyFormatProps}
                    customInput={Input}
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit">Salvar Pacote</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertPacoteDialog;

