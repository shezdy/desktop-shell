import app from "ags/gtk4/app";
import AstalMpris from "gi://AstalMpris?version=0.1";
import GLib from "gi://GLib?version=2.0";
// add icons before any widgets are created
app.add_icons(`${SRC}/assets`);

declare global {
    const USER: string
    const CURRENT_DESKTOP: string
    let MPRIS_CURRENT_PLAYER: AstalMpris.Player | null
}

let desktop = GLib.getenv("XDG_CURRENT_DESKTOP")
if (desktop === "Hyprland")
    desktop = "hyprland"
else 
    desktop = "unknown"

Object.assign(globalThis, {
    USER: GLib.get_user_name(),
    CURRENT_DESKTOP: desktop,
    MPRIS_CURRENT_PLAYER: null
})
