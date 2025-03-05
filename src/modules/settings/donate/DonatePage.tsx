import { useCSSLoaderValues } from "@/backend";
import { Focusable, Navigation, PanelSection, ScrollPanelGroup } from "@decky/ui";
import { SiKofi, SiPatreon } from "react-icons/si";
import { Selectable } from "../../../lib/primitives";

export function DonatePage() {
  const { patrons } = useCSSLoaderValues();
  return (
    <Focusable>
      <p>
        Donations help to cover the costs of hosting the store, as well as funding development for
        CSS Loader and its related projects.
      </p>
      <Focusable className="grid grid-cols-2 w-full gap-4">
        <Focusable
          onActivate={() => Navigation.NavigateToExternalWeb("https://patreon.com/deckthemes")}
          className="flex flex-col gap-2"
          focusWithinClassName="gpfocuswithin"
        >
          <div className="flex flex-col">
            <div className="flex gap-1">
              <SiPatreon className="text-2xl" />
              <span className="text-2xl font-bold">Patreon</span>
            </div>
            <span className="text-xl font-bold">Recurring Donation</span>
            <span className="text-lg">patreon.com/deckthemes</span>
          </div>
          <ul className="m-0 pl-4">
            <li>
              {/* Potentially could expand this to add it to deckthemes and audioloader */}
              Your name in CSS Loader
            </li>
            <li>Patreon badge on deckthemes.com</li>
            <li>
              {/* Could also impl. this on deck store to make it more meaningful */}
              Colored name + VIP channel in the DeckThemes Discord
            </li>
          </ul>
        </Focusable>
        <Focusable
          onActivate={() => Navigation.NavigateToExternalWeb("https://ko-fi.com/suchmememanyskill")}
          className="flex flex-col"
          focusWithinClassName="gpfocuswithin"
        >
          <div className="flex gap-1">
            <SiKofi className="text-2xl" />
            <span className="text-2xl font-bold">Kofi</span>
          </div>
          <span className="text-xl font-bold">One-time Donation</span>
          <span className="text-lg">ko-fi.com/suchmememanyskill</span>
        </Focusable>
      </Focusable>
      {patrons.length > 0 && (
        <div className="mt-4 mb-4">
          <span className="text-2xl font-bold">Patreon Supporters</span>
          {patrons.map((patron) => (
            <Selectable>
              <p className="m-0">{patron}</p>
            </Selectable>
          ))}
        </div>
      )}
    </Focusable>
  );
}
