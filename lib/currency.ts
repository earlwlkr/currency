import { currencyRatesAtom, store } from './atoms';

type CurrencyRate = {
  date: string;
  usd: Record<string, number>;
};

export function convert(
  amount: number,
  baseCurrency: string,
  toCurrency: string
) {
  if (baseCurrency === toCurrency) {
    return amount;
  }
  const currencyRates = store.get(currencyRatesAtom);
  const usdAmount = amount * currencyRates.usd[toCurrency.toLowerCase()];
  if (baseCurrency !== 'USD') {
    return usdAmount / currencyRates.usd[baseCurrency.toLowerCase()];
  }
  return usdAmount;
}
