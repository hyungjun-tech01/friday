import { useEffect, useRef } from 'react';

const usePrevious = (value) => {
  console.log('usePrevious : start');
  const prevValue = useRef();

  useEffect(() => {
    console.log('usePrevious : useEffect');
    prevValue.current = value;
  }, [value]);

  return prevValue.current;
};

export default usePrevious;