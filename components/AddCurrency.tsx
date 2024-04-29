'use client';

import Downshift from 'downshift';
import { useAtom } from 'jotai';

import countryByCurrencyCode from '@/config/country-by-currency-code.json';
import { currencyListAtom } from '@/lib/atoms';
import { Input } from '@/components/ui/input';

const AddCurrency = () => {
  const [currencyList, setCurrencyList] = useAtom(currencyListAtom);

  return (
    <Downshift
      onChange={(selection) => {
        if (!currencyList.includes(selection.currency_code)) {
          setCurrencyList([...currencyList, selection.currency_code]);
        }
      }}
      itemToString={(item) => (item ? item.currency_code : '')}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
      }) => (
        <div>
          <label {...getLabelProps()}>Enter a currency</label>
          <div
            style={{ display: 'inline-block' }}
            {...getRootProps({}, { suppressRefError: true })}
          >
            <Input placeholder="Search currency..." {...getInputProps()} />
          </div>
          <ul {...getMenuProps()}>
            {isOpen
              ? countryByCurrencyCode
                  .filter(
                    (item) =>
                      inputValue &&
                      item.currency_code &&
                      (item.country
                        .toLowerCase()
                        .includes(inputValue.toLowerCase()) ||
                        item.currency_code
                          .toLowerCase()
                          .includes(inputValue.toLowerCase()))
                  )
                  .map((item, index) => (
                    <li
                      key={item.country + item.currency_code}
                      {...getItemProps({
                        // key: item.currency_code,
                        index,
                        item,
                        style: {
                          backgroundColor:
                            highlightedIndex === index ? 'lightgray' : 'white',
                          fontWeight: selectedItem === item ? 'bold' : 'normal',
                        },
                      })}
                    >
                      {item.country} - {item.currency_code}
                    </li>
                  ))
              : null}
          </ul>
        </div>
      )}
    </Downshift>
  );
};

export { AddCurrency };
