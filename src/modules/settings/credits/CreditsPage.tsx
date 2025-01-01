export function CreditsPage() {
  return (
    <div>
      <div className="flex flex-col">
        <div>
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
        </div>
        <div>
          <span className="text-2xl font-bold">Support</span>
          <span>
            See the DeckThemes Discord server for support.
            <br />
            deckthemes.com/discord
          </span>
        </div>
        <div>
          <span className="text-2xl font-bold">Create and Submit Your Own Theme</span>
          <span>
            Instructions for theme creation/submission are available DeckThemes' documentation
            website.
            <br />
            docs.deckthemes.com
          </span>
        </div>
      </div>
    </div>
  );
}
