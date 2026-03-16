"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import * as React from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { addAlunoExtra } from "@/actions/add-aluno-extra";
import { upsertAluno } from "@/actions/upsert-aluno";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { alunosTable } from "@/db/schema";
import { validatePhone } from "@/lib/validations";

const formSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Nome é obrigatório" }),
    codigo: z
      .string()
      .trim()
      .length(3, { message: "Código deve ter exatamente 3 dígitos" })
      .regex(/^\d{3}$/, { message: "Código deve conter apenas números" }),
    class: z.string().trim().min(1, { message: "Classe é obrigatória" }),
    ano_formacao: z
      .string()
      .trim()
      .min(4, { message: "Ano de formação é obrigatório" }),
    address: z.string().trim().optional(),
    phone: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || validatePhone(val), {
        message: "Telefone inválido",
      }),
    sex: z.enum(["male", "female"], { message: "Sexo é obrigatório" }),
    escola: z.string().trim().min(1, { message: "Escola é obrigatória" }),
    album: z.boolean().optional(),
    valor_album: z.string().optional(),
    colacao: z.boolean().optional(),
    valor_colacao: z.string().optional(),
    baile: z.boolean().optional(),
    valor_baile: z.string().optional(),
    convite_extra: z.boolean().optional(),
    valor_convite_extra: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.album) {
        return !!data.valor_album && data.valor_album.trim() !== "";
      }
      return true;
    },
    { path: ["valor_album"], message: "Informe o valor do álbum" },
  )
  .refine(
    (data) => {
      if (data.colacao) {
        return !!data.valor_colacao && data.valor_colacao.trim() !== "";
      }
      return true;
    },
    { path: ["valor_colacao"], message: "Informe o valor da colação" },
  )
  .refine(
    (data) => {
      if (data.baile) {
        return !!data.valor_baile && data.valor_baile.trim() !== "";
      }
      return true;
    },
    { path: ["valor_baile"], message: "Informe o valor do baile" },
  )
  .refine(
    (data) => {
      if (data.convite_extra) {
        return (
          !!data.valor_convite_extra && data.valor_convite_extra.trim() !== ""
        );
      }
      return true;
    },
    {
      path: ["valor_convite_extra"],
      message: "Informe o valor do convite extra",
    },
  );

type FormSchema = z.infer<typeof formSchema>;

type Escola = {
  id: string;
  name: string;
};

interface UpsertAlunoFormProps {
  aluno?: typeof alunosTable.$inferSelect;
  onSuccess?: () => void;
  escolas: Escola[];
  financeOpenByDefault?: boolean;
}

const UpsertAlunoForm = ({
  aluno,
  onSuccess,
  escolas = [],
  financeOpenByDefault = false,
}: UpsertAlunoFormProps) => {
  const [isFinanceOpen, setIsFinanceOpen] =
    React.useState<boolean>(financeOpenByDefault);
  const [isExtrasOpen, setIsExtrasOpen] = React.useState(false);
  const [extraAlbum, setExtraAlbum] = React.useState(false);
  const [extraConvite, setExtraConvite] = React.useState(false);
  const [extraValue, setExtraValue] = React.useState("");
  const isEditing = !!aluno;

  const form = useForm<FormSchema>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: aluno?.name ?? "",
      codigo: aluno?.codigo ?? "",
      class: aluno?.class ?? "",
      ano_formacao: aluno?.ano_formacao ?? "",
      address: aluno?.address ?? "",
      phone: aluno?.phone ?? "",
      sex: (aluno?.sex as "male" | "female") ?? "male",
      escola: aluno?.escola ?? "",
      album: aluno?.album ?? false,
      valor_album: aluno?.valor_album ?? "",
      colacao: aluno?.colacao ?? false,
      valor_colacao: aluno?.valor_colacao ?? "",
      baile: aluno?.baile ?? false,
      valor_baile: aluno?.valor_baile ?? "",
      convite_extra: aluno?.convite_extra ?? false,
      valor_convite_extra: aluno?.valor_convite_extra ?? "",
    },
  });

  const upsertAlunoAction = useAction(upsertAluno, {
    onSuccess: () => {
      toast.success("Aluno adicionado com sucesso");
      setIsFinanceOpen(false);
      onSuccess?.();
      form.reset();
    },
    onError: () => {
      toast.error("Erro ao adicionar Aluno");
    },
  });

  const addAlunoExtraAction = useAction(addAlunoExtra, {
    onSuccess: () => {
      toast.success("Item extra salvo com sucesso");
      setExtraAlbum(false);
      setExtraConvite(false);
      setExtraValue("");
      setIsExtrasOpen(false);
    },
    onError: () => {
      toast.error("Erro ao salvar item extra");
    },
  });

  const formatCurrency = (value: string) => {
    const onlyDigits = (value || "").replace(/\D/g, "");
    const cents = parseInt(onlyDigits || "0", 10);
    const reais = cents / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(reais);
  };

  const handleExtraValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      setExtraValue("");
      return;
    }
    const cents = parseInt(onlyDigits, 10);
    const asNumberString = (cents / 100).toFixed(2);
    setExtraValue(asNumberString);
  };

  const handleAlbumValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      form.setValue("valor_album", "");
      return;
    }
    const cents = parseInt(onlyDigits, 10);
    const asNumberString = (cents / 100).toFixed(2);
    form.setValue("valor_album", asNumberString);
  };

  const handleColacaoValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      form.setValue("valor_colacao", "");
      return;
    }
    const cents = parseInt(onlyDigits, 10);
    const asNumberString = (cents / 100).toFixed(2);
    form.setValue("valor_colacao", asNumberString);
  };

  const handleBaileValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      form.setValue("valor_baile", "");
      return;
    }
    const cents = parseInt(onlyDigits, 10);
    const asNumberString = (cents / 100).toFixed(2);
    form.setValue("valor_baile", asNumberString);
  };

  const handleConviteExtraValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      form.setValue("valor_convite_extra", "");
      return;
    }
    const cents = parseInt(onlyDigits, 10);
    const asNumberString = (cents / 100).toFixed(2);
    form.setValue("valor_convite_extra", asNumberString);
  };

  const onSubmit = (values: FormSchema) => {
    upsertAlunoAction.execute({
      ...values,
      id: aluno?.id,
    });
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{aluno ? aluno.name : "Adicionar Aluno"}</DialogTitle>
        <DialogDescription>
          {aluno ? "Editar Aluno" : "Adicionar Aluno"}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      Informe um código de 3 dígitos. Após salvar, não poderá
                      ser alterado.
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
              name="ano_formacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano de Formação</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2024" maxLength={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe</FormLabel>
                <FormControl>
                  <Input placeholder="Classe" {...field} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sexo</SelectLabel>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
              name="escola"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escola</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escola" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Escolas</SelectLabel>
                        {escolas && escolas.length > 0 ? (
                          escolas.map((escola) => (
                            <SelectItem key={escola.id} value={escola.id}>
                              {escola.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Nenhuma escola encontrada
                          </SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter className="flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-2">
              {isEditing && aluno && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full sm:w-32"
                      disabled={upsertAlunoAction.isPending}
                    >
                      Desativar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Desativar contrato</AlertDialogTitle>
                      <AlertDialogDescription>
                        Você está prestes a desativar esse contrato, tem certeza disso?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          const currentValues = form.getValues();
                          upsertAlunoAction.execute({
                            ...currentValues,
                            id: aluno.id,
                            active: false,
                          });
                        }}
                      >
                        Sim, desativar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Dialog open={isFinanceOpen} onOpenChange={setIsFinanceOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Finanças
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Finanças do Aluno</DialogTitle>
                    <DialogDescription>
                      Marque os itens e informe os valores.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="album"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={Boolean(field.value)}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border"
                            />
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
                              <Input
                                placeholder="R$ 0,00"
                                value={
                                  field.value ? formatCurrency(field.value) : ""
                                }
                                onChange={handleAlbumValueChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="colacao"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={Boolean(field.value)}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Colação</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("colacao") && (
                      <FormField
                        control={form.control}
                        name="valor_colacao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor da Colação</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="R$ 0,00"
                                value={
                                  field.value ? formatCurrency(field.value) : ""
                                }
                                onChange={handleColacaoValueChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="baile"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={Boolean(field.value)}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Baile</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("baile") && (
                      <FormField
                        control={form.control}
                        name="valor_baile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor do Baile</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="R$ 0,00"
                                value={
                                  field.value ? formatCurrency(field.value) : ""
                                }
                                onChange={handleBaileValueChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="convite_extra"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={Boolean(field.value)}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4 rounded border"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Convite Extra</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("convite_extra") && (
                      <FormField
                        control={form.control}
                        name="valor_convite_extra"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor do Convite Extra</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="R$ 0,00"
                                value={
                                  field.value ? formatCurrency(field.value) : ""
                                }
                                onChange={handleConviteExtraValueChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2 justify-end">
                      <Dialog open={isExtrasOpen} onOpenChange={setIsExtrasOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            disabled={upsertAlunoAction.isPending}
                          >
                            Extras
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Itens extras</DialogTitle>
                            <DialogDescription>
                              Marque aqui os itens adquiridos fora do contrato.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <FormLabel>Itens</FormLabel>
                              <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border"
                                    checked={extraAlbum}
                                    onChange={(e) => setExtraAlbum(e.target.checked)}
                                  />
                                  <span>Álbum</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border"
                                    checked={extraConvite}
                                    onChange={(e) => setExtraConvite(e.target.checked)}
                                  />
                                  <span>Convite extra</span>
                                </label>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <FormLabel>Valor total</FormLabel>
                              <Input
                                placeholder="R$ 0,00"
                                value={
                                  extraValue ? formatCurrency(extraValue) : ""
                                }
                                onChange={handleExtraValueChange}
                              />
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2 justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={addAlunoExtraAction.isPending || !aluno}
                                onClick={() => {
                                  if (!aluno) return;
                                  const total = extraValue.trim();
                                  if (!total) {
                                    toast.error("Informe o valor total do item extra");
                                    return;
                                  }
                                  if (!extraAlbum && !extraConvite) {
                                    toast.error("Selecione pelo menos um item extra");
                                    return;
                                  }
                                  if (extraAlbum) {
                                    addAlunoExtraAction.execute({
                                      alunoId: aluno.id,
                                      type: "album",
                                      total,
                                    });
                                  }
                                  if (extraConvite) {
                                    addAlunoExtraAction.execute({
                                      alunoId: aluno.id,
                                      type: "convite_extra",
                                      total,
                                    });
                                  }
                                }}
                              >
                                {addAlunoExtraAction.isPending
                                  ? "Salvando..."
                                  : "Salvar"}
                              </Button>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={upsertAlunoAction.isPending}
                        className="w-full sm:w-auto"
                      >
                        {upsertAlunoAction.isPending
                          ? "Salvando..."
                          : "Salvar Finanças"}
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Button
              type="submit"
              disabled={upsertAlunoAction.isPending}
              className="w-full sm:w-auto"
            >
              {upsertAlunoAction.isPending
                ? "Salvando..."
                : aluno
                  ? "Salvar"
                  : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertAlunoForm;
