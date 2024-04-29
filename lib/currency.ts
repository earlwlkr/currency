import { currencyRatesAtom, store } from './atoms';

type CurrencyRate = {
  date: string;
  usd: Record<string, number>;
};

const formatter = Intl.NumberFormat('en-US');

export function convert(
  amount: number,
  baseCurrency: string,
  toCurrency: string
) {
  if (baseCurrency === toCurrency) {
    return amount;
  }
  const currencyRates = store.get(currencyRatesAtom);
  if (currencyRates.state !== 'hasData') return '';
  const currencyRatesData = currencyRates.data;

  const usdAmount = amount * currencyRatesData.usd[toCurrency.toLowerCase()];
  if (baseCurrency !== 'USD') {
    return formatter.format(
      usdAmount / currencyRatesData.usd[baseCurrency.toLowerCase()]
    );
  }
  return formatter.format(usdAmount);
}
