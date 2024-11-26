import { bind } from "astal";
import { App } from "astal/gtk3";
import System from "system";
import icons from "../icons.js";
import { Gdk, SystemTray, Widget } from "../imports.js";

const systrayExclude = ["spotify", "opensnitch-ui"];

export default () =>
  Widget.Box({
    className: "systray",
    on_destroy: () => {
      print("destroy");
    },
    setup: (self) => {
      // const update = () => {
      //   self.children = SystemTray.get_items().reduce((filtered, item) => {
      //     if (item.title !== "spotify" && item.title !== "opensnitch-ui") {
      //       if (item.iconThemePath) App.add_icons(item.iconThemePath);
      //       const menu = item.create_menu();
      //       filtered.push(
      //         Widget.Button({
      //           child: Widget.Icon({
      //             icon: icons.apps.fallback,
      //             on_destroy: () => {
      //               print("destroy");
      //             },
      //           }),
      //           // child: Widget.Label({ label: "t" }),
      //           on_destroy: () => {
      //             self.child?.destroy();
      //             menu?.destroy();
      //             print("destroy");
      //           },
      //           onClickRelease: (self) => {
      //             menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
      //             self.hide();
      //             self.show();
      //           },
      //           // onPrimaryClick: (_, event) => item.activate(event),
      //           // onSecondaryClick: (_, event) => item.openMenu(event),
      //           tooltipMarkup: bind(item, "tooltip-markup"),
      //         }),
      //       );
      //     }
      //     return filtered;
      //   }, []);
      // };
      // self.hook(SystemTray, "notify::items", update);
      // update();
      const TrayItem = (item) => {
        const menu = item.create_menu();
        return Widget.Button({
          child: Widget.Icon({
            gIcon: bind(item, "gicon"),
          }),
          id: item.itemId,
          on_destroy: () => {
            menu?.destroy();
          },
          onClick: (self, event) => {
            switch (event.button) {
              case 1:
                item.activate(event.x, event.y);
                break;
              case 3:
                menu?.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
                break;
            }
          },
          tooltipMarkup: bind(item, "tooltip-markup"),
        });
      };
      self.hook(SystemTray, "item-added", (self, itemId) => {
        const item = SystemTray.get_item(itemId);
        if (item && !systrayExclude.includes(item.title)) {
          if (item.iconThemePath) App.add_icons(item.iconThemePath);
          self.add(TrayItem(item));
        }
      });
      self.hook(SystemTray, "item-removed", (self, itemId) => {
        if (itemId) self.children.find((c) => c.id === itemId)?.destroy();
      });
      for (const item of SystemTray.get_items()) {
        if (item && !systrayExclude.includes(item.title)) {
          if (item.iconThemePath) App.add_icons(item.iconThemePath);
          self.add(TrayItem(item));
        }
      }
    },
  });
