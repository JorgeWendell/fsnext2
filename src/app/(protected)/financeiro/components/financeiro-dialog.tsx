"use client";
import { deleteFinance } from "@/actions/delete-finance";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { alunosTable, financesTable } from "@/db/schema";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import UpsertFinanceForm from "./upsert-finance-form";
import BoletosPreviewDialog from "./boletos-preview-dialog";

interface FinanceiroDialogProps {
  aluno: typeof alunosTable.$inferSelect;
  finances: typeof financesTable.$inferSelect[];
  onClose: () => void;
  onRefresh: () => void;
}

const FinanceiroDialog = ({ aluno, finances, onClose, onRefresh }: FinanceiroDialogProps) => {
  // local: reservado para futuras edições inline
  // const [editingFinance, setEditingFinance] = useState<typeof financesTable.$inferSelect | null>(null);

  const [isBoletosDialogOpen, setIsBoletosDialogOpen] = useState(false);



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

  // const handleEditFinance = (finance: typeof financesTable.$inferSelect) => {
  //   setEditingFinance(finance);
  // };

  const handleCloseEditDialog = () => {
    // noop: edição inline desativada
  };

  const handleSuccess = () => {
    onRefresh();
    handleCloseEditDialog();
  };


  const formatMethod = (method: string) => {
    const methods: Record<string, string> = {
      pix: "PIX",
      debit: "Débito",
      creditvista: "Crédito à Vista",
      creditparc: "Crédito Parcelado",
      bank_slip: "Boleto Bancário",
    };
    return methods[method] || method;
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

  // Itens de finanças definidos no cadastro do aluno
  type AlunoFinanceItem = { label: string; enabled: boolean; value: string | null };
  const alunoFinanceItems: AlunoFinanceItem[] = [
    { label: 'Álbum', enabled: Boolean((aluno as { album?: boolean }).album), value: (aluno as { valor_album?: string | null }).valor_album ?? null },
    { label: 'Colação', enabled: Boolean((aluno as { colacao?: boolean }).colacao), value: (aluno as { valor_colacao?: string | null }).valor_colacao ?? null },
    { label: 'Baile', enabled: Boolean((aluno as { baile?: boolean }).baile), value: (aluno as { valor_baile?: string | null }).valor_baile ?? null },
    { label: 'Convite Extra', enabled: Boolean((aluno as { convite_extra?: boolean }).convite_extra), value: (aluno as { valor_convite_extra?: string | null }).valor_convite_extra ?? null },
  ];

  const alunoItemsTotal = alunoFinanceItems.reduce((sum, item) => {
    if (!item.enabled) return sum;
    const v = parseFloat(item.value || '0');
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  // Verificar se há boletos para mostrar o botão
  const hasBoletos = finances.some(f => f.method === "bank_slip");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-full h-[70vh] overflow-y-auto">
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
              defaultValueTotal={alunoItemsTotal > 0 ? alunoItemsTotal.toFixed(2) : undefined}
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
              <h4 className="font-semibold text-sm text-muted-foreground">Total a Pagar</h4>
              <p className="text-lg font-bold text-green-600">
                {formatValue(alunoItemsTotal.toFixed(2))}
              </p>
            </div>
          </div>

          {/* Itens de Finanças do Aluno */}
          <div className="p-4 border rounded-lg">
            
            {alunoFinanceItems.every(i => !i.enabled) ? (
              <div className="text-sm text-muted-foreground">Nenhum item marcado no cadastro do aluno.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alunoFinanceItems.filter(i => i.enabled).map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-md border p-3">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-semibold">{formatValue(((item.value as string) || '0'))}</span>
                  </div>
                ))}
              </div>
            )}
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

                     {hasBoletos && (
             <div className="flex justify-center">
               <Button 
                 variant="outline" 
                 onClick={() => setIsBoletosDialogOpen(true)}
                 className="w-full max-w-xs"
               >
                 Gerenciar Boletos
               </Button>
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

       {/* Dialog de Boletos */}
       <BoletosPreviewDialog
         finances={finances}
         isOpen={isBoletosDialogOpen}
         onClose={() => setIsBoletosDialogOpen(false)}
         onRefresh={onRefresh}
       />
     </Dialog>
   );
 };

export default FinanceiroDialog;
