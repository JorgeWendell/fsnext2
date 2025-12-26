"use client";

import { AlertCircle } from "lucide-react";
import { addDays, isAfter, isBefore } from "date-fns";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { financesTable } from "@/db/schema";

interface UpcomingPaymentsAlertProps {
  finances: typeof financesTable.$inferSelect[];
}

export function UpcomingPaymentsAlert({ finances }: UpcomingPaymentsAlertProps) {
  const today = new Date();
  const next7Days = addDays(today, 7);

  const upcomingPayments = finances
    .filter((finance) => {
      if (
        (finance.method !== "bank_slip" && finance.method !== "creditparc") ||
        !finance.firstDueDate ||
        !finance.bank_slip
      ) {
        return false;
      }

      try {
        const firstDueDate = new Date(finance.firstDueDate);
        const totalParcelas = parseInt(finance.bank_slip, 10);
        const parcelasPagas = finance.parcelasPagas
          ? JSON.parse(finance.parcelasPagas)
          : {};

        for (let i = 1; i <= totalParcelas; i++) {
          if (parcelasPagas[i] === true) continue;

          const parcelaDate = addDays(firstDueDate, (i - 1) * 30);
          
          if (
            isAfter(parcelaDate, today) &&
            isBefore(parcelaDate, next7Days)
          ) {
            return true;
          }
        }
      } catch (error) {
        console.error("Erro ao processar vencimentos:", error);
      }

      return false;
    })
    .length;

  if (upcomingPayments === 0) {
    return null;
  }

  return (
    <Alert className="border-orange-500/50 bg-orange-500/10">
      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertTitle>Atenção: Boletos Próximos do Vencimento</AlertTitle>
      <AlertDescription>
        Você tem {upcomingPayments} boleto(s) com vencimento nos próximos 7 dias.
        Verifique em /financeiro para mais detalhes.
      </AlertDescription>
    </Alert>
  );
}

