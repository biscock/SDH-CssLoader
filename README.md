# CSS Loader
Dynamically loads CSS files from storage and reloads alongside Steam UI.

Read the documentation for this tool at [docs.deckthemes.com](https://docs.deckthemes.com/)

---

## biscock fork — macOS support

This fork adds first-class macOS support (Apple Silicon + Intel) for the standalone backend, in addition to the existing Decky/Linux and Windows builds. The CSS injection logic, `theme.json` format, regex tab matching, patches, and presets are unchanged from upstream — only OS-specific glue (Steam path lookup, tray icon, packaging) is platform-aware.

### macOS releases

Backend bundles are published at [biscock/SDH-CssLoader/releases](https://github.com/biscock/SDH-CssLoader/releases). They are unsigned `.app` bundles and the Desktop UI installs them automatically — see "Quick start" below.

| File | Purpose |
|---|---|
| `CssLoader-Standalone-Headless-macOS-arm64.zip` | Apple Silicon backend, used by the Desktop UI |
| `CssLoader-Standalone-Headless-macOS-x86_64.zip` | Intel backend, used by the Desktop UI |
| `CssLoader-Standalone-macOS-arm64.zip` | Apple Silicon, with a console window for debugging |
| `CssLoader-Standalone-macOS-x86_64.zip` | Intel, with a console window for debugging |

### macOS quick start

1. Install [biscock/CSSLoader-Desktop](https://github.com/biscock/CSSLoader-Desktop/releases/latest) on your Mac and let its onboarding flow install the backend automatically. The Desktop UI fetches the matching `Standalone-Headless` zip from this repo's latest release and unpacks it to `~/Library/Application Support/CssLoader/`.
2. In Steam (Mac client), right-click "Steam" in your Library → Properties → Launch Options: `-cef-enable-debugging %command%`. Restart Steam.
3. Drop themes into `~/homebrew/themes/` or use the in-app theme store.

### macOS standalone install (without the Desktop UI)

If you want to run only the backend without the Desktop UI:

1. Download the matching `CssLoader-Standalone-Headless-macOS-<arch>.zip` from the latest [release](https://github.com/biscock/SDH-CssLoader/releases/latest).
2. Unzip and move `CssLoader-Standalone-Headless.app` somewhere persistent (e.g. `/Applications/` or `~/Applications/`).
3. Strip Gatekeeper quarantine (the bundle is unsigned):
   ```
   xattr -dr com.apple.quarantine "/Applications/CssLoader-Standalone-Headless.app"
   ```
4. Double-click the `.app`. A paint-roller icon appears in the menu bar.

The backend is built with `LSUIElement=true` in its `Info.plist` so it stays out of the macOS Dock and lives only in the menu bar.

To autostart on login, create `~/Library/LaunchAgents/com.deckthemes.cssloader.backend.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.deckthemes.cssloader.backend</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/open</string>
        <string>-g</string>
        <string>/Applications/CssLoader-Standalone-Headless.app</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
```

The Desktop UI does this automatically during onboarding; this is only needed if you skipped it.

### macOS tray menu

Right-clicking (or left-clicking) the paint-roller icon in the menu bar opens a menu with:

- **Open Desktop App** — surfaces the CSSLoader Desktop UI. Works whether Desktop was launched fresh, is already running with a visible window, or is silently running in the background via Desktop's `Settings → Run at Startup` toggle. The tray invokes `open -n -a "/Applications/CSSLoader Desktop.app"`; Desktop's `tauri-plugin-single-instance` intercepts the duplicate launch, hands the existing process the new argv, exits the duplicate, and the existing process un-hides its window and promotes itself to a foreground (Dock-visible) app. This behaviour is what makes the silent autostart in CSSLoader Desktop v1.3.x usable end to end.
- **Open Themes Folder** — opens `~/homebrew/themes/` in Finder.
- **Reload Themes** — re-scans the themes folder. Equivalent to Desktop's "Reload Themes" button.
- **Live CSS Editing** — toggles dev-mode (auto-reload on file change). Useful when authoring a theme.
- **Exit** — terminates the backend process. The LaunchAgent will restart it on the next login.

If the Desktop UI is not installed at `/Applications/CSSLoader Desktop.app` (or `~/Applications/CSSLoader Desktop.app`), the **Open Desktop App** entry is greyed out.

### macOS settings

The backend reads `~/homebrew/themes/STORE` for runtime config. Two macOS-relevant keys:

- `disable_tray:1` — hide the menu-bar icon. The Desktop UI's "Show Menu Bar Icon" toggle writes this for you.
- `server_port:35821` — backend HTTP port (default `35821`); only change if it conflicts with another local service.
