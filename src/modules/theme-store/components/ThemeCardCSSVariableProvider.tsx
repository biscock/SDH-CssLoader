import { themeCardStylesGenerator } from "@/styles";
import { ColumnNumbers, useThemeBrowserSharedValue } from "../context";

export function ThemeCardCSSVariableProvider({ cardSize }: { cardSize?: ColumnNumbers }) {
  const browserCardSize = useThemeBrowserSharedValue("browserCardSize");

  return <style>{themeCardStylesGenerator(cardSize || browserCardSize)}</style>;
}
