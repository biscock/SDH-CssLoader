import { getGamepadNavigationTrees } from "@decky/ui";

export function getElementFromNavID(navID: string) {
  const all = getGamepadNavigationTrees();
  if (!all) return null;
  const tree = all?.find((e: any) => e.m_ID.includes(navID));
  if (!tree) return null;
  return tree.Root.Element;
}
export function getSP() {
  return getElementFromNavID("GamepadUI");
}
export function getQAM() {
  return getElementFromNavID("QuickAccess");
}
export function getMainMenu() {
  return getElementFromNavID("MainNavMenu");
}
export function getRootElements() {
  return [getSP(), getQAM(), getMainMenu()].filter(Boolean);
}
