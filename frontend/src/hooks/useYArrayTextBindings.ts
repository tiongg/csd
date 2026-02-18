import { TextAreaBinding, type TextAreaBindingOptions } from '@/lib/y-textarea';
import { useCallback, useEffect, useRef } from 'react';
import type * as Y from 'yjs';

/**
 * Hook to manage TextArea bindings for an array of Y.Text elements.
 * Handles creating, updating, and cleaning up bindings as the array changes.
 *
 * @param yArray - The Y.Array containing Y.Text elements
 * @param bindingConfig - Configuration for creating bindings (awareness, clientName, color)
 * @returns An object containing:
 *   - getRef: Callback ref setter for a specific index
 */
export function useYArrayTextBindings(
  yArray: Y.Array<Y.Text>,
  bindingConfig: TextAreaBindingOptions,
) {
  const bindingsRef = useRef<Map<number, TextAreaBinding>>(new Map());
  const refsMap = useRef<Map<number, HTMLTextAreaElement>>(new Map());

  const getRef = useCallback((index: number) => {
    return (element: HTMLTextAreaElement | null) => {
      if (element) {
        refsMap.current.set(index, element);
      } else {
        refsMap.current.delete(index);
      }
    };
  }, []);

  // Manage bindings
  useEffect(() => {
    const currentBindings = bindingsRef.current;
    const currentRefs = refsMap.current;

    // Create bindings for any options that don't have one yet
    for (let i = 0; i < yArray.length; i++) {
      const yText = yArray.get(i) as Y.Text;
      const ref = currentRefs.get(i);

      if (ref && !currentBindings.has(i)) {
        const binding = new TextAreaBinding(yText, ref, bindingConfig);
        currentBindings.set(i, binding);
      }
    }

    // Clean up bindings for removed options
    const existingIndices = Array.from(currentBindings.keys());
    for (const index of existingIndices) {
      if (index >= yArray.length) {
        currentBindings.get(index)?.destroy();
        currentBindings.delete(index);
      }
    }

    // Clean up all bindings on unmount
    return () => {
      for (const binding of currentBindings.values()) {
        binding.destroy();
      }
      currentBindings.clear();
    };
  }, [yArray, bindingConfig]);

  return { getRef };
}
