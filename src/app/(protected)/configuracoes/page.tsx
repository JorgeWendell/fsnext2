import { ChevronRight, Package } from "lucide-react";
import Link from "next/link";


export default function Configuracoes() {
  return (
    <div className="p-6">
      <div className="space-y-3">
        <Link
          href="/configuracoes/gestao-pacotes"
          className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Gestão de Pacotes
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gerencie os pacotes para as escolas
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </Link>
      </div>
    </div>
  );
}
