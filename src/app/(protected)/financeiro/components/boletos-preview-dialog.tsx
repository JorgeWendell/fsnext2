"use client";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { updateBoletoStatus } from "@/actions/update-boleto-status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { financesTable } from "@/db/schema";

interface BoletosPreviewDialogProps {
  finances: typeof financesTable.$inferSelect[];
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const BoletosPreviewDialog = ({ finances, isOpen, onClose, onRefresh }: BoletosPreviewDialogProps) => {
  const [boletoStatus, setBoletoStatus] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Carregar status existente das parcelas quando o dialog abrir
  useEffect(() => {
    if (isOpen) {
      const bankSlip = finances.filter((f) => f.method === "bank_slip");
      if (bankSlip.length > 0) {
        const boleto = bankSlip[0]; // Usar o primeiro boleto
        const parcelasPagas = boleto.parcelasPagas ? JSON.parse(boleto.parcelasPagas) : {};
        setBoletoStatus(parcelasPagas);
      }
    }
  }, [isOpen, finances]);

  // Pré-visualização de boletos (mensal) quando houver registros de boleto bancário
  const boletosPreview = useMemo(() => {
    const bankSlip = finances.filter((f) => f.method === "bank_slip");
    if (bankSlip.length === 0) return [] as { label: string; date: string; value: string }[];

    const earliest = bankSlip.reduce((min, f) => (new Date(f.createdAt) < new Date(min.createdAt) ? f : min), bankSlip[0]);
    const maxParcela = bankSlip.reduce((m, f) => {
      const n = parseInt((f.bank_slip as string) || "0", 10);
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

  const handleBoletoStatusChange = (parcela: number, isPaid: boolean) => {
    setBoletoStatus(prev => ({
      ...prev,
      [parcela]: isPaid
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const bankSlip = finances.filter((f) => f.method === "bank_slip");
      if (bankSlip.length === 0) {
        toast.error("Nenhum boleto encontrado");
        return;
      }

      const boleto = bankSlip[0]; // Usar o primeiro boleto
      
      // Salvar cada parcela que foi alterada
      const promises = Object.entries(boletoStatus).map(([parcela, isPaid]) => {
        return updateBoletoStatus({
          financeId: boleto.id,
          parcela: parseInt(parcela),
          isPaid: isPaid
        });
      });

      await Promise.all(promises);
      
      toast.success("Status dos boletos atualizado com sucesso!");
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar status dos boletos:", error);
      toast.error("Erro ao salvar status dos boletos");
    } finally {
      setIsSaving(false);
    }
  };

  if (boletosPreview.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Boletos - Pré-visualização</DialogTitle>
          <DialogDescription>
            Gerencie o status de pagamento das parcelas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            {boletosPreview.map((p, idx) => {
              const parcela = idx + 1;
              const isPaid = boletoStatus[parcela] || false;
              
              return (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isPaid}
                      onChange={(e) => handleBoletoStatusChange(parcela, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className={`font-medium ${isPaid ? "line-through text-gray-500" : ""}`}>
                        {p.label}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        Vencimento: {p.date}
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold ${isPaid ? "text-green-600" : ""}`}>
                    {p.value}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoletosPreviewDialog;
