"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import * as React from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { upsertEscola } from "@/actions/upsert-escola";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { escolasTable } from "@/db/schema";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
  codigo: z
    .string()
    .trim()
    .length(3, { message: "Código deve ter exatamente 3 dígitos" })
    .regex(/^\d{3}$/, { message: "Código deve conter apenas números" }),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  representante: z
    .string()
    .trim()
    .min(1, { message: "Representante é obrigatório" }),
});

type FormSchema = z.infer<typeof formSchema>;

// Se quiser manter como string

type Representante = {
  id: string;
  name: string;
};

interface UpsertEscolaFormProps {
  escola?: typeof escolasTable.$inferSelect;
  onSuccess?: () => void;
  representantes: Representante[];
  escolas?: typeof escolasTable.$inferSelect[];
}

const UpsertEscolaForm = ({
  escola,
  onSuccess,
  representantes = [],
  escolas: allEscolas = [],
}: UpsertEscolaFormProps) => {
  const isEditing = !!escola;
  
  const form = useForm<FormSchema>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: escola?.name ?? "",
      codigo: escola?.codigo ?? "",
      address: escola?.address ?? "",
      phone: escola?.phone ?? "",
      representante: escola?.representanteId ?? "",
    },
  });

  const generateNextCodigo = React.useCallback(() => {
    if (isEditing) return;

    const totalEscolas = allEscolas.length;
    const proximoNumero = totalEscolas + 1;
    const codigo = 100 + (proximoNumero - 1) * 10;
    const codigoFormatado = codigo.toString().padStart(3, "0");
    
    form.setValue("codigo", codigoFormatado);
  }, [allEscolas, isEditing, form]);

  React.useEffect(() => {
    if (!isEditing) {
      generateNextCodigo();
    }
  }, [isEditing, generateNextCodigo]);

  const upsertEscolaAction = useAction(upsertEscola, {
    onSuccess: () => {
      toast.success("Escola adicionada com sucesso");
      onSuccess?.();
      form.reset();
    },
    onError: () => {
      toast.error("Erro ao adicionar Escola");
    },
  });

  const onSubmit = (values: FormSchema) => {
    upsertEscolaAction.execute({
      ...values,
      id: escola?.id,
    });
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{escola ? escola.name : "Adicionar Escola"}</DialogTitle>
        <DialogDescription>
          {escola ? "Editar Escola" : "Adicionar Escola"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Código" 
                    maxLength={3} 
                    readOnly={isEditing}
                    disabled={isEditing}
                    className={isEditing ? "bg-muted cursor-not-allowed" : ""}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                {!isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Código gerado automaticamente
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    O código não pode ser alterado
                  </p>
                )}
              </FormItem>
            )}
          />
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input placeholder="Endereço" {...field} />
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
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                    getInputRef={field.ref}
                    onBlur={field.onBlur}
                    customInput={Input}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="representante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Representante</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um representante" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Representantes</SelectLabel>
                      {representantes && representantes.length > 0 ? (
                        representantes.map((representante) => (
                          <SelectItem
                            key={representante.id}
                            value={representante.id}
                          >
                            {representante.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Nenhum representante encontrado
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={upsertEscolaAction.isPending}>
              {upsertEscolaAction.isPending
                ? "Salvando..."
                : escola
                  ? "Salvar"
                  : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertEscolaForm;
