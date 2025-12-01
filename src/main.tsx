import app from "ags/gtk4/app";
import { exec } from "ags/process";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { createBinding, For, This } from "gnim";
import AltTab, { cycleNext } from "./modules/alttab/AltTab";
import Bar from "./modules/bar/Bar";
import { mprisCurrentPlayer } from "./modules/bar/Media";
import Dashboard from "./modules/dashboard/Dashboard";
import Desktop from "./modules/desktop/Desktop";
import AppLauncher from "./modules/launcher/AppLauncher";
import NotificationPopups from "./modules/notifications/NotificationPopups";
import PowerMenu from "./modules/powermenu/PowerMenu";
import PowerMenuConfirm from "./modules/powermenu/PowerMenuConfirm";
import options from "./options";
import scss from "./styles/main.scss";
import { minimizeFocused, restoreClient } from "./utils/hyprland";
import { toggleWindow } from "./utils/utils";

const INSTANCE_NAME = "plantshell";
app.start({
  instanceName: INSTANCE_NAME,
  gtkTheme: "Adwaita",
  css: scss,
  icons: `${SRC}/assets`,
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
        if (options.currentDesktop === "hyprland") minimizeFocused();
        break;
      case "restoreClient":
        if (options.currentDesktop === "hyprland") restoreClient();
        break;
      case "altTabStart":
        cycleNext(true);
        break;
      case "altTabCycleNext":
        cycleNext();
        break;
      case "mprisPlayPause":
        mprisCurrentPlayer?.play_pause();
        break;
      case "mprisNext":
        mprisCurrentPlayer?.next();
        break;
      case "mprisPrevious":
        mprisCurrentPlayer?.previous();
        break;
      case "mprisVolUp":
        if (mprisCurrentPlayer) mprisCurrentPlayer.volume += 0.05;
        break;
      case "mprisVolDown":
        if (mprisCurrentPlayer) mprisCurrentPlayer.volume -= 0.05;
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

if (options.currentDesktop === "hyprland") {
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
