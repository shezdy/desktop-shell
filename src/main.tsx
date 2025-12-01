import "./earlyinit";

import app from "ags/gtk4/app";
import Bar from "./modules/bar/Bar";
import Desktop from "./modules/desktop/Desktop";
import NotificationPopups from "./modules/notifications/NotificationPopups";
import scss from "./styles/main.scss";
import { toggleWindow } from "./utils/utils";
import PowerMenu from "./modules/powermenu/PowerMenu";
import PowerMenuConfirm from "./modules/powermenu/PowerMenuConfirm";
import AppLauncher from "./modules/launcher/AppLauncher";
import AltTab, { cycleNext } from "./modules/alttab/AltTab";
import Dashboard from "./modules/dashboard/Dashboard";
import { createBinding, For, This } from "gnim";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { minimizeFocused, restoreClient } from "./utils/hyprland";
import { exec } from "ags/process";

const INSTANCE_NAME = "plantshell";
app.start({
  instanceName: INSTANCE_NAME,
  gtkTheme: "Adwaita",
  css: scss,
  requestHandler: (request, response) => {
    let res = "ok";

    switch (request[0]) {
      case "launcher":
        toggleWindow("launcher");
        break;
      case "powermenu":
        toggleWindow("powermenu");
        break;
      case "dashboard":
        toggleWindow("dashboard");
        break;
      case "minimizeClient":
        if (CURRENT_DESKTOP === "hyprland") minimizeFocused();
        break;
      case "restoreClient":
        if (CURRENT_DESKTOP === "hyprland") restoreClient();
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
    try {
      exec("killall kded6");
    } catch {}

    const monitors = createBinding(app, "monitors");

    NotificationPopups();
    PowerMenu();
    PowerMenuConfirm();
    AppLauncher();
    AltTab();
    Dashboard();

    return (
      <For each={monitors}>
        {(monitor) => {
          return (
            <This this={app}>
              <Bar gdkmonitor={monitor}></Bar>
              <Desktop gdkmonitor={monitor}></Desktop>
            </This>
          );
        }}
      </For>
    );
  },
});

if (CURRENT_DESKTOP === "hyprland") {
  const hyprland = AstalHyprland.get_default();
  hyprland.connect("monitor-added", () => {
    hyprland.message(
      `dispatch exec sleep 0.5; ags -i ${INSTANCE_NAME} quit ; ags run -d ${SRC} --gtk 4`,
    );
  });
  hyprland.connect("monitor-removed", () => {
    hyprland.message(
      `dispatch exec sleep 0.5; ags -i ${INSTANCE_NAME} quit ; ags run -d ${SRC} --gtk 4`,
    );
  });
}
