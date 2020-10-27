import {useState} from 'react';

export const useControlledInput = initial => {
  const [value, setValue] = useState(initial);

  return {
    value,
    onChange: (event) => setValue(event.target.value)
  };
};