import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, value, description, billingType, installmentCount: rawInstallmentCount, dueDate } = body;

    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({ success: false, error: "ASAAS_API_KEY não configurada" }, { status: 500 });
    }

    const installmentCount =
      typeof rawInstallmentCount === "number"
        ? rawInstallmentCount
        : parseInt(String(rawInstallmentCount || "1"), 10) || 1;

    const totalValue = typeof value === "number" ? value : parseFloat(String(value || "0"));

    const isParcelado =
      (billingType === "BOLETO" || billingType === "CREDIT_CARD") && installmentCount > 1;

    const payload: Record<string, unknown> = {
      customer: customerId,
      billingType,
      dueDate,
      description,
    };

    if (isParcelado) {
      payload.installmentCount = installmentCount;
      payload.totalValue = totalValue;
    } else {
      payload.value = totalValue;
    }

    const response = await fetch("https://api.asaas.com/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data, asaasErrors: data?.errors ?? data },
        { status: response.status },
      );
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Erro ao criar cobrança no ASAAS" }, { status: 500 });
  }
}
