"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { upsertFinance } from "@/actions/upsert-finance";
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

interface UpsertFinanceFormProps {
  finance?: typeof financesTable.$inferSelect;
  alunoId: string;
  alunoName: string;
  alunoPhone: string | null;
  onSuccess: () => void;
  defaultValueTotal?: string;
}

const upsertFinanceSchema = z.object({
  id: z.string().optional(),
  method: z.enum(["pix", "debit", "creditvista", "creditparc", "bank_slip"]),
  bank_slip: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]).optional(),
  boletoCpf: z.string().optional(),
  valueTotal: z.string().min(1, "Valor é obrigatório"),
  discount: z.string().optional(),
  firstDueDate: z.string().optional(),
  alunoId: z.string().min(1, "Aluno é obrigatório"),
});

type UpsertFinanceInput = z.infer<typeof upsertFinanceSchema>;

function firstAsaasErrorDescription(payload: {
  asaasErrors?: unknown;
  data?: { errors?: { description?: string }[] };
}): string {
  const list = Array.isArray(payload.asaasErrors)
    ? payload.asaasErrors
    : Array.isArray(payload.data?.errors)
      ? payload.data.errors
      : null;
  const first = list?.[0];
  return first && typeof first.description === "string" ? first.description : "";
}

const UpsertFinanceForm = ({ finance, alunoId, alunoName, alunoPhone, onSuccess, defaultValueTotal }: UpsertFinanceFormProps) => {
  const isAsaasIntegrationEnabled = false;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [firstDueDate, setFirstDueDate] = useState<string>("");

  const initialDiscountNumber =
    parseFloat(finance?.discount || "0") || 0;
  const initialNetNumber =
    parseFloat(finance?.valueTotal || defaultValueTotal || "0") || 0;
  const [grossValueTotalNumber, setGrossValueTotalNumber] = useState<number>(
    initialNetNumber + initialDiscountNumber,
  );

  const form = useForm<UpsertFinanceInput>({
    resolver: zodResolver(upsertFinanceSchema),
    defaultValues: {
      id: finance?.id || undefined,
      method: finance?.method || "pix",
      bank_slip: finance?.bank_slip || undefined,
      boletoCpf: "",
      valueTotal: finance?.valueTotal || defaultValueTotal || "",
      discount: finance?.discount || "0",
      firstDueDate: finance?.firstDueDate || "",
      alunoId: alunoId,
    },
  });

  const upsertFinanceAction = useAction(upsertFinance, {
    onSuccess: (data) => {
      if ((data as { error?: string }).error) {
        toast.error((data as { error?: string }).error);
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

  const onSubmit = async (data: UpsertFinanceInput) => {
    if (
      isAsaasIntegrationEnabled &&
      !finance &&
      (data.method === "pix" || data.method === "bank_slip" || data.method === "creditparc")
    ) {
      if (data.method === "creditparc") {
        const maxInstallmentCount = parseInt(data.bank_slip || "0", 10) || 0;
        if (maxInstallmentCount < 1) {
          toast.error("Selecione a quantidade de parcelas");
          return;
        }

        const linkResponse = await fetch("/api/asaas/payment-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: parseFloat(data.valueTotal),
            maxInstallmentCount,
            name: `Crédito parcelado — ${alunoName}`,
            description: `Pagamento no cartão em até ${maxInstallmentCount}x — ${alunoName}`,
            externalReference: alunoId,
          }),
        });

        const linkData = await linkResponse.json();

        if (!linkResponse.ok || !linkData?.success) {
          toast.error(
            firstAsaasErrorDescription(linkData) ||
              "Não foi possível criar link de pagamento no ASAAS",
          );
          return;
        }

        const payUrl = typeof linkData?.data?.url === "string" ? linkData.data.url : "";
        toast.success("Link de pagamento (cartão parcelado) criado no ASAAS", {
          ...(payUrl
            ? {
                action: {
                  label: "Abrir link",
                  onClick: () => window.open(payUrl, "_blank", "noopener,noreferrer"),
                },
              }
            : {}),
        });
      } else {
        if (!alunoPhone) {
          toast.error("Aluno sem telefone cadastrado para integração ASAAS");
          return;
        }

        const cpfDigits = (data.boletoCpf || "").replace(/\D/g, "");
        if (data.method === "bank_slip" && !finance) {
          if (cpfDigits.length !== 11) {
            toast.error("Informe um CPF válido (11 dígitos) para boleto");
            return;
          }
        }

        const customerResponse = await fetch("/api/asaas/customer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: alunoName,
            phone: alunoPhone,
            ...(data.method === "bank_slip" && cpfDigits.length === 11 ? { cpfCnpj: cpfDigits } : {}),
          }),
        });

        const customerData = await customerResponse.json();
        const customerId = customerData?.data?.id;

        if (!customerResponse.ok || !customerData?.success || !customerId) {
          toast.error("Não foi possível criar cliente no ASAAS");
          return;
        }

        const billingTypeByMethod: Record<"pix" | "bank_slip", "PIX" | "BOLETO"> = {
          pix: "PIX",
          bank_slip: "BOLETO",
        };

        const billingType = billingTypeByMethod[data.method as "pix" | "bank_slip"];
        const installmentCount = parseInt(data.bank_slip || "1", 10) || 1;
        const today = new Date();
        const fallbackDueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const dueDate = data.firstDueDate || fallbackDueDate;

        const paymentResponse = await fetch("/api/asaas/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            value: parseFloat(data.valueTotal),
            description: `Transação financeira - ${alunoName}`,
            billingType,
            installmentCount,
            dueDate,
          }),
        });

        const paymentData = await paymentResponse.json();

        if (!paymentResponse.ok || !paymentData?.success) {
          toast.error(
            firstAsaasErrorDescription(paymentData) || "Não foi possível criar cobrança no ASAAS",
          );
          return;
        }

        if (data.method === "pix") {
          toast.success("Link/cobrança PIX criado no ASAAS");
        } else {
          toast.success("Boletos parcelados criados no ASAAS");
        }

        let asaasBoletoRefPayload: string | undefined;
        if (data.method === "bank_slip") {
          const pay = paymentData.data as { installment?: string | null; id?: string };
          if (typeof pay?.installment === "string" && pay.installment.length > 0) {
            asaasBoletoRefPayload = JSON.stringify({
              type: "installment",
              installmentId: pay.installment,
            });
          } else if (typeof pay?.id === "string" && pay.id.length > 0) {
            asaasBoletoRefPayload = JSON.stringify({ type: "payment", paymentId: pay.id });
          }
        }

        const { boletoCpf: _boletoCpf, ...financePayload } = data;
        upsertFinanceAction.execute({
          ...financePayload,
          ...(asaasBoletoRefPayload ? { asaasBoletoRef: asaasBoletoRefPayload } : {}),
        });
        return;
      }
    }

    const { boletoCpf: _boletoCpf, ...financePayload } = data;
    upsertFinanceAction.execute(financePayload);
  };

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    form.setValue("method", method as "pix" | "debit" | "creditvista" | "creditparc" | "bank_slip");
    if (method !== "bank_slip" && method !== "creditparc") {
      form.setValue("bank_slip", undefined);
    }
    if (method !== "bank_slip") {
      form.setValue("boletoCpf", "");
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

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) {
      form.setValue("discount", "0");
      form.setValue("valueTotal", grossValueTotalNumber.toFixed(2));
      return;
    }

    const cents = parseInt(numericValue);
    const discountNumber = cents / 100;
    const discountStr = discountNumber.toFixed(2);

    const net = Math.max(0, grossValueTotalNumber - discountNumber);

    form.setValue("discount", discountStr);
    form.setValue("valueTotal", net.toFixed(2));
  };

  const bankSlipValue = form.watch("bank_slip");
  const valueTotalValue = form.watch("valueTotal");
  const numParcelas = useMemo(() => parseInt(bankSlipValue || "0", 10) || 0, [bankSlipValue]);
  const valorTotalNumber = useMemo(() => parseFloat(valueTotalValue || "0") || 0, [valueTotalValue]);
  const valorParcelaNumber = useMemo(() => numParcelas > 0 ? valorTotalNumber / numParcelas : 0, [numParcelas, valorTotalNumber]);

  const parcelasPreview = useMemo(() => {
    if (selectedMethod !== "bank_slip" || !firstDueDate || numParcelas <= 0 || valorParcelaNumber <= 0) return [] as { date: string; value: string }[];
    
    // Corrigir problema de timezone - criar data no timezone local
    const [year, month, day] = firstDueDate.split('-').map(Number);
    const start = new Date(year, month - 1, day); // month - 1 porque Date usa 0-based months
    
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
      if (finance.firstDueDate) {
        setFirstDueDate(finance.firstDueDate);
      }

      const discountNumber = parseFloat(finance.discount || "0") || 0;
      const netNumber = parseFloat(finance.valueTotal || "0") || 0;
      setGrossValueTotalNumber(netNumber + discountNumber);
      form.setValue("discount", finance.discount || "0");
      form.setValue("valueTotal", netNumber.toFixed(2));
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
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
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
                render={() => (
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

              {selectedMethod === "bank_slip" && (
                <FormField
                  control={form.control}
                  name="boletoCpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          mask="_"
                          value={field.value ?? ""}
                          onValueChange={(values) => {
                            field.onChange(values.value);
                          }}
                          getInputRef={field.ref}
                          onBlur={field.onBlur}
                          customInput={Input}
                          placeholder="000.000.000-00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="R$ 0,00"
                        value={field.value ? formatValue(field.value) : ""}
                        onChange={handleDiscountChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedMethod === "bank_slip" || selectedMethod === "creditparc") && (
                <FormField
                  control={form.control}
                  name="bank_slip"
                  render={() => (
                    <FormItem>
                      <FormLabel>Parcela</FormLabel>
                      <Select
                        value={form.getValues("bank_slip")}
                                                 onValueChange={(v)=>form.setValue("bank_slip", v as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10")}
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
                <FormField
                  control={form.control}
                  name="firstDueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do 1º Vencimento</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value || ""} 
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setFirstDueDate(e.target.value);
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        readOnly
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
