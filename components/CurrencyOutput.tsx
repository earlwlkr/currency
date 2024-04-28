import * as React from 'react';

const CurrencyOutput = () => {
  const currencies = [
    { name: 'USD', code: 'USD' },
    { name: 'EUR', code: 'EUR' },
    { name: 'GBP', code: 'GBP' },
  ];
  return (
    <div>
      {currencies.map((currency) => (
        <div key={currency.code}>{currency.name}</div>
      ))}
    </div>
  );
};

export { CurrencyOutput };
