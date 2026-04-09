"use client";
import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { updateBoletoStatus } from "@/actions/update-boleto-status";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { financesTable } from "@/db/schema";

interface BoletosPreviewDialogProps {
  finances: typeof financesTable.$inferSelect[];
  alunoName: string;
  alunoPhone: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const BoletosPreviewDialog = ({ finances, alunoName, alunoPhone, isOpen, onClose, onRefresh }: BoletosPreviewDialogProps) => {
  const whatsappTestPhone = "+5511973920743";
  const [boletoStatus, setBoletoStatus] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [, setSendingWhatsappParcela] = useState<number | null>(null);

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

    const boleto = bankSlip[0]; // Usar o primeiro boleto
    const maxParcela = parseInt((boleto.bank_slip as string) || "0", 10);

    if (maxParcela <= 0) return [] as { label: string; date: string; value: string }[];

    // Usa o valorTotal como base para dividir pelas parcelas
    const baseTotal = parseFloat(boleto.valueTotal) || 0;
    const parcelaValor = maxParcela > 0 ? baseTotal / maxParcela : 0;

    // Usar a data do primeiro vencimento salva no banco, ou fallback para a data de criação
    let start: Date;
    if (boleto.firstDueDate) {
      // Corrigir problema de timezone - criar data no timezone local
      const [year, month, day] = boleto.firstDueDate.split('-').map(Number);
      start = new Date(year, month - 1, day); // month - 1 porque Date usa 0-based months
    } else {
      start = new Date(boleto.createdAt);
    }

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

  const handleSendWhatsapp = async (parcela: number, dueDate: string, value: string) => {
    const targetPhone = alunoPhone || whatsappTestPhone;

    if (!targetPhone) {
      toast.error("Aluno sem telefone cadastrado");
      return;
    }

    const bankSlipFinance = finances.find((f) => f.method === "bank_slip");
    if (!bankSlipFinance) {
      toast.error("Nenhum boleto encontrado");
      return;
    }

    setSendingWhatsappParcela(parcela);
    try {
      const boletoRes = await fetch("/api/asaas/boleto-parcela", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ financeId: bankSlipFinance.id, parcela }),
      });

      const boletoData = await boletoRes.json();

      if (!boletoRes.ok || !boletoData?.success) {
        const err =
          typeof boletoData?.error === "string"
            ? boletoData.error
            : "Não foi possível obter dados do boleto no ASAAS";
        toast.error(err);
        return;
      }

      const identificationField = String(boletoData.data?.identificationField ?? "");
      const barCode = String(boletoData.data?.barCode ?? "");
      const bankSlipUrl = String(boletoData.data?.bankSlipUrl ?? "");

      const message = [
        `Parcela ${parcela} do Boleto. Vencimento ${dueDate}. Valor: ${value}.`,
        "",
        "Linha digitável:",
        identificationField || "(indisponível)",
        "",
        "Código de barras:",
        barCode || "(indisponível)",
        ...(bankSlipUrl ? ["", `PDF: ${bankSlipUrl}`] : []),
      ].join("\n");

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: targetPhone,
          name: alunoName,
          message,
          ...(bankSlipUrl ? { documentUrl: bankSlipUrl, documentFilename: `boleto-parcela-${parcela}.pdf` } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        const graph =
          data?.data &&
          typeof data.data === "object" &&
          data.data !== null &&
          "error" in data.data
            ? (data.data as { error?: { message?: string } }).error
            : undefined;
        const detail =
          typeof data?.error === "string"
            ? data.error
            : typeof graph?.message === "string"
              ? graph.message
              : null;
        toast.error(detail || `Falha ao enviar WhatsApp da ${parcela}ª parcela`);
        return;
      }

      if (bankSlipUrl && data.documentSent === false) {
        toast.success(
          "Mensagem enviada; o PDF não pôde ser anexado pelo WhatsApp (use o link do PDF no texto).",
        );
      } else {
        toast.success(`WhatsApp enviado da ${parcela}ª parcela`);
      }
    } catch {
      toast.error("Erro de rede ou resposta inválida. Tente novamente.");
    } finally {
      setSendingWhatsappParcela(null);
    }
  };

  if (boletosPreview.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md max-h-[80vh] overflow-y-auto">
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
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendWhatsapp(parcela, p.date, p.value)}
                      disabled
                    >
                      <MessageCircle />
                      WhatsApp
                    </Button>
                    <span className={`font-semibold ${isPaid ? "text-green-600" : ""}`}>
                      {p.value}
                    </span>
                  </div>
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
