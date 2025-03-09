import { Focusable, Navigation } from "@decky/ui";
import { Selectable } from "../../../lib/primitives";

export function CreditsPage() {
  return (
    <Focusable className="cl_settingspage_container">
      <div className="flex flex-col gap-4">
        <Selectable className="flex flex-col">
          <span className="text-2xl font-bold">Developers</span>
          <ul>
            <li>
              <span>SuchMeme - github.com/suchmememanyskill</span>
            </li>
            <li>
              <span>Beebles - github.com/beebls</span>
            </li>
            <li>
              <span>EMERALD - github.com/EMERALD0874</span>
            </li>
          </ul>
        </Selectable>
        <Selectable className="flex flex-col">
          <span className="text-2xl font-bold">Support</span>
          <span>
            See the DeckThemes Discord server for support.
            <br />
            <span
              onClick={() => {
                Navigation.NavigateToExternalWeb("https://deckthemes.com/discord");
              }}
            >
              deckthemes.com/discord
            </span>
          </span>
        </Selectable>
        <Selectable className="flex flex-col">
          <span className="text-2xl font-bold">Create and Submit Your Own Theme</span>
          <span>
            Instructions for theme creation/submission are available DeckThemes' documentation
            website.
            <br />
            <span
              onClick={() => {
                Navigation.NavigateToExternalWeb("https://docs.deckthemes.com");
              }}
            >
              docs.deckthemes.com
            </span>
          </span>
        </Selectable>
      </div>
    </Focusable>
  );
}
