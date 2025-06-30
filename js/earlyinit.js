import { App } from "astal/gtk3";
import { GLib } from "./imports.js";
// add icons before any widgets are created
App.add_icons(`${SRC}/assets`);
globalThis.USER = GLib.getenv("USER") || "";
