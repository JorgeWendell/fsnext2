import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { value, maxInstallmentCount: rawInstallments, name, description, externalReference } = body;

    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({ success: false, error: "ASAAS_API_KEY não configurada" }, { status: 500 });
    }

    const baseUrl = process.env.ASAAS_API_URL?.replace(/\/$/, "") || "https://api.asaas.com";

    const totalValue = typeof value === "number" ? value : parseFloat(String(value || "0"));

    const maxInstallmentCount =
      typeof rawInstallments === "number"
        ? rawInstallments
        : parseInt(String(rawInstallments || "1"), 10) || 1;

    const response = await fetch(`${baseUrl}/v3/paymentLinks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name,
        description,
        value: totalValue,
        billingType: "CREDIT_CARD",
        chargeType: "INSTALLMENT",
        maxInstallmentCount,
        externalReference,
      }),
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
    return NextResponse.json(
      { success: false, error: "Erro ao criar link de pagamento no ASAAS" },
      { status: 500 },
    );
  }
}
