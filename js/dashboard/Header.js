import { Variable, bind } from "astal";
import { App, Astal } from "astal/gtk3";
import { execSh } from "../helpers/Misc.js";
import icons from "../icons.js";
import { Gdk, Widget } from "../imports.js";
import options from "../options.js";
import Avatar from "../widgets/Avatar.js";
import { ConfirmAction } from "../widgets/Confirm.js";

const uptime = Variable("").poll(60000, "cat /proc/uptime", (out, prev) => {
  const s = parseInt(out.split(".")[0]);
  const m = Math.floor((s / 60) % 60);
  const h = Math.floor((s / 60 / 60) % 24);
  const d = Math.floor(s / 60 / 60 / 24);

  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
});

const PowerMenuItem = (action) =>
  Widget.MenuItem({
    onActivate: () => {
      App.get_window("dashboard").close();
      ConfirmAction(() => execSh(options.powermenu[action]));
    },
    child: Widget.Box({
      children: [
        Widget.Icon({ icon: icons.powermenu[action] }),
        Widget.Label({ label: `  ${action[0].toUpperCase()}${action.slice(1)}` }),
      ],
    }),
  });

const PowerMenu = () =>
  Widget.Menu({
    children: [
      PowerMenuItem("shutdown"),
      PowerMenuItem("reboot"),
      PowerMenuItem("suspend"),
      PowerMenuItem("logout"),
    ],
  });

const PowerMenuButton = () => {
  const menu = PowerMenu();
  return Widget.Button({
    child: Widget.Icon({ icon: icons.powermenu.shutdown }),
    on_destroy: () => {
      menu?.destroy();
    },
    onClicked: (self, event) =>
      menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null),
  });
};

const SystemRow = () => {
  return Widget.Box({
    children: [
      Widget.Label({
        className: "uptime",
        hexpand: true,
        label: uptime((v) => `󰅐  ${v}`),
      }),
      Widget.Button({
        vpack: "center",
        onClicked: () => {
          App.get_window("dashboard").close();
          execSh(options.powermenu.lock);
        },
        child: Widget.Icon({ icon: icons.powermenu.lock }),
      }),
      PowerMenuButton(),
    ],
  });
};

export default () =>
  Widget.Box({
    className: "header horizontal",
    children: [
      Avatar(),
      Widget.Separator(),
      Widget.Box({
        className: "system-box header horizontal",
        vertical: false,
        hexpand: true,
        hpack: "fill",
        children: [
          Widget.Box({
            vertical: true,
            homogeneous: false,
            children: [SystemRow()],
          }),
        ],
      }),
    ],
  });
