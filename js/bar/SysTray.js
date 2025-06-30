import { bind } from "astal";
import { App } from "astal/gtk3";
import System from "system";
import icons from "../icons.js";
import { Gdk, SystemTray, Widget } from "../imports.js";

const systrayExclude = ["spotify", "opensnitch-ui"];

export default () =>
  Widget.Box({
    className: "systray",
    children: bind(SystemTray, "items").as((items) => {
      const buttons = [];
      for (const item of items) {
        if (item && !systrayExclude.includes(item.title)) {
          buttons.push(
            Widget.MenuButton({
              tooltipMarkup: bind(item, "tooltipMarkup"),
              usePopover: false,
              actionGroup: bind(item, "action-group").as((ag) => ["dbusmenu", ag]),
              menuModel: bind(item, "menu-model"),
              child: Widget.Icon({ gicon: bind(item, "gicon") }),
            }),
          );
        }
      }

      return buttons;
    }),
  });
