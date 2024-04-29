type CurrencyRate = {
  date: string;
  usd: Record<string, number>;
};

export function convert(
  amount: number,
  baseCurrency: string,
  toCurrency: string,
  currencyRates: CurrencyRate
) {
  if (baseCurrency === toCurrency) {
    return amount;
  }
  const usdAmount = amount * currencyRates.usd[toCurrency.toLowerCase()];
  if (baseCurrency !== 'USD') {
    return usdAmount / currencyRates.usd[baseCurrency.toLowerCase()];
  }
  return usdAmount;
}
