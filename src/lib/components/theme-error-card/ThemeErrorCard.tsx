import { ThemeError } from "@/types";
import { Focusable } from "@decky/ui";
import { Selectable } from "../../primitives";

export function ThemeErrorCard({ error }: { error: ThemeError }) {
  return (
    <Selectable className="w-full m-0 p-0">
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
    </Selectable>
  );
}
