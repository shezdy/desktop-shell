import { bind } from "astal";
import { Gtk, Notifications, Widget } from "../imports.js";
import { NotificationNoReveal } from "../notifications/Notification.js";

const notifictionsClear = () => {
  for (const n of Notifications.get_notifications()) {
    n.dismiss();
  }
};

const ClearButton = () =>
  Widget.Button({
    onClick: () => notifictionsClear(),
    visible: bind(Notifications, "notifications").as((n) => n.length > 0),
    child: Widget.Box({
      children: [
        Widget.Label({ label: "Clear" }),
        // Widget.Icon({
        //   icon: bind(Notifications, "notifications").as((n) =>
        //     n.length > 0 ? "user-trash-full-symbolic" : "user-trash-symbolic",
        //   ),
        // }),
      ],
    }),
  });

const Header = () =>
  Widget.Box({
    className: "header",
    halign: Gtk.Align.END,
    children: [
      // Widget.Label({ label: "Notifications", hexpand: true, xalign: 0 }),
      ClearButton(),
    ],
  });

const NotificationList = () =>
  Widget.Box({
    vertical: true,
    vexpand: false,
    // children: bind(Notifications, "notifications").as((n) => n.reverse().map(NotificationNoReveal)),
    setup: (self) => {
      const update = () => {
        const notifs = Notifications.get_notifications();
        const newChildren = [];

        for (let i = notifs.length - 1; i >= 0; i--) {
          const widget = NotificationNoReveal(notifs[i]);
          if (widget) newChildren.push(widget);
        }
        self.children = newChildren;
      };
      self.hook(Notifications, "notify::notifications", update);
      update();
    },
  });

const Placeholder = () =>
  Widget.Box({
    className: "placeholder",
    vertical: true,
    vexpand: true,
    vpack: "center",
    hpack: "center",
    children: [
      // Widget.Icon("notifications-disabled-symbolic"),
      Widget.Label({ label: "No notifications", vexpand: true }),
    ],
    visible: bind(Notifications, "notifications").as((n) => n.length === 0),
  });

export default () =>
  Widget.Box({
    className: "notifications",
    vexpand: true,
    vertical: true,
    children: [
      Placeholder(),
      Widget.Scrollable({
        vexpand: true,
        className: "notification-scrollable",
        hscroll: "never",
        vscroll: "automatic",
        child: Widget.Box({
          className: "notification-list",
          vertical: true,
          children: [NotificationList()],
        }),
        visible: bind(Notifications, "notifications").as((n) => n.length > 0),
      }),
      Header(),
    ],
  });
