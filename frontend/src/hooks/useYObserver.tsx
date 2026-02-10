import { useEffect, useState } from 'react';
import * as Y from 'yjs';

/**
 * Shallow observer for Y.Array
 * @template T Type of items in the Y.Array
 * @template K Type of mapped items
 * @param yArray - Y.Array to observe
 * @param map - Mapping function from T to K
 * @returns Reactive array of mapped items
 */
export default function useYArrayObserver<T, K>(
  yArray: Y.Array<T>,
  map: (item: T) => K,
) {
  const [items, setItems] = useState<K[]>([]);

  useEffect(() => {
    const observer = () => setItems(yArray.map(map));
    yArray.observe(observer);
    return () => yArray.unobserve(observer);
  }, [yArray, map]);

  return items;
}
