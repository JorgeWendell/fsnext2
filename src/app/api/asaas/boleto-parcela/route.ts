import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { financesTable } from "@/db/schema";

const bodySchema = z.object({
  financeId: z.string().uuid(),
  parcela: z.coerce.number().int().min(1).max(10),
});

type BoletoRef =
  | { type: "installment"; installmentId: string }
  | { type: "payment"; paymentId: string };

function parseRef(raw: string | null): BoletoRef | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const r = o as Record<string, unknown>;
    if (r.type === "installment" && typeof r.installmentId === "string") {
      return { type: "installment", installmentId: r.installmentId };
    }
    if (r.type === "payment" && typeof r.paymentId === "string") {
      return { type: "payment", paymentId: r.paymentId };
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 });
    }
    const { financeId, parcela } = parsed.data;

    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({ success: false, error: "ASAAS_API_KEY não configurada" }, { status: 500 });
    }

    const baseUrl = process.env.ASAAS_API_URL?.replace(/\/$/, "") || "https://api.asaas.com";
    const headers = { access_token: process.env.ASAAS_API_KEY };

    const [finance] = await db
      .select()
      .from(financesTable)
      .where(and(eq(financesTable.id, financeId), eq(financesTable.method, "bank_slip")));

    if (!finance) {
      return NextResponse.json({ success: false, error: "Financeiro não encontrado" }, { status: 404 });
    }

    const ref = parseRef(finance.asaasBoletoRef);
    if (!ref) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Este boleto não está vinculado ao ASAAS. Adicione novamente a transação com boleto para gerar o vínculo.",
        },
        { status: 400 },
      );
    }

    let paymentId: string | null = null;

    if (ref.type === "payment") {
      if (parcela !== 1) {
        return NextResponse.json(
          { success: false, error: "Esta cobrança possui apenas uma parcela" },
          { status: 400 },
        );
      }
      paymentId = ref.paymentId;
    } else {
      const listRes = await fetch(`${baseUrl}/v3/installments/${ref.installmentId}/payments`, {
        headers,
      });
      const listData = (await listRes.json()) as {
        data?: Array<{ id?: string; installmentNumber?: number }>;
        errors?: unknown;
      };
      if (!listRes.ok) {
        return NextResponse.json(
          { success: false, data: listData, error: "Falha ao listar parcelas no ASAAS" },
          { status: listRes.status },
        );
      }
      const items = Array.isArray(listData.data) ? listData.data : [];
      const pay = items.find((p) => p.installmentNumber === parcela);
      if (!pay?.id) {
        return NextResponse.json({ success: false, error: "Parcela não encontrada no ASAAS" }, { status: 404 });
      }
      paymentId = pay.id;
    }

    const payDetRes = await fetch(`${baseUrl}/v3/payments/${paymentId}`, { headers });
    const paymentDetail = (await payDetRes.json()) as { bankSlipUrl?: string; errors?: unknown };
    if (!payDetRes.ok) {
      return NextResponse.json({ success: false, data: paymentDetail }, { status: payDetRes.status });
    }

    const idRes = await fetch(`${baseUrl}/v3/payments/${paymentId}/identificationField`, { headers });
    const idData = (await idRes.json()) as {
      identificationField?: string;
      barCode?: string;
      nossoNumero?: string;
      errors?: unknown;
    };
    if (!idRes.ok) {
      return NextResponse.json({ success: false, data: idData }, { status: idRes.status });
    }

    return NextResponse.json({
      success: true,
      data: {
        bankSlipUrl: typeof paymentDetail.bankSlipUrl === "string" ? paymentDetail.bankSlipUrl : "",
        identificationField: idData.identificationField ?? "",
        barCode: idData.barCode ?? "",
        nossoNumero: idData.nossoNumero ?? "",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Erro ao obter dados do boleto" }, { status: 500 });
  }
}
