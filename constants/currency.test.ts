import { formatPrice, DEFAULT_CURRENCY } from './currency';

// Intl.NumberFormat sépare le symbole du montant par une espace insécable
// (U+00A0), pas une espace normale : on normalise avant de comparer pour ne
// pas dépendre de ce détail d'implémentation, potentiellement variable selon
// le moteur JS (Node vs Hermes).
function normalizeSpaces(value: string): string {
  return value.replace(/ /g, ' ');
}

describe('formatPrice', () => {
  it('formats an amount using the given currency', () => {
    expect(normalizeSpaces(formatPrice(1000, 'XAF'))).toBe('FCFA 1,000');
  });

  it('falls back to the default currency when none is given', () => {
    expect(formatPrice(9.5)).toBe(formatPrice(9.5, DEFAULT_CURRENCY));
  });

  it('falls back to a plain "CODE amount" string for an invalid currency code', () => {
    expect(formatPrice(12.5, 'NOTACODE')).toBe('NOTACODE 12.50');
  });
});
