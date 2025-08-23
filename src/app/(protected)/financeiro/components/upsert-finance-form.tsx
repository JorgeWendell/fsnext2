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
import { useState, useEffect } from "react";

const upsertFinanceSchema = z.object({
  id: z.string().optional(),
  method: z.enum(["pix", "debit", "creditvista", "creditparc", "bank_slip"]),
  bank_slip: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]).optional(),
  valueTotal: z.string().min(1, "Valor total é obrigatório"),
  valueParcela: z.string().optional(),
  alunoId: z.string().min(1, "Aluno é obrigatório"),
});

type UpsertFinanceInput = z.infer<typeof upsertFinanceSchema>;

interface UpsertFinanceFormProps {
  finance?: typeof financesTable.$inferSelect;
  alunoId: string;
  onSuccess: () => void;
}

const UpsertFinanceForm = ({ finance, alunoId, onSuccess }: UpsertFinanceFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const form = useForm<UpsertFinanceInput>({
    resolver: zodResolver(upsertFinanceSchema),
    defaultValues: {
      id: finance?.id || undefined,
      method: finance?.method || "pix",
      bank_slip: finance?.bank_slip || undefined,
      valueTotal: finance?.valueTotal || "",
      valueParcela: "",
      alunoId: alunoId,
    },
  });

  const upsertFinanceAction = useAction(upsertFinance, {
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
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
    
    // Limpar parcela se não for boleto ou crédito parcelado
    if (method !== "bank_slip" && method !== "creditparc") {
      form.setValue("bank_slip", undefined);
    }
  };

  const formatValue = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, "");
    
    // Converte para centavos
    const cents = parseInt(numericValue) || 0;
    const reais = cents / 100;
    
    // Formata como moeda brasileira
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
      
             // Calcular valor das parcelas se for boleto bancário ou crédito parcelado
       if ((selectedMethod === "bank_slip" || selectedMethod === "creditparc") && form.getValues("bank_slip")) {
         const numParcelas = parseInt(form.getValues("bank_slip") || "1");
         const valorParcela = (cents / 100 / numParcelas).toFixed(2);
         form.setValue("valueParcela", valorParcela);
       }
    } else {
      form.setValue("valueTotal", "");
      form.setValue("valueParcela", "");
    }
  };

  const handleParcelaChange = (parcela: string) => {
    form.setValue("bank_slip", parcela as "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10");
    
         // Recalcular valor das parcelas se já tiver valor total
     const valorTotal = form.getValues("valueTotal");
     if ((selectedMethod === "bank_slip" || selectedMethod === "creditparc") && valorTotal && parcela) {
       const numParcelas = parseInt(parcela);
       const valorParcela = (parseFloat(valorTotal) / numParcelas).toFixed(2);
       form.setValue("valueParcela", valorParcela);
     }
  };

  useEffect(() => {
    if (finance) {
      setSelectedMethod(finance.method);
    }
  }, [finance]);

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
                         onValueChange={handleParcelaChange}
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

               {(selectedMethod === "bank_slip" || selectedMethod === "creditparc") && form.getValues("bank_slip") && form.getValues("valueTotal") && (
                 <FormField
                   control={form.control}
                   name="valueParcela"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Valor das Parcelas</FormLabel>
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
