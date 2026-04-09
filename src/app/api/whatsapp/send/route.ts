import { NextResponse } from "next/server";

function normalizeWhatsAppTo(raw: unknown): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length === 0) return digits;
  if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith("55")) {
    return `55${digits}`;
  }
  return digits;
}

export async function POST(req: Request) {
  try {
    const { phone, name, message, documentUrl, documentFilename } = await req.json();

    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const waToken = process.env.WHATSAPP_TOKEN;
    if (!phoneId || !waToken) {
      return NextResponse.json(
        { success: false, error: "WhatsApp não configurado" },
        { status: 500 },
      );
    }

    const to = normalizeWhatsAppTo(phone);
    if (to.length < 12) {
      return NextResponse.json(
        { success: false, error: "Telefone inválido para WhatsApp" },
        { status: 400 },
      );
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

    const send = async (body: Record<string, unknown>) => {
      return fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${waToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    };

    const textBody = message || `Oi ${name}, tudo bem? 👋`;
    const textRes = await send({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: textBody,
        preview_url: false,
      },
    });
    const textData = await textRes.json();

    if (!textRes.ok) {
      const graphMsg =
        textData &&
        typeof textData === "object" &&
        "error" in textData &&
        textData.error &&
        typeof (textData.error as { message?: string }).message === "string"
          ? (textData.error as { message: string }).message
          : null;
      return NextResponse.json(
        { success: false, data: textData, error: graphMsg ?? "Falha ao enviar texto" },
        { status: textRes.status },
      );
    }

    if (typeof documentUrl === "string" && documentUrl.length > 0) {
      await new Promise((r) => setTimeout(r, 400));
      const docRes = await send({
        messaging_product: "whatsapp",
        to,
        type: "document",
        document: {
          link: documentUrl,
          filename: typeof documentFilename === "string" && documentFilename.length > 0 ? documentFilename : "boleto.pdf",
        },
      });
      const docData = await docRes.json();
      if (!docRes.ok) {
        return NextResponse.json(
          {
            success: true,
            documentSent: false,
            textData,
            documentError: docData,
          },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { success: true, documentSent: true, textData, documentData: docData },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true, textData }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: "Erro ao enviar mensagem WhatsApp" }, { status: 500 });
  }
}
