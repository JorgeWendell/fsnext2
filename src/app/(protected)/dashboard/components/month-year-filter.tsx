"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MonthYearFilterProps = {
  years: number[];
  selectedYear: number;
  selectedMonth: number; // 1-12
};

const MONTHS_PT_BR: { value: number; label: string }[] = Array.from(
  { length: 12 },
  (_, idx) => {
    const month = idx + 1;
    const date = new Date(2020, idx, 1);
    const label = date.toLocaleDateString("pt-BR", { month: "long" });
    return { value: month, label };
  },
);

export function MonthYearFilter({
  years,
  selectedYear,
  selectedMonth,
}: MonthYearFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const safeYears = useMemo(() => {
    if (years.length === 0) return [selectedYear];
    return years;
  }, [years, selectedYear]);

  const handleChange = (next: { month?: number; year?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.month) params.set("month", String(next.month));
    if (next.year) params.set("year", String(next.year));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Período</span>

        <Select
          value={String(selectedMonth)}
          onValueChange={(value) => {
            handleChange({ month: Number(value) });
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS_PT_BR.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select
        value={String(selectedYear)}
        onValueChange={(value) => {
          handleChange({ year: Number(value) });
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {safeYears.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

