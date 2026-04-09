import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, cpfCnpj, phone } = await req.json();

    if (!process.env.ASAAS_API_KEY) {
      return NextResponse.json({ success: false, error: "ASAAS_API_KEY não configurada" }, { status: 500 });
    }

    const response = await fetch("https://api.asaas.com/v3/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: process.env.ASAAS_API_KEY,
      },
      body: JSON.stringify({
        name,
        cpfCnpj,
        phone,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, data }, { status: response.status });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Erro ao criar cliente no ASAAS" }, { status: 500 });
  }
}
