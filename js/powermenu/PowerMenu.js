import { App, Astal } from "astal/gtk3";
import { execSh } from "../helpers/Misc.js";
import icons from "../icons.js";
import { Gdk, Widget } from "../imports.js";
import options from "../options.js";
import { ConfirmAction } from "../widgets/Confirm.js";
import PopupWindow, { closePopupWindow } from "../widgets/PopupWindow.js";

const WINDOW_NAME = "powermenu";

const PowerMenuButton = (action, confirm = true) =>
  Widget.Button({
    onClicked: () => {
      if (confirm) ConfirmAction(() => execSh(options.powermenu[action]));
      else execSh(options.powermenu[action]);
      closePopupWindow(WINDOW_NAME);
    },
    child: Widget.Box({
      vertical: true,
      child: Widget.Icon({ icon: icons.powermenu[action] }),
    }),
    setup: (self) => {
      self.hook(self, "enter-notify-event", (self) => {
        self.grab_focus();
      });
    },
  });

export default () =>
  PopupWindow({
    name: WINDOW_NAME,
    layer: Astal.Layer.OVERLAY,
    exclusivity: Astal.Exclusivity.IGNORE,
    keymode: Astal.Keymode.ON_DEMAND,
    child: Widget.Box({
      children: [
        PowerMenuButton("shutdown"),
        PowerMenuButton("reboot"),
        PowerMenuButton("lock", true),
        PowerMenuButton("suspend", false),
        PowerMenuButton("logout"),
      ],
      setup: (self) => {
        self.hook(self, "map", (self) => {
          self.children[2].grab_focus();
        });
        self.hook(self, "key-press-event", (_, event) => {
          const key = event.get_keyval()[1];
          switch (key) {
            case Gdk.KEY_Escape:
              self.close();
              return true;
          }
        });
      },
    }),
  });
