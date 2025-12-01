import { Astal, Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd";
import { NotificationAnimated } from "./Notification";
import {  For, createState, onCleanup } from "gnim";

export default function NotificationPopups() {
  const notifd = AstalNotifd.get_default();

  const popups = new Gtk.Box();
  popups.orientation = Gtk.Orientation.VERTICAL;
  popups.valign = Gtk.Align.END;

  const [notifications, setNotifications] = createState([] as AstalNotifd.Notification[]);

  const [notifWindowVisible, setNotifWindowVisible] = createState(false);

  const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
    const notification = notifd.get_notification(id);
    if (!notification) return;

    if (replaced && notifications.get().some((n) => n.id === id)) {

      setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)));
    } else {

      setNotifications((ns) => [notification, ...ns]);
    }

    if (notifications.get().length > 0) setNotifWindowVisible(true);
  });

  onCleanup(() => {
    notifd.disconnect(notifiedHandler);
  });

  return (
    <window
      $={(self) => onCleanup(() => self.destroy())}
      class="notifications-popup-list "
      visible={notifWindowVisible}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For each={notifications}>
          {(notification) => {
            const removeFromList = () => {
              setNotifications((ns) =>
                ns.filter((n) => {
                  return n.id !== notification.id;
                }),
              );
              if (notifications.get().length < 1) setNotifWindowVisible(false);
            };

            return (
              <NotificationAnimated
                notification={notification}
                removeFromList={removeFromList}
              ></NotificationAnimated>
            );
          }}
        </For>
      </box>
    </window>
  );
}
