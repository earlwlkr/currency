const currencyDisplayNames = new Intl.DisplayNames(['en'], {
  type: 'currency',
});

export function formatCurrencyName(currencyCode: string) {
  return currencyDisplayNames.of(currencyCode) || currencyCode;
}

const amountFormatters = new Map<string, Intl.NumberFormat>();
const smallAmountFormatter = new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 3,
});
const rateFormatter = new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 5,
});

function getCurrencyFractionDigits(currencyCode: string) {
  try {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

// Amounts use the currency's minor units (VND 0, USD 2, BHD 3); values
// below one keep a few significant digits so they never round to zero.
export function formatAmount(amount: number, currencyCode: string) {
  if (Math.abs(amount) > 0 && Math.abs(amount) < 1) {
    return smallAmountFormatter.format(amount);
  }

  let formatter = amountFormatters.get(currencyCode);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: getCurrencyFractionDigits(currencyCode),
    });
    amountFormatters.set(currencyCode, formatter);
  }
  return formatter.format(amount);
}

export function formatRate(rate: number) {
  return rateFormatter.format(rate);
}
