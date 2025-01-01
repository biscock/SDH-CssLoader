import { useCSSLoaderAction, useCSSLoaderValue } from "@/backend";
import { DialogButton, Focusable, TextField } from "@decky/ui";
import { useState } from "react";
import { FaArrowRightToBracket } from "react-icons/fa6";

export function AccountPage() {
  const apiFullToken = useCSSLoaderValue("apiFullToken");

  return (
    <div>
      <h1 className="cl_title">{apiFullToken ? "Your Account" : "Log In"}</h1>
      {apiFullToken ? <LoggedInSection /> : <LoggedOutSection />}
      <p>
        Logging in gives you access to star themes, saving them to their own page where you can
        quickly find them.
        <br />
        To get started, create an account on deckthemes.com and generate an account key from your
        profile page.
        <br />
      </p>
    </div>
  );
}
function LoggedInSection() {
  const apiMeData = useCSSLoaderValue("apiMeData");
  const logOut = useCSSLoaderAction("logOut");
  return (
    <Focusable className="flex items-center justify-between">
      <span className="font-bold">
        {apiMeData ? `Logged in as ${apiMeData.username}` : "Loading..."}
      </span>
      <DialogButton className="cl_accountpage_actionbutton" onClick={logOut}>
        <span>Unlink My Deck</span>
      </DialogButton>
    </Focusable>
  );
}

function LoggedOutSection() {
  const apiFullToken = useCSSLoaderValue("apiFullToken");
  const logInWithShortToken = useCSSLoaderAction("logInWithShortToken");
  const apiShortToken = useCSSLoaderValue("apiShortToken");

  const [shortTokenInterimValue, setShortTokenIntValue] = useState(apiShortToken);

  return (
    <Focusable className="flex items-center justify-between gap-2">
      <div className="flex-1">
        <TextField
          disabled={!!apiFullToken}
          label="DeckThemes Account Key"
          bIsPassword
          value={shortTokenInterimValue}
          onChange={(e) => setShortTokenIntValue(e.target.value)}
        />
      </div>
      <DialogButton
        className="cl_accountpage_actionbutton"
        disabled={shortTokenInterimValue.length !== 12}
        onClick={() => {
          logInWithShortToken(shortTokenInterimValue);
        }}
      >
        <FaArrowRightToBracket />
        <span>Log In</span>
      </DialogButton>
    </Focusable>
  );
}
