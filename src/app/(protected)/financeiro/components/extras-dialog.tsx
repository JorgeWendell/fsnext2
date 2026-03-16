"use client";

/* eslint-disable simple-import-sort/imports */

import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";

import { payAlunoExtra } from "@/actions/pay-aluno-extra";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { alunoExtrasTable, alunosTable } from "@/db/schema";
import { toast } from "sonner";

interface ExtrasDialogProps {
  aluno: typeof alunosTable.$inferSelect;
  extras: typeof alunoExtrasTable.$inferSelect[];
}

const ExtrasDialog = ({ aluno, extras }: ExtrasDialogProps) => {
  const formatValue = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value) || 0);
  };

  const formatType = (type: string) => {
    if (type === "album") return "Álbum";
    if (type === "convite_extra") return "Convite extra";
    return type;
  };

  const unpaidExtras = useMemo(
    () => extras.filter((extra) => !extra.paid),
    [extras],
  );

  const totalExtras = useMemo(
    () =>
      unpaidExtras.reduce((sum, extra) => {
        const v = parseFloat(extra.total || "0");
        return sum + (isNaN(v) ? 0 : v);
      }, 0),
    [unpaidExtras],
  );

  const [extraTotal, setExtraTotal] = useState(
    totalExtras > 0 ? totalExtras.toFixed(2) : "",
  );
  const [method, setMethod] = useState<string | undefined>(undefined);

  const handleExtraTotalChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const onlyDigits = raw.replace(/\D/g, "");
    if (!onlyDigits) {
      setExtraTotal("");
      return;
    }
    const cents = parseInt(onlyDigits, 10);
    const asNumberString = (cents / 100).toFixed(2);
    setExtraTotal(asNumberString);
  };

  const displayTotal =
    extraTotal && !Number.isNaN(parseFloat(extraTotal))
      ? formatValue(extraTotal)
      : formatValue(totalExtras.toFixed(2));

  const isPaid = unpaidExtras.length === 0;

  const payAlunoExtraAction = useAction(payAlunoExtra, {
    onSuccess: () => {
      toast.success("Pagamento de itens extras registrado com sucesso");
    },
    onError: () => {
      toast.error("Erro ao registrar pagamento de itens extras");
    },
  });

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Itens extras - {aluno.name}</DialogTitle>
        <DialogDescription>
          Lista de itens contratados fora do contrato principal.
        </DialogDescription>
      </DialogHeader>
      {extras.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Nenhum item extra encontrado para este aluno.
        </div>
      ) : (
        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extras.map((extra) => (
                <TableRow key={extra.id}>
                  <TableCell>{formatType(extra.type)}</TableCell>
                  <TableCell className="text-right">
                    {formatValue(extra.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Valor total
              </h4>
              <Input
                placeholder="R$ 0,00"
                value={displayTotal}
                onChange={handleExtraTotalChange}
                disabled={isPaid}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Método de pagamento
              </h4>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger disabled={isPaid}>
                  <SelectValue placeholder="Selecione um método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="creditvista">Crédito à vista</SelectItem>
                  <SelectItem value="creditparc">Crédito parcelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  disabled={!isPaid && !method}
                  className="w-full sm:w-auto"
                  variant={isPaid ? "destructive" : "default"}
                  onClick={() => {
                    if (isPaid) {
                      return;
                    }
                    const totalToUse =
                      extraTotal && !Number.isNaN(parseFloat(extraTotal))
                        ? extraTotal
                        : totalExtras.toFixed(2);
                    payAlunoExtraAction.execute({
                      alunoId: aluno.id,
                      method: method as
                        | "pix"
                        | "debit"
                        | "creditvista"
                        | "creditparc",
                      total: totalToUse,
                    });
                  }}
                >
                  {isPaid ? "Pago" : "Pagar"}
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default ExtrasDialog;


