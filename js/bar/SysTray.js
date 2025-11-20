import { bind } from "astal";
import { App } from "astal/gtk3";
import System from "system";
import icons from "../icons.js";
import { Gdk, Gtk, SystemTray, Widget } from "../imports.js";

const systrayExclude = ["spotify", "opensnitch-ui"];

export default () =>
  Widget.Box({
    className: "systray",
    children: bind(SystemTray, "items").as((items) => {
      const buttons = [];
      for (const item of items) {
        if (item && !systrayExclude.includes(item.title)) {
          buttons.push(
            // Widget.MenuButton({
            //   tooltipMarkup: bind(item, "tooltipMarkup"),
            //   usePopover: false,
            //   actionGroup: bind(item, "action-group").as((ag) => ["dbusmenu", ag]),
            //   menuModel: bind(item, "menu-model"),
            //   child: Widget.Icon({ gicon: bind(item, "gicon") }),
            // }),
            Widget.Button({
              tooltipMarkup: bind(item, "tooltipMarkup"),
              actionGroup: bind(item, "action-group").as((ag) => ["dbusmenu", ag]),
              menuModel: bind(item, "menu-model"),
              menu: bind(item, "menu-model").as((model) => {
                const menu = Gtk.Menu.new_from_model(model);
                return menu;
              }),
              onClick: (self, event) => {
                if (self.menu.get_attach_widget() !== self) self.menu.attach_to_widget(self, null);
                switch (event.button) {
                  case 1:
                    item.activate(0, 0);
                    break;
                  case 3:
                    item.about_to_show();
                    self.active = true;
                    self.menu.popup_at_widget(
                      self,
                      Gdk.Gravity.SOUTH_WEST,
                      Gdk.Gravity.NORTH_WEST,
                      null,
                    );
                    break;
                }
              },
              child: Widget.Icon({ gicon: bind(item, "gicon") }),
            }),
          );
        }
      }

      return buttons;
    }),
  });
