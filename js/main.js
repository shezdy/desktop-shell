import "./earlyinit.js";

import { exec } from "astal";
import { App } from "astal/gtk3";
import AltTab, { cycleNext } from "./alttab/AltTab.js";
import Bar from "./bar/Bar.js";
import Dashboard from "./dashboard/Dashboard.js";
import Desktop from "./desktop/Desktop.js";
import { minimizeFocused, restoreClient } from "./helpers/Misc.js";
import { GLib, Gdk, Hyprland } from "./imports.js";
import Launcher from "./launcher/Launcher.js";
import NotificationPopups from "./notifications/NotificationPopups.js";
import PowerMenu from "./powermenu/PowerMenu.js";
import Confirm from "./widgets/Confirm.js";

const scss = `${SRC}/scss/main.scss`;
const css = `${SRC}/build/main.css`;
// TODO: import scss instead of doing this
try {
  const [_, out, err] = GLib.spawn_command_line_sync(
    `sass --silence-deprecation=mixed-decls ${scss} ${css}`,
  );
  const decoder = new TextDecoder();

  const outDecode = decoder.decode(out).trim();
  if (outDecode.length > 0) console.log(`\n${outDecode}`);

  const errDecode = decoder.decode(err).trim();
  if (errDecode.length > 0) console.error(`\n${errDecode}`);
} catch (error) {
  console.error(error);
}

function getGdkMonitor(hyprlandMonitor) {
  if (!hyprlandMonitor) return undefined;

  const display = Gdk.Display.get_default();
  const screen = display.get_default_screen();
  for (let i = 0; i < display.get_n_monitors(); i++) {
    if (screen.get_monitor_plug_name(i) === hyprlandMonitor.name) return display.get_monitor(i);
  }

  return undefined;
}

// kded6 starts in the background sometimes? maybe related to dolphin.
// prevents system tray from working if it is left running
try {
  exec("pkill kded6");
} catch {}

globalThis.INSTANCE_NAME = "plantshell";

App.start({
  instanceName: INSTANCE_NAME,
  css: css,
  requestHandler: (request, response) => {
    let res = "ok";

    switch (request) {
      case "minimizeClient":
        minimizeFocused();
        break;
      case "restoreClient":
        restoreClient();
        break;
      case "altTabStart":
        cycleNext(true);
        break;
      case "altTabCycleNext":
        cycleNext();
        break;
      case "mprisPlayPause":
        MPRIS_CURRENT_PLAYER?.play_pause();
        break;
      case "mprisNext":
        MPRIS_CURRENT_PLAYER?.next();
        break;
      case "mprisPrevious":
        MPRIS_CURRENT_PLAYER?.previous();
        break;
      case "mprisVolUp":
        if (MPRIS_CURRENT_PLAYER) MPRIS_CURRENT_PLAYER.volume += 0.05;
        break;
      case "mprisVolDown":
        if (MPRIS_CURRENT_PLAYER) MPRIS_CURRENT_PLAYER.volume -= 0.05;
        break;
      default:
        res = "unknown request";
        break;
    }

    response(res);
  },
  main: () => {
    for (const m of Hyprland.get_monitors()) {
      App.add_window(Bar(m.id, getGdkMonitor(m)));
      App.add_window(Desktop(m.id, getGdkMonitor(m)));
    }
    App.add_window(Confirm());
    App.add_window(NotificationPopups());
    App.add_window(Dashboard());
    App.add_window(Launcher());
    App.add_window(PowerMenu());
    App.add_window(AltTab());
  },
});

Hyprland.connect("monitor-added", () => {
  Hyprland.message(
    `dispatch exec sleep 0.5; astal -i ${INSTANCE_NAME} -q ; ags run -d ${SRC} --gtk 3`,
  );
});
Hyprland.connect("monitor-removed", () => {
  Hyprland.message(
    `dispatch exec sleep 0.5; astal -i ${INSTANCE_NAME} -q ; ags run -d ${SRC} --gtk 3`,
  );
});
