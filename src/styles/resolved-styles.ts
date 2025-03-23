import { gamepadDialogClasses } from "@decky/ui";

// These are styles that depend on the webpack exported classes

export const resolvedStyles = `
.cl-store-dropdown-hide-spacer > button > div > div {
  width: 100% !important;
  display: flex !important;
  align-items: start !important;
}

.cl-store-dropdown-hide-spacer > button > div > .${gamepadDialogClasses.Spacer} {
  width: 0 !important;
}

.cl-store-scale-slider {
  min-width: 20% !important;
}

.cl-store-scale-slider > div > div > .${gamepadDialogClasses.FieldChildrenInner} {
  min-width: 100% !important;
}
`;
