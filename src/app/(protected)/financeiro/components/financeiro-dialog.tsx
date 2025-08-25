"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { alunosTable, financesTable } from "@/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";
import { Edit, TrashIcon, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { deleteFinance } from "@/actions/delete-finance";
import { updateBoletoStatus } from "@/actions/update-boleto-status";
import { toast } from "sonner";
import UpsertFinanceForm from "./upsert-finance-form";
import { addMonths } from "date-fns";

interface FinanceiroDialogProps {
  aluno: typeof alunosTable.$inferSelect;
  finances: typeof financesTable.$inferSelect[];
  onClose: () => void;
  onRefresh: () => void;
}

const FinanceiroDialog = ({ aluno, finances, onClose, onRefresh }: FinanceiroDialogProps) => {
  const [editingFinance, setEditingFinance] = useState<typeof financesTable.$inferSelect | null>(null);
  const [boletoStatus, setBoletoStatus] = useState<Record<string, boolean>>({});

  // Carregar status das parcelas salvas
  const loadBoletoStatus = useMemo(() => {
    const bankSlipFinance = finances.find(f => f.method === "bank_slip");
    if (!bankSlipFinance?.parcelasPagas) return {};

    try {
      const savedStatus = JSON.parse(bankSlipFinance.parcelasPagas);
      const statusMap: Record<string, boolean> = {};
      
      Object.entries(savedStatus).forEach(([parcela, isPaid]) => {
        statusMap[`${bankSlipFinance.id}-${parcela}`] = isPaid as boolean;
      });
      
      return statusMap;
    } catch (error) {
      console.error("Erro ao carregar status das parcelas:", error);
      return {};
    }
  }, [finances]);

  const deleteFinanceAction = useAction(deleteFinance, {
    onSuccess: () => {
      toast.success("Transação excluída com sucesso");
      onRefresh();
    },
    onError: () => {
      toast.error("Erro ao excluir transação");
    },
  });

  const updateBoletoStatusAction = useAction(updateBoletoStatus, {
    onSuccess: () => {
      toast.success("Status do boleto atualizado");
      onRefresh();
    },
    onError: () => {
      toast.error("Erro ao atualizar status do boleto");
    },
  });

  const handleDeleteFinance = (financeId: string) => {
    deleteFinanceAction.execute({ id: financeId });
  };

  const handleEditFinance = (finance: typeof financesTable.$inferSelect) => {
    setEditingFinance(finance);
  };

  const handleCloseEditDialog = () => {
    setEditingFinance(null);
  };

  const handleSuccess = () => {
    onRefresh();
    handleCloseEditDialog();
  };

  const handleBoletoStatusChange = (financeId: string, parcela: number, isPaid: boolean) => {
    setBoletoStatus(prev => ({
      ...prev,
      [`${financeId}-${parcela}`]: isPaid
    }));
    
    updateBoletoStatusAction.execute({
      financeId,
      parcela,
      isPaid
    });
  };
  const formatMethod = (method: string) => {
    const methods = {
      pix: "PIX",
      debit: "Débito",
      creditvista: "Crédito à Vista",
      creditparc: "Crédito Parcelado",
      bank_slip: "Boleto Bancário"
    };
    return (methods as any)[method] || method;
  };

  const formatBankSlip = (bankSlip: string | null) => {
    if (!bankSlip) return "N/A";
    return `Parcela ${bankSlip}`;
  };

  const formatValue = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value) || 0);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const totalValue = finances.reduce((sum, finance) => {
    return sum + (parseFloat(finance.valueTotal) || 0);
  }, 0);

  // Pré-visualização de boletos (mensal) quando houver registros de boleto bancário
  const boletosPreview = useMemo(() => {
    const bankSlip = finances.filter((f) => f.method === "bank_slip");
    if (bankSlip.length === 0) return [] as { label: string; date: string; value: string }[];

    const earliest = bankSlip.reduce((min, f) => (new Date(f.createdAt) < new Date(min.createdAt) ? f : min), bankSlip[0]);
    const maxParcela = bankSlip.reduce((m, f) => {
      const n = parseInt((f.bank_slip as any) || "0", 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);

    if (maxParcela <= 0) return [] as { label: string; date: string; value: string }[];

    // Usa o primeiro valorTotal como base para dividir pelas parcelas
    const baseTotal = parseFloat(bankSlip[0].valueTotal) || 0;
    const parcelaValor = maxParcela > 0 ? baseTotal / maxParcela : 0;

    const start = new Date(earliest.createdAt);
    const list: { label: string; date: string; value: string }[] = [];
    for (let i = 0; i < maxParcela; i++) {
      const due = addMonths(start, i);
      list.push({
        label: `${i + 1}ª parcela`,
        date: format(due, 'dd/MM/yyyy', { locale: ptBR }),
        value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcelaValor),
      });
    }
    return list;
  }, [finances]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-y-visible">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Dados Financeiros - {aluno.name}</DialogTitle>
              <DialogDescription>
                Histórico completo de transações financeiras do aluno
              </DialogDescription>
            </div>
            <UpsertFinanceForm
              alunoId={aluno.id}
              onSuccess={onRefresh}
            />
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Aluno */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Nome</h4>
              <p className="text-lg">{aluno.name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Classe</h4>
              <p className="text-lg">{aluno.class}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground">Total Pago</h4>
              <p className="text-lg font-bold text-green-600">
                {formatValue(totalValue.toString())}
              </p>
            </div>
          </div>

          {/* Tabela de Transações */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Histórico de Transações</h3>
            {finances.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação encontrada para este aluno.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Parcela</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {finances.map((finance) => (
                    <TableRow key={finance.id}>
                      <TableCell>
                        {formatDate(finance.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formatMethod(finance.method)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {finance.method === "bank_slip" || finance.method === "creditparc" 
                          ? formatBankSlip(finance.bank_slip)
                          : "N/A"
                        }
                        {(finance.method === "bank_slip" || finance.method === "creditparc") && finance.bank_slip && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatValue((parseFloat(finance.valueTotal) / parseInt(finance.bank_slip)).toFixed(2))} cada
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatValue(finance.valueTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <UpsertFinanceForm
                            finance={finance}
                            alunoId={aluno.id}
                            onSuccess={handleSuccess}
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Tem certeza que quer deletar essa transação?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser revertida. Isso irá deletar a transação permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteFinance(finance.id)}>
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {boletosPreview.length > 0 && (
            <div className="space-y-2 rounded-md border p-3">
              <div className="text-sm font-medium">Boletos (pré-visualização)</div>
              <ul className="text-sm space-y-1">
                                 {boletosPreview.map((p, idx) => {
                   const financeId = finances.find(f => f.method === "bank_slip")?.id || "";
                   const checkboxKey = `${financeId}-${idx + 1}`;
                   const isPaid = loadBoletoStatus[checkboxKey] || boletoStatus[checkboxKey] || false;
                  
                  return (
                    <li key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isPaid}
                          onChange={(e) => handleBoletoStatusChange(financeId, idx + 1, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={isPaid ? "line-through text-gray-500" : ""}>
                          {p.label} • {p.date}
                        </span>
                      </div>
                      <span className={`font-medium ${isPaid ? "text-green-600" : ""}`}>
                        {p.value}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Resumo */}
          {finances.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total de Transações:</span>
                <span className="text-lg font-bold text-green-600">
                  {finances.length} transação(ões)
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceiroDialog;
