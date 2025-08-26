"use client";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { financesTable } from "@/db/schema";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertFinance } from "@/actions/upsert-finance";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UpsertFinanceFormProps {
  finance?: typeof financesTable.$inferSelect;
  alunoId: string;
  onSuccess: () => void;
  defaultValueTotal?: string;
}

const upsertFinanceSchema = z.object({
  id: z.string().optional(),
  method: z.enum(["pix", "debit", "creditvista", "creditparc", "bank_slip"]),
  bank_slip: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]).optional(),
  valueTotal: z.string().min(1, "Valor é obrigatório"),
  alunoId: z.string().min(1, "Aluno é obrigatório"),
});

type UpsertFinanceInput = z.infer<typeof upsertFinanceSchema>;

const UpsertFinanceForm = ({ finance, alunoId, onSuccess, defaultValueTotal }: UpsertFinanceFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [firstDueDate, setFirstDueDate] = useState<string>("");

  const form = useForm<UpsertFinanceInput>({
    resolver: zodResolver(upsertFinanceSchema),
    defaultValues: {
      id: finance?.id || undefined,
      method: finance?.method || "pix",
      bank_slip: finance?.bank_slip || undefined,
      valueTotal: finance?.valueTotal || defaultValueTotal || "",
      alunoId: alunoId,
    },
  });

  const upsertFinanceAction = useAction(upsertFinance, {
    onSuccess: (data) => {
      if ((data as any).error) {
        toast.error((data as any).error);
      } else {
        toast.success(finance ? "Dados financeiros atualizados com sucesso!" : "Dados financeiros adicionados com sucesso!");
        form.reset();
        onSuccess();
        setIsOpen(false);
      }
    },
    onError: () => {
      toast.error("Erro ao salvar dados financeiros");
    },
  });

  const onSubmit = (data: UpsertFinanceInput) => {
    upsertFinanceAction.execute(data);
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    form.setValue("method", method as any);
    if (method !== "bank_slip" && method !== "creditparc") {
      form.setValue("bank_slip", undefined);
    }
  };

  const formatValue = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const cents = parseInt(numericValue) || 0;
    const reais = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(reais);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    if (numericValue) {
      const cents = parseInt(numericValue);
      const reais = (cents / 100).toFixed(2);
      form.setValue("valueTotal", reais);
    } else {
      form.setValue("valueTotal", "");
    }
  };

  const numParcelas = useMemo(() => parseInt(form.getValues("bank_slip") || "0", 10) || 0, [form.watch("bank_slip")]);
  const valorTotalNumber = useMemo(() => parseFloat(form.getValues("valueTotal") || "0") || 0, [form.watch("valueTotal")]);
  const valorParcelaNumber = useMemo(() => numParcelas > 0 ? valorTotalNumber / numParcelas : 0, [numParcelas, valorTotalNumber]);

  const parcelasPreview = useMemo(() => {
    if (selectedMethod !== "bank_slip" || !firstDueDate || numParcelas <= 0 || valorParcelaNumber <= 0) return [] as { date: string; value: string }[];
    const start = new Date(firstDueDate);
    const list: { date: string; value: string }[] = [];
    for (let i = 0; i < numParcelas; i++) {
      const due = addMonths(start, i);
      list.push({
        date: format(due, "dd/MM/yyyy", { locale: ptBR }),
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorParcelaNumber),
      });
    }
    return list;
  }, [selectedMethod, firstDueDate, numParcelas, valorParcelaNumber]);

  useEffect(() => {
    if (finance) {
      setSelectedMethod(finance.method);
    }
    if (!finance && defaultValueTotal && !form.getValues("valueTotal")) {
      form.setValue("valueTotal", defaultValueTotal);
    }
  }, [finance, defaultValueTotal, form]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={finance ? "outline" : "default"}
        size="sm"
      >
        {finance ? "Editar" : "Adicionar"} Transação
      </Button>

      {isOpen && (
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {finance ? "Editar" : "Adicionar"} Dados Financeiros
            </DialogTitle>
            <DialogDescription>
              {finance ? "Edite os dados" : "Adicione novos dados"} financeiros do aluno
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      value={selectedMethod}
                      onValueChange={handleMethodChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="debit">Débito</SelectItem>
                        <SelectItem value="creditvista">Crédito à Vista</SelectItem>
                        <SelectItem value="creditparc">Crédito Parcelado</SelectItem>
                        <SelectItem value="bank_slip">Boleto Bancário</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedMethod === "bank_slip" || selectedMethod === "creditparc") && (
                <FormField
                  control={form.control}
                  name="bank_slip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parcela</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v)=>form.setValue("bank_slip", v as any)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a parcela" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              Parcela {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedMethod === "bank_slip" && (
                <FormItem>
                  <FormLabel>Data do 1º Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" value={firstDueDate} onChange={(e)=>setFirstDueDate(e.target.value)} />
                  </FormControl>
                </FormItem>
              )}

              {(selectedMethod === "bank_slip" || selectedMethod === "creditparc") && form.getValues("bank_slip") && form.getValues("valueTotal") && (
                <FormItem>
                  <FormLabel>Valor das Parcelas</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      value={valorParcelaNumber > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorParcelaNumber) : ""}
                      readOnly
                    />
                  </FormControl>
                </FormItem>
              )}

              <FormField
                control={form.control}
                name="valueTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Total</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value ? formatValue(field.value) : ""}
                        onChange={handleValueChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedMethod === "bank_slip" && parcelasPreview.length > 0 && (
                <div className="space-y-2 rounded-md border p-3">
                  <div className="text-sm font-medium">Boletos (pré-visualização)</div>
                  <ul className="text-sm space-y-1">
                    {parcelasPreview.map((p, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span>{idx + 1}ª parcela • {p.date}</span>
                        <span className="font-medium">{p.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={upsertFinanceAction.isExecuting}>
                  {upsertFinanceAction.isExecuting ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      )}
    </>
  );
};

export default UpsertFinanceForm;
