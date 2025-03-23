export type ColumnNumbers = 3 | 4 | 5;

export function ThemeCardCSSVariableProvider({ cardSize }: { cardSize: ColumnNumbers }) {
  return <style>{themeCardStylesGenerator(cardSize)}</style>;
}

export function themeCardStylesGenerator(size: ColumnNumbers) {
  return `
          :root {
            --cl-storeitem-width: ${size === 3 ? "260px" : size === 4 ? "195px" : "152px"};
            --cl-storeitem-imgheight: ${
              size === 3
                ? (260 / 16) * 10 + "px"
                : size === 4
                ? (195 / 16) * 10 + "px"
                : (152 / 16) * 10 + "px"
            };
            --cl-storeitem-fontsize: ${size === 3 ? "1em" : size === 4 ? "0.75em" : "0.5em"};
            --cl-storeitem-bubblesize: ${size === 3 ? "40px" : size === 4 ? "30px" : "20px"};
          }
        `;
}
