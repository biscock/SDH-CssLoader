import {
  CSSLoaderStateActions,
  CSSLoaderStateValues,
  ICSSLoaderState,
  createCSSLoaderStore,
} from "@cssloader/backend";
import { generateStoreSelector } from "@zusteebles";
import { backend } from "./decky-backend-service";

export const cssLoaderStore = createCSSLoaderStore(backend);

export const useCSSLoaderValues = generateStoreSelector<CSSLoaderStateValues>(cssLoaderStore);
export const useCSSLoaderActions = generateStoreSelector<CSSLoaderStateActions>(cssLoaderStore);

export const getCSSLoaderState = () => cssLoaderStore.getState();
export const setCSSLoaderState = <T extends keyof ICSSLoaderState>(
  key: T,
  value: ICSSLoaderState[T]
) => cssLoaderStore.setState({ [key]: value });
