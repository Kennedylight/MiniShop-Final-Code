export const DEFAULT_CURRENCY = 'USD';

export function formatPrice(amount: number, currencyCode?: string) {
  const code = currencyCode || DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}
