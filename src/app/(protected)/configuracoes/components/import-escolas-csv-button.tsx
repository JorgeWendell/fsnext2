"use client";

import { FileUp, School } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRef } from "react";
import { toast } from "sonner";

import { importEscolasCsv } from "@/actions/import-escolas-csv";
import { Button } from "@/components/ui/button";
import { ESCOLAS_CSV_TEMPLATE } from "@/lib/parse-csv";

const ImportEscolasCsvButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importAction = useAction(importEscolasCsv, {
    onSuccess: ({ data }) => {
      if (!data) return;

      if (data.imported > 0) {
        toast.success(
          `${data.imported} escola(s) importada(s) com sucesso${
            data.failed > 0 ? `. ${data.failed} linha(s) com erro.` : "."
          }`,
        );
      } else if (data.failed > 0) {
        toast.error("Nenhuma escola importada. Verifique o arquivo CSV.");
      }

      if (data.errors.length > 0) {
        const preview = data.errors.slice(0, 3).join(" | ");
        const suffix =
          data.errors.length > 3
            ? ` (+${data.errors.length - 3} erro(s))`
            : "";
        toast.error(`${preview}${suffix}`, { duration: 8000 });
      }
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "Erro ao importar escolas. Tente novamente.",
      );
    },
  });

  const handleDownloadTemplate = () => {
    const blob = new Blob([ESCOLAS_CSV_TEMPLATE], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-escolas.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Selecione um arquivo .csv");
      event.target.value = "";
      return;
    }

    const csvContent = await file.text();
    importAction.execute({ csvContent });
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={importAction.isPending}
        onClick={() => fileInputRef.current?.click()}
      >
        <FileUp className="h-4 w-4" />
        {importAction.isPending ? "Importando..." : "Importar CSV"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={handleDownloadTemplate}>
        Baixar modelo
      </Button>
    </div>
  );
};

const ImportEscolasCard = () => {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
        <School className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 space-y-2">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Importar escolas
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Importe escolas em lote via arquivo CSV. Colunas: nome, codigo, ano,
            endereco, telefone, representante (opcional) e pacote (opcional).
          </p>
        </div>
        <ImportEscolasCsvButton />
      </div>
    </div>
  );
};

export default ImportEscolasCard;
