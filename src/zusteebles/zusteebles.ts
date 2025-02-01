import { useRef, useState } from "react";
import { StoreApi, useStore } from "zustand";

export const generateStoreSelector =
  <TStore extends object>(store: StoreApi<TStore>) =>
  () =>
    useShallowedStore<TStore>(store);

// This allows you to use values from a Zustand store just like you would pick them out using React Context syntax
// However, all of the performance benefits of Zustand are still preserved
export function useShallowedStore<TStore extends object>(store: StoreApi<TStore>): TStore {
  const [stateProxy, setStateProxy] = useState<TStore>(createProxy(store.getState()));
  // This keeps track of all the properties that have been accessed
  // It has to be a ref and not just a regular variable so that it doesn't get nuked on re-render
  const accessedPropertiesRef = useRef<(keyof TStore)[]>([]);

  function createProxy(state: TStore): TStore {
    return Object.freeze(
      new Proxy(state, {
        get(target, property) {
          !accessedPropertiesRef.current.includes(property as keyof TStore) &&
            accessedPropertiesRef.current.push(property as keyof TStore);
          return target[property as keyof TStore];
        },
      })
    );
  }

  useStore(store, (state) => {
    // If any of the accessed properties have changed, update the proxy
    accessedPropertiesRef.current.some((key) => state[key] !== stateProxy[key]) &&
      setStateProxy(createProxy(state));
  });

  return stateProxy;
}
