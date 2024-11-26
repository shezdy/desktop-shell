import { idle } from "astal";
import { App, Astal } from "astal/gtk3";
import { Hyprland, Widget } from "../imports.js";

// import Battery from "./Battery.js";
import Clock from "./Clock.js";
import Media from "./Media.js";
import Network from "./Network.js";
import SysTray from "./SysTray.js";
import Tasklist from "./Tasklist.js";
import Volume from "./Volume.js";
import Workspaces from "./Workspaces.js";

const LauncherButton = () => {
  return Widget.Button({
    onClicked: () => {
      App.get_window("launcher").visible = true;
    },
    className: "launcher-button",
  });
};

const SysIndicators = () => {
  return Widget.Box({
    className: "system-indicators",
    children: [
      Widget.EventBox({
        className: "eventbox",
        child: Widget.Box({
          children: [
            Volume(),
            //Battery(),
            Network(),
            Clock(),
          ],
        }),
        setup: (self) => {
          self.hook(App, "window-toggled", (self, win) => {
            if (win.name === "dashboard") {
              self.toggleClassName("active", win.visible);
            }
          });
        },
      }),
    ],
  });
};

const ConfigErrorIndicator = () =>
  Widget.Button({
    className: "error-indicator",
    child: Widget.Label({ label: "-------", visible: true }),
    visible: false,
    onClicked: () => {
      Hyprland.message(
        "dispatch exec [float;move onscreen 0% 0%;size 800, 500] kitty -e hyprpm update",
      );
    },
    setup: (self) => {
      const update = () => {
        const errors = JSON.parse(Hyprland.message("j/configerrors"));
        if (errors[0] !== "") {
          self.visible = true;
          self.tooltipText = errors.join("\n");
        } else {
          self.visible = false;
        }
      };

      update();
      self.hook(Hyprland, "config-reloaded", update);
    },
  });

const Left = (monitor) =>
  Widget.Box({
    className: "left",
    children: [LauncherButton(), Workspaces(monitor)],
    setup: (self) => {
      idle(() => self.add(ConfigErrorIndicator()));
    },
  });

const Center = (monitor) =>
  Widget.Box({
    className: "center",
    children: [Tasklist(monitor)],
  });

const Right = () =>
  Widget.Box({
    className: "right",
    hpack: "end",
    children: [SysTray(), Media(), SysIndicators()],
  });

export default (monitor, gdkmonitor) =>
  Widget.Window({
    name: `bar${monitor}`,
    exclusivity: Astal.Exclusivity.EXCLUSIVE,
    gdkmonitor,
    anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT,
    child: Widget.Box({
      className: "bar",
      homogeneous: false,
      hpack: "fill",
      children: [Left(monitor), Center(monitor), Right()],
    }),
  });
