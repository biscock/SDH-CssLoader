import { themeCardStylesGenerator } from "@/styles";

export type ColumnNumbers = 3 | 4 | 5;

export function ThemeCardCSSVariableProvider({ cardSize }: { cardSize: ColumnNumbers }) {
  return <style>{themeCardStylesGenerator(cardSize)}</style>;
}
