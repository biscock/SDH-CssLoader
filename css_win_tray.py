"""
Cross-platform tray icon for the standalone CSSLoader backend.

Originally Windows-only (hence the file name, kept for backward compatibility);
now also covers macOS (menu bar item via pystray's Cocoa backend) and Linux
desktops (AppIndicator). The tray can be hidden entirely by writing the
``disable_tray`` setting via the Desktop UI or by creating a ``DISABLE_TRAY``
file inside ``~/homebrew/themes``.
"""

import asyncio, os, subprocess, sys, webbrowser

import pystray
from PIL import Image

import css_theme
import css_utils

ICON = None
MAIN = None
LOOP = None
DEV_MODE_STATE = False


def _schedule(coro) -> None:
    """Submit *coro* to the asyncio loop in a thread-safe way.

    Tray menu callbacks fire on whichever thread runs the icon's run loop,
    which on macOS is the main thread and on Windows / Linux is a detached
    pystray thread. In both cases, that's a different thread from the one
    actually running the asyncio event loop.
    """
    if LOOP is None:
        return
    try:
        asyncio.run_coroutine_threadsafe(coro, LOOP)
    except Exception as e:
        css_utils.Log(f"Failed to schedule tray callback on loop: {e}")


def _open_path(path: str) -> None:
    """Open a file/folder in the platform's native file manager."""
    if not path or not os.path.exists(path):
        return

    try:
        if css_utils.PLATFORM_WIN:
            os.startfile(path)  # type: ignore[attr-defined]
        elif css_utils.PLATFORM_MAC:
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen(["xdg-open", path])
    except Exception as e:
        css_utils.Log(f"Failed to open path '{path}': {e}")


def reset():
    _schedule(MAIN.reset(MAIN))


def open_theme_dir():
    _open_path(css_utils.get_theme_path())


def exit():
    _schedule(MAIN.exit(MAIN))


def get_dev_mode_state(x) -> bool:
    return DEV_MODE_STATE


def toggle_dev_mode_state():
    global DEV_MODE_STATE
    DEV_MODE_STATE = not DEV_MODE_STATE
    _schedule(MAIN.toggle_watch_state(MAIN, get_dev_mode_state(None)))


def check_if_symlink_exists():
    return os.path.exists(os.path.join(css_utils.get_steam_path(), "steamui", "themes_custom"))


def open_install_docs():
    if css_utils.PLATFORM_MAC:
        webbrowser.open_new_tab("https://docs.deckthemes.com/CSSLoader/Install/")
    else:
        webbrowser.open_new_tab("https://docs.deckthemes.com/CSSLoader/Install/#windows")


def get_desktop_install_path():
    if css_utils.PLATFORM_WIN:
        win_path = "C:/Program Files/CSSLoader Desktop/CSSLoader Desktop.exe"
        if os.path.exists(win_path):
            return win_path
    elif css_utils.PLATFORM_MAC:
        mac_path = "/Applications/CSSLoader Desktop.app"
        if os.path.exists(mac_path):
            return mac_path

    return None


def open_desktop():
    path = get_desktop_install_path()
    if path is None:
        return

    try:
        if css_utils.PLATFORM_MAC:
            subprocess.Popen(["open", path])
        else:
            subprocess.Popen([path])
    except Exception as e:
        css_utils.Log(f"Failed to open Desktop app: {e}")


def _images_label() -> str:
    has_symlink = check_if_symlink_exists()
    if css_utils.PLATFORM_WIN:
        return "Local Images/Fonts: Enabled" if has_symlink else "Local Images/Fonts: Disabled"
    return "Local Images/Fonts: Enabled" if has_symlink else "Steam not detected (run Steam once)"


def _icon_image() -> Image.Image:
    """Load the tray icon from disk, falling back to a tiny default if missing."""
    candidates = [
        os.path.join(os.path.dirname(__file__), "assets", "paint-roller-solid.png"),
    ]

    # When packaged by PyInstaller in --onefile mode, assets land next to the
    # extracted bundle under sys._MEIPASS.
    if getattr(sys, "_MEIPASS", None):
        candidates.insert(0, os.path.join(sys._MEIPASS, "assets", "paint-roller-solid.png"))

    for path in candidates:
        if os.path.exists(path):
            return Image.open(path)

    css_utils.Log("Tray icon asset not found; using blank fallback")
    fallback = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    return fallback


def _build_icon(main, loop) -> bool:
    """Configure the global ICON object. Returns False if the tray is disabled."""
    global ICON, MAIN, LOOP, DEV_MODE_STATE
    MAIN = main
    LOOP = loop
    DEV_MODE_STATE = MAIN.observer is not None

    # Allow the user to permanently hide the tray (e.g. via the Desktop UI).
    if css_utils.store_or_file_config("disable_tray"):
        css_utils.Log("Tray icon disabled via 'disable_tray' setting")
        ICON = None
        return False

    has_symlink = check_if_symlink_exists()

    menu_items = [
        pystray.MenuItem(f"CSS Loader v{css_theme.CSS_LOADER_VER}", action=None, enabled=False),
        pystray.MenuItem(_images_label(), action=None, enabled=None),
    ]

    if css_utils.PLATFORM_WIN and not has_symlink:
        menu_items.append(
            pystray.MenuItem("Please enable Windows Developer Mode", action=open_install_docs, visible=True)
        )

    menu_items.extend(
        [
            pystray.MenuItem(
                "Open Desktop App",
                action=open_desktop,
                enabled=get_desktop_install_path() is not None,
                default=True,
            ),
            pystray.MenuItem("Live CSS Editing", toggle_dev_mode_state, checked=get_dev_mode_state),
            pystray.MenuItem("Open Themes Folder", open_theme_dir),
            pystray.MenuItem("Reload Themes", reset),
            pystray.MenuItem("Exit", exit),
        ]
    )

    ICON = pystray.Icon(
        "CSS Loader",
        title="CSS Loader",
        icon=_icon_image(),
        menu=pystray.Menu(*menu_items),
    )
    return True


def start_icon(main, loop):
    """Start the tray icon in a detached thread (Windows / Linux pattern).

    The caller is expected to keep the asyncio event loop running on the main
    thread. Do not use this on macOS \u2014 NSStatusItem must own the main
    thread; call :func:`start_icon_blocking` instead.
    """
    if not _build_icon(main, loop):
        return
    ICON.run_detached()


def start_icon_blocking(main, loop):
    """Run the tray icon on the calling thread, blocking until ``stop_icon``.

    Used on macOS where the AppKit run loop must own the main thread. Returns
    immediately if the user has opted out via the ``disable_tray`` setting.
    """
    if not _build_icon(main, loop):
        return
    # ``Icon.run`` blocks until ``stop()`` is called from another thread.
    ICON.run()


def stop_icon():
    if ICON is not None:
        ICON.stop()
