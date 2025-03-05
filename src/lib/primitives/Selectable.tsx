import { Focusable } from "@decky/ui";

// Selectable is a container component (eg: Focusable, div) that itself can be focused by the gamepad
export function Selectable({
  children,
  className,
  onFocus,
}: {
  children: React.ReactNode;
  className?: string;
  onFocus?: () => void;
}) {
  return (
    <Focusable
      onFocus={onFocus}
      onActivate={() => {}}
      focusWithinClassName="gpfocuswithin"
      className={className}
    >
      {children}
    </Focusable>
  );
}
