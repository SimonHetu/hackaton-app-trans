export function formatEntryFee(amountInCents: number, currency = "CAD") {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency,
  }).format(amountInCents / 100);
}
