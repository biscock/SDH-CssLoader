import { ThemeError } from "@/types";
import { Focusable } from "@decky/ui";

export function ThemeErrorCard({ error }: { error: ThemeError }) {
  return (
    <Focusable
      focusWithinClassName="gpfocuswithin"
      onActivate={() => {}}
      className="w-full m-0 p-0"
    >
      <div
        className="flex flex-col gap-2"
        style={{
          backgroundColor: "#f002",
        }}
      >
        <span>
          <b>{error[0]}</b>
        </span>
        <span>{error[1]}</span>
      </div>
    </Focusable>
  );
}
