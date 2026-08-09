const currencyDisplayNames = new Intl.DisplayNames(['en'], {
  type: 'currency',
});

export function formatCurrencyName(currencyCode: string) {
  return currencyDisplayNames.of(currencyCode) || currencyCode;
}
