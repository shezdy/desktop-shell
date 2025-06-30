import { App, Astal } from "astal/gtk3";
import { Notifications, Widget } from "../imports.js";
import Notification from "./Notification.js";

const notificationPopupTimeout = 5000;
// cacheNotificationActions = true;

const Popups = () =>
  Widget.Box({
    vertical: true,
    hpack: "end",
    attribute: {
      map: new Map(),
      dismiss: (box, id) => {
        if (!box.attribute.map.has(id)) return;

        const notif = box.attribute.map.get(id);
        notif.attribute.count--;

        if (notif.attribute.count <= 0) {
          box.attribute.map.delete(id);
          notif.attribute.destroyWithAnims(box.attribute.map.size === 0);
        }
      },
      notify: (box, id) => {
        const notif = Notifications.get_notification(id);

        if (Notifications.dnd || !notif) return;

        if (box.attribute.map.size === 0) App.get_window("popupNotifications").visible = true;

        const replace = box.attribute.map.get(id);

        if (!replace) {
          const notification = Notification(notif);

          box.attribute.map.set(id, notification);
          notification.attribute.count = 1;
          box.pack_start(notification, false, false, 0);
        } else {
          const notification = Notification(notif, true);

          notification.attribute.count = replace.attribute.count + 1;
          box.remove(replace);
          replace.destroy();
          box.pack_start(notification, false, false, 0);
          box.attribute.map.set(id, notification);
        }

        setTimeout(() => {
          box.attribute.dismiss(box, id);
        }, notificationPopupTimeout);
      },
    },

    setup: (self) => {
      self
        .hook(Notifications, "notified", (box, id) => box.attribute.notify(box, id))
        .hook(Notifications, "resolved", (box, id) => box.attribute.dismiss(box, id));
      // .hook(Notifications, (box, id) => box.attribute.dismiss(box, id, true), "closed");
    },
  });

const PopupList = () =>
  Widget.Box({
    className: "notifications-popup-list",
    css: "padding: 1px; min-width: 1px",
    children: [Popups()],
  });

export default () =>
  Widget.Window({
    name: "popupNotifications",
    namespace: "popupNotifications",
    anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT,
    child: PopupList(),
    layer: Astal.Layer.OVERLAY,
    visible: false,
  });
