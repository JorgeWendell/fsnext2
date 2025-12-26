"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  placeholder = "Buscar...",
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <div className={`flex items-center space-x-2 ${className || ""}`}>
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="max-w-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

