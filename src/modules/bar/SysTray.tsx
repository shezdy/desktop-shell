import { createBinding, For, onCleanup } from "gnim";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import AstalTray from "gi://AstalTray?version=0.1";
import { Gdk, Gtk } from "ags/gtk4";

const systrayExclude = ["spotify", "opensnitch-ui"];

const itemWidgetInit = (self: Gtk.Box, item: AstalTray.TrayItem, menu: Gtk.PopoverMenu) => {
  self.append(menu);
  self.insert_action_group("dbusmenu", item.actionGroup);
  const notifyActionGroupHandle = item.connect("notify::action-group", () => {
    self.insert_action_group("dbusmenu", item.actionGroup);
  });

  onCleanup(() => {
    item.disconnect(notifyActionGroupHandle);
  });
};

const ItemWidget = (item: AstalTray.TrayItem) => {
  const menu = Gtk.PopoverMenu.new_from_model(item.menuModel);
  menu.hasArrow = false;

  return (
    <box
      $={(self) => {
        itemWidgetInit(self, item, menu);
      }}
      cssClasses={createBinding(menu,"visible").as((visible) => {
        if (visible) return ["tray-item", "active"]
        else return ["tray-item"]
      })}
    >
      <Gtk.GestureClick
        button={Gdk.BUTTON_PRIMARY}
        onPressed={() => {
          item.activate(0, 0);
        }}
      />
      <Gtk.GestureClick
        button={Gdk.BUTTON_SECONDARY}
        onPressed={() => {
          item.about_to_show();
          menu.popup();
        }}
      />
      <image
        pixelSize={14}
        $={(self) => {
          const setIcon = () => {
            if (item.iconPixbuf) {
              self.set_from_pixbuf(
                item.iconPixbuf?.scale_simple(14, 14, GdkPixbuf.InterpType.BILINEAR),
              );
            } else {
              self.set_from_gicon(item.gicon);
            }
          };

          const notifyIconPixbufHandle = item.connect("notify::icon-pixbuf", setIcon);
          setIcon();

          onCleanup(() => {
            item.disconnect(notifyIconPixbufHandle);
          });
        }}
      />
    </box>
  );
};

export default () => {
  const tray = AstalTray.get_default();
  const items = createBinding(tray, "items");

  return (
    <box class={"systray"}>
      <For each={items}>
        {(item) => {
          if (
            systrayExclude.find((exclude) => {
              return exclude === item.title;
            })
          )
            return <box></box>;
          return ItemWidget(item);
        }}
      </For>
    </box>
  );
};
