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
import { useState } from "react";
import { Edit, TrashIcon, Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { deleteFinance } from "@/actions/delete-finance";
import { toast } from "sonner";
import UpsertFinanceForm from "./upsert-finance-form";

interface FinanceiroDialogProps {
  aluno: typeof alunosTable.$inferSelect;
  finances: typeof financesTable.$inferSelect[];
  onClose: () => void;
  onRefresh: () => void;
}

const FinanceiroDialog = ({ aluno, finances, onClose, onRefresh }: FinanceiroDialogProps) => {
  const [editingFinance, setEditingFinance] = useState<typeof financesTable.$inferSelect | null>(null);

  const deleteFinanceAction = useAction(deleteFinance, {
    onSuccess: () => {
      toast.success("Transação excluída com sucesso");
      onRefresh();
    },
    onError: () => {
      toast.error("Erro ao excluir transação");
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
  const formatMethod = (method: string) => {
    const methods = {
      pix: "PIX",
      debit: "Débito",
      creditvista: "Crédito à Vista",
      creditparc: "Crédito Parcelado",
      bank_slip: "Boleto Bancário"
    };
    return methods[method as keyof typeof methods] || method;
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full h-[80vh] overflow-auto">
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
