export function conviteValorTotalReais(
  valorUnitario: string | null | undefined,
  quantidade: number | null | undefined,
): number {
  const u = parseFloat(valorUnitario || "0");
  const unit = Number.isFinite(u) ? u : 0;
  const q =
    quantidade != null &&
    Number.isFinite(quantidade) &&
    Number.isInteger(quantidade) &&
    quantidade > 0
      ? quantidade
      : 1;
  return unit * q;
}

export function conviteValorTotalString(
  valorUnitario: string | null | undefined,
  quantidade: number | null | undefined,
): string {
  return conviteValorTotalReais(valorUnitario, quantidade).toFixed(2);
}
