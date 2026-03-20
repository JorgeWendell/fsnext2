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
import { alunosTable, pacotesTable } from "@/db/schema";
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
    convite_inteira: z.boolean().optional(),
    valor_convite_inteira: z.string().optional(),
    convite_meia: z.boolean().optional(),
    valor_convite_meia: z.string().optional(),
  });

type FormSchema = z.infer<typeof formSchema>;

type Escola = {
  id: string;
  name: string;
  pacoteId?: string | null;
};

type Pacote = typeof pacotesTable.$inferSelect;

interface UpsertAlunoFormProps {
  aluno?: typeof alunosTable.$inferSelect;
  onSuccess?: () => void;
  escolas: Escola[];
  financeOpenByDefault?: boolean;
  pacotes?: Pacote[];
}

const UpsertAlunoForm = ({
  aluno,
  onSuccess,
  escolas = [],
  financeOpenByDefault = false,
  pacotes = [],
}: UpsertAlunoFormProps) => {
  const [isFinanceOpen, setIsFinanceOpen] =
    React.useState<boolean>(financeOpenByDefault);
  const [isExtrasOpen, setIsExtrasOpen] = React.useState(false);
  const [extraAlbum, setExtraAlbum] = React.useState(false);
  const [extraConviteInteira, setExtraConviteInteira] =
    React.useState(false);
  const [extraConviteMeia, setExtraConviteMeia] = React.useState(false);
  const [extraAlbumValue, setExtraAlbumValue] = React.useState("");
  const [extraConviteInteiraValue, setExtraConviteInteiraValue] =
    React.useState("");
  const [extraConviteInteiraQty, setExtraConviteInteiraQty] =
    React.useState(1);
  const [extraConviteInteiraDiscount, setExtraConviteInteiraDiscount] =
    React.useState("");
  const [extraConviteMeiaValue, setExtraConviteMeiaValue] =
    React.useState("");
  const [extraConviteMeiaQty, setExtraConviteMeiaQty] = React.useState(1);
  const [extraConviteMeiaDiscount, setExtraConviteMeiaDiscount] =
    React.useState("");
  const isEditing = !!aluno;

  const form = useForm<FormSchema>({
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
      convite_inteira: aluno?.convite_inteira ?? false,
      valor_convite_inteira: aluno?.valor_convite_inteira ?? "",
      convite_meia:
        (aluno as typeof alunosTable.$inferSelect & { convite_meia?: boolean })
          ?.convite_meia ?? false,
      valor_convite_meia:
        (aluno as typeof alunosTable.$inferSelect & {
          valor_convite_meia?: string;
        })?.valor_convite_meia ?? "",
    },
  });

  const escolaSelecionadaId = form.watch("escola");
  const escolaSelecionada = escolas.find((e) => e.id === escolaSelecionadaId);
  const hasPacoteForCurrentEscola =
    !!escolaSelecionada?.pacoteId &&
    pacotes.some((p) => p.id === escolaSelecionada.pacoteId);

  const upsertAlunoAction = useAction(upsertAluno, {
    onSuccess: () => {
      toast.success("Aluno adicionado com sucesso");
      setIsFinanceOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao adicionar Aluno");
    },
  });

  const addAlunoExtraAction = useAction(addAlunoExtra, {
    onSuccess: () => {
      toast.success("Item extra salvo com sucesso");
      setExtraAlbum(false);
      setExtraConviteInteira(false);
      setExtraConviteMeia(false);
      setExtraAlbumValue("");
      setExtraConviteInteiraValue("");
      setExtraConviteMeiaValue("");
      setExtraConviteInteiraDiscount("");
      setExtraConviteMeiaDiscount("");
      setExtraConviteInteiraQty(1);
      setExtraConviteMeiaQty(1);
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

  const applyPacoteFinanceValues = React.useCallback(() => {
    const escolaId = form.getValues("escola");
    if (!escolaId) return;
    const escola = escolas.find((e) => e.id === escolaId);
    if (!escola?.pacoteId) return;
    const pacote = pacotes.find((p) => p.id === escola.pacoteId);
    if (!pacote) return;

    if (form.getValues("album") && pacote.album) {
      form.setValue("valor_album", pacote.album);
    }
    if (form.getValues("colacao") && pacote.colacao) {
      form.setValue("valor_colacao", pacote.colacao);
    }
    if (form.getValues("baile") && pacote.baile) {
      form.setValue("valor_baile", pacote.baile);
    }
    if (form.getValues("convite_inteira") && pacote.conviteInteira) {
      form.setValue("valor_convite_inteira", pacote.conviteInteira);
    }
    if (form.getValues("convite_meia") && pacote.conviteMeia) {
      form.setValue("valor_convite_meia", pacote.conviteMeia);
    }
  }, [escolas, form, pacotes]);

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
      form.setValue("valor_convite_inteira", "");
      return;
    }
    const cents = parseInt(onlyDigits, 10);
    const asNumberString = (cents / 100).toFixed(2);
    form.setValue("valor_convite_inteira", asNumberString);
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
                        Você está prestes a desativar esse contrato, tem certeza
                        disso?
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
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(checked);
                                applyPacoteFinanceValues();
                              }}
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
                                readOnly={hasPacoteForCurrentEscola}
                                onChange={(e) => {
                                  if (hasPacoteForCurrentEscola) return;
                                  handleAlbumValueChange(e);
                                }}
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
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(checked);
                                applyPacoteFinanceValues();
                              }}
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
                                readOnly={hasPacoteForCurrentEscola}
                                onChange={(e) => {
                                  if (hasPacoteForCurrentEscola) return;
                                  handleColacaoValueChange(e);
                                }}
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
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(checked);
                                applyPacoteFinanceValues();
                              }}
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
                                readOnly={hasPacoteForCurrentEscola}
                                onChange={(e) => {
                                  if (hasPacoteForCurrentEscola) return;
                                  handleBaileValueChange(e);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="convite_inteira"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={Boolean(field.value)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(checked);
                                applyPacoteFinanceValues();
                              }}
                              className="h-4 w-4 rounded border"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">
                            Convite inteira
                          </FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("convite_inteira") && (
                      <FormField
                        control={form.control}
                        name="valor_convite_inteira"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor do Convite inteira</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="R$ 0,00"
                                value={
                                  field.value ? formatCurrency(field.value) : ""
                                }
                                readOnly={hasPacoteForCurrentEscola}
                                onChange={(e) => {
                                  if (hasPacoteForCurrentEscola) return;
                                  handleConviteExtraValueChange(e);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="convite_meia"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={Boolean(field.value)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(checked);

                                if (checked) {
                                  const escolaId = form.getValues("escola");
                                  if (escolaId) {
                                    const escola = escolas.find(
                                      (es) => es.id === escolaId,
                                    );
                                    if (escola?.pacoteId) {
                                      const pacote = pacotes.find(
                                        (p) => p.id === escola.pacoteId,
                                      );
                                      if (pacote?.conviteMeia) {
                                        form.setValue(
                                          "valor_convite_meia",
                                          pacote.conviteMeia,
                                        );
                                      }
                                    }
                                  }
                                } else {
                                  form.setValue("valor_convite_meia", "");
                                }
                              }}
                              className="h-4 w-4 rounded border"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Convite Meia</FormLabel>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch("convite_meia") && (
                      <FormField
                        control={form.control}
                        name="valor_convite_meia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valor do Convite Meia</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="R$ 0,00"
                                value={
                                  field.value ? formatCurrency(field.value) : ""
                                }
                                readOnly={hasPacoteForCurrentEscola}
                                onChange={(e) => {
                                  if (hasPacoteForCurrentEscola) return;
                                  const raw = e.target.value;
                                  const onlyDigits = raw.replace(/\D/g, "");
                                  if (!onlyDigits) {
                                    field.onChange("");
                                    return;
                                  }
                                  const cents = parseInt(onlyDigits, 10);
                                  const asNumberString = (
                                    cents / 100
                                  ).toFixed(2);
                                  field.onChange(asNumberString);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2 justify-end">
                      <Dialog
                        open={isExtrasOpen}
                        onOpenChange={setIsExtrasOpen}
                      >
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
                              <FormLabel>Álbum extra</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border"
                                  checked={extraAlbum}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setExtraAlbum(checked);
                                    if (checked && !extraAlbumValue) {
                                      const escolaId = form.getValues("escola");
                                      if (escolaId) {
                                        const escola = escolas.find(
                                          (es) => es.id === escolaId,
                                        );
                                        if (escola?.pacoteId) {
                                          const pacote = pacotes.find(
                                            (p) => p.id === escola.pacoteId,
                                          );
                                          if (pacote?.album) {
                                            setExtraAlbumValue(pacote.album);
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                                <span className="text-sm">
                                  Incluir Álbum extra
                                </span>
                              </div>
                              {extraAlbum && (
                                <div className="mt-2">
                                  <Input
                                    placeholder="Valor do Álbum extra - R$ 0,00"
                                    value={
                                      extraAlbumValue
                                        ? formatCurrency(extraAlbumValue)
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const onlyDigits = raw.replace(/\D/g, "");
                                      if (!onlyDigits) {
                                        setExtraAlbumValue("");
                                        return;
                                      }
                                      const cents = parseInt(onlyDigits, 10);
                                      const asNumberString = (
                                        cents / 100
                                      ).toFixed(2);
                                      setExtraAlbumValue(asNumberString);
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <FormLabel>Convite Extra Inteira</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border"
                                  checked={extraConviteInteira}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setExtraConviteInteira(checked);
                                    if (checked && !extraConviteInteiraValue) {
                                      const escolaId = form.getValues("escola");
                                      if (escolaId) {
                                        const escola = escolas.find(
                                          (es) => es.id === escolaId,
                                        );
                                        if (escola?.pacoteId) {
                                          const pacote = pacotes.find(
                                            (p) => p.id === escola.pacoteId,
                                          );
                                          if (pacote?.conviteInteira) {
                                            setExtraConviteInteiraValue(
                                              pacote.conviteInteira,
                                            );
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                                <span className="text-sm">
                                  Incluir Convite Extra Inteira
                                </span>
                              </div>
                              {extraConviteInteira && (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2">
                                  <Input
                                    placeholder="Valor unitário - R$ 0,00"
                                    value={
                                      extraConviteInteiraValue
                                        ? formatCurrency(
                                            extraConviteInteiraValue,
                                          )
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const onlyDigits =
                                        raw.replace(/\D/g, "");
                                      if (!onlyDigits) {
                                        setExtraConviteInteiraValue("");
                                        return;
                                      }
                                      const cents = parseInt(onlyDigits, 10);
                                      const asNumberString = (
                                        cents / 100
                                      ).toFixed(2);
                                      setExtraConviteInteiraValue(
                                        asNumberString,
                                      );
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    min={1}
                                    value={extraConviteInteiraQty}
                                    onChange={(e) => {
                                      const qty = parseInt(
                                        e.target.value || "1",
                                        10,
                                      );
                                      setExtraConviteInteiraQty(
                                        Number.isNaN(qty) || qty < 1 ? 1 : qty,
                                      );
                                    }}
                                    placeholder="Qtd."
                                  />
                                  <Input
                                    placeholder="Desconto - R$ 0,00"
                                    value={
                                      extraConviteInteiraDiscount
                                        ? formatCurrency(
                                            extraConviteInteiraDiscount,
                                          )
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const onlyDigits =
                                        raw.replace(/\D/g, "");
                                      if (!onlyDigits) {
                                        setExtraConviteInteiraDiscount("");
                                        return;
                                      }
                                      const cents = parseInt(onlyDigits, 10);
                                      const asNumberString = (
                                        cents / 100
                                      ).toFixed(2);
                                      setExtraConviteInteiraDiscount(
                                        asNumberString,
                                      );
                                    }}
                                  />
                                  <Input
                                    readOnly
                                    value={
                                      extraConviteInteiraValue
                                        ? formatCurrency(
                                            Math.max(
                                              0,
                                              parseFloat(
                                                extraConviteInteiraValue ||
                                                  "0",
                                              ) * extraConviteInteiraQty -
                                                parseFloat(
                                                  extraConviteInteiraDiscount ||
                                                    "0",
                                                ),
                                            ).toFixed(2),
                                          )
                                        : ""
                                    }
                                    placeholder="Total"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <FormLabel>Convite Extra Meia</FormLabel>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border"
                                  checked={extraConviteMeia}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setExtraConviteMeia(checked);
                                    if (checked && !extraConviteMeiaValue) {
                                      const escolaId = form.getValues("escola");
                                      if (escolaId) {
                                        const escola = escolas.find(
                                          (es) => es.id === escolaId,
                                        );
                                        if (escola?.pacoteId) {
                                          const pacote = pacotes.find(
                                            (p) => p.id === escola.pacoteId,
                                          );
                                          if (pacote?.conviteMeia) {
                                            setExtraConviteMeiaValue(
                                              pacote.conviteMeia,
                                            );
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                                <span className="text-sm">
                                  Incluir Convite Extra Meia
                                </span>
                              </div>
                              {extraConviteMeia && (
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2">
                                  <Input
                                    placeholder="Valor unitário - R$ 0,00"
                                    value={
                                      extraConviteMeiaValue
                                        ? formatCurrency(extraConviteMeiaValue)
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const onlyDigits =
                                        raw.replace(/\D/g, "");
                                      if (!onlyDigits) {
                                        setExtraConviteMeiaValue("");
                                        return;
                                      }
                                      const cents = parseInt(onlyDigits, 10);
                                      const asNumberString = (
                                        cents / 100
                                      ).toFixed(2);
                                      setExtraConviteMeiaValue(
                                        asNumberString,
                                      );
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    min={1}
                                    value={extraConviteMeiaQty}
                                    onChange={(e) => {
                                      const qty = parseInt(
                                        e.target.value || "1",
                                        10,
                                      );
                                      setExtraConviteMeiaQty(
                                        Number.isNaN(qty) || qty < 1 ? 1 : qty,
                                      );
                                    }}
                                    placeholder="Qtd."
                                  />
                                  <Input
                                    placeholder="Desconto - R$ 0,00"
                                    value={
                                      extraConviteMeiaDiscount
                                        ? formatCurrency(
                                            extraConviteMeiaDiscount,
                                          )
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value;
                                      const onlyDigits =
                                        raw.replace(/\D/g, "");
                                      if (!onlyDigits) {
                                        setExtraConviteMeiaDiscount("");
                                        return;
                                      }
                                      const cents = parseInt(onlyDigits, 10);
                                      const asNumberString = (
                                        cents / 100
                                      ).toFixed(2);
                                      setExtraConviteMeiaDiscount(
                                        asNumberString,
                                      );
                                    }}
                                  />
                                  <Input
                                    readOnly
                                    value={
                                      extraConviteMeiaValue
                                        ? formatCurrency(
                                            Math.max(
                                              0,
                                              parseFloat(
                                                extraConviteMeiaValue || "0",
                                              ) * extraConviteMeiaQty -
                                                parseFloat(
                                                  extraConviteMeiaDiscount ||
                                                    "0",
                                                ),
                                            ).toFixed(2),
                                          )
                                        : ""
                                    }
                                    placeholder="Total"
                                  />
                                </div>
                              )}
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2 justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={addAlunoExtraAction.isPending}
                                onClick={() => {
                                  if (!aluno) {
                                    toast.error(
                                      "Salve o aluno antes de adicionar itens extras.",
                                    );
                                    return;
                                  }

                                  const anySelected =
                                    extraAlbum ||
                                    extraConviteInteira ||
                                    extraConviteMeia;

                                  if (!anySelected) {
                                    toast.error(
                                      "Selecione pelo menos um item extra",
                                    );
                                    return;
                                  }

                                  if (
                                    extraAlbum &&
                                    !extraAlbumValue.trim()
                                  ) {
                                    toast.error(
                                      "Informe o valor do Álbum extra",
                                    );
                                    return;
                                  }

                                  if (
                                    extraConviteInteira &&
                                    !extraConviteInteiraValue.trim()
                                  ) {
                                    toast.error(
                                      "Informe o valor do Convite Extra Inteira",
                                    );
                                    return;
                                  }

                                  if (
                                    extraConviteMeia &&
                                    !extraConviteMeiaValue.trim()
                                  ) {
                                    toast.error(
                                      "Informe o valor do Convite Extra Meia",
                                    );
                                    return;
                                  }

                                  if (extraAlbum) {
                                    addAlunoExtraAction.execute({
                                      alunoId: aluno.id,
                                      type: "album",
                                      total: extraAlbumValue.trim(),
                                      quantity: 1,
                                    });
                                  }

                                  if (extraConviteInteira) {
                                    const unit = parseFloat(
                                      extraConviteInteiraValue || "0",
                                    );
                                    const discountValue = parseFloat(
                                      extraConviteInteiraDiscount || "0",
                                    );
                                    const grossTotal =
                                      unit * extraConviteInteiraQty;
                                    const total = Math.max(
                                      0,
                                      grossTotal - discountValue,
                                    ).toFixed(2);
                                    const discount = Math.max(
                                      0,
                                      discountValue,
                                    ).toFixed(2);
                                    addAlunoExtraAction.execute({
                                      alunoId: aluno.id,
                                      type: "convite_extra",
                                      total,
                                      quantity: extraConviteInteiraQty,
                                      discount,
                                    });
                                  }

                                  if (extraConviteMeia) {
                                    const unit = parseFloat(
                                      extraConviteMeiaValue || "0",
                                    );
                                    const discountValue = parseFloat(
                                      extraConviteMeiaDiscount || "0",
                                    );
                                    const grossTotal = unit * extraConviteMeiaQty;
                                    const total = Math.max(
                                      0,
                                      grossTotal - discountValue,
                                    ).toFixed(2);
                                    const discount = Math.max(
                                      0,
                                      discountValue,
                                    ).toFixed(2);
                                    addAlunoExtraAction.execute({
                                      alunoId: aluno.id,
                                      type: "convite_extra",
                                      total,
                                      quantity: extraConviteMeiaQty,
                                      discount,
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
