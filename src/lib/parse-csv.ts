function detectDelimiter(headerLine: string): "," | ";" {
  const semicolons = (headerLine.match(/;/g) ?? []).length;
  const commas = (headerLine.match(/,/g) ?? []).length;
  return semicolons > commas ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current.trim());
  return fields;
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

const HEADER_ALIASES: Record<string, string> = {
  nome: "name",
  name: "name",
  codigo: "codigo",
  codigo_escola: "codigo",
  ano: "ano",
  endereco: "address",
  address: "address",
  telefone: "phone",
  phone: "phone",
  representante: "representante",
  representante_id: "representante",
  representanteid: "representante",
  pacote: "pacote",
  pacote_id: "pacote",
  pacoteid: "pacote",
};

export type CsvEscolaRow = {
  name: string;
  codigo: string;
  ano: string;
  address: string;
  phone: string;
  representante: string;
  pacote: string;
};

export function parseEscolasCsv(content: string): CsvEscolaRow[] {
  const normalized = content.replace(/^\uFEFF/, "").trim();
  if (!normalized) return [];

  const lines = normalized.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map(normalizeHeader);
  const fieldKeys = headers.map((header) => HEADER_ALIASES[header] ?? header);

  const rows: CsvEscolaRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const values = parseCsvLine(lines[lineIndex], delimiter);
    const record: Record<string, string> = {};

    fieldKeys.forEach((key, index) => {
      record[key] = values[index]?.trim() ?? "";
    });

    const isEmpty = !record.name && !record.codigo && !record.representante;
    if (isEmpty) continue;

    rows.push({
      name: record.name ?? "",
      codigo: record.codigo ?? "",
      ano: record.ano ?? "",
      address: record.address ?? "",
      phone: record.phone ?? "",
      representante: record.representante ?? "",
      pacote: record.pacote ?? "",
    });
  }

  return rows;
}

export const ESCOLAS_CSV_TEMPLATE =
  "nome,codigo,ano,endereco,telefone,representante,pacote\n" +
  "Escola Exemplo,001,2026,Rua Exemplo 123,11999999999,Nome do Representante,Nome do Pacote\n";
