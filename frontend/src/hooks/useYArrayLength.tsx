import { useEffect, useState } from 'react';
import * as Y from 'yjs';

/**
 * Track the length of a Y.Array as React state
 *
 * `useY` hook is insufficient here because it tracks the entire array,
 * which causes unnecessary re-renders when only the length is needed.
 *
 * @param yArray - Y.Array to track length of
 * @returns React stateful length of the Y.Array
 */
export default function useYArrayLength<T>(yArray: Y.Array<T>): number {
  const [length, setLength] = useState(yArray.length);

  useEffect(() => {
    const observer = () => setLength(yArray.length);
    yArray.observe(observer);
    return () => yArray.unobserve(observer);
  }, [yArray]);

  return length;
}
