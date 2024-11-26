import { App, Astal } from "astal/gtk3";
import icons from "../icons.js";
import { Widget } from "../imports.js";
import GLib from "gi://GLib";

const NotificationIcon = (n) => {
  // if (n.image) {
  //   return Widget.Box({
  //     vpack: "start",
  //     hexpand: false,
  //     className: "icon img",
  //     children: [],
  //     css: `background-image: url("${n.image}");
  //           background-size: cover;
  //           background-repeat: no-repeat;
  //           background-position: center;`,
  //   });
  // }

  let icon = "dialog-information-symbolic";
  if (n.image) icon = n.image;
  if (n.appIcon) icon = n.appIcon;

  // if (Astal.Icon.lookup_icon(appEntry)) icon = appEntry;

  return Widget.Box({
    // vpack: "start",
    hexpand: false,
    className: "icon",
    child: Widget.Icon({
      icon,
      // size: 78,
      hpack: "center",
      hexpand: true,
      vpack: "center",
      vexpand: true,
    }),
  });
};

const Notification = (notification) =>
  Widget.Box({
    className: `notification ${notification.urgency}`,
    vertical: true,
    children: [
      Widget.Box({
        className: "content",
        children: [
          NotificationIcon(notification),
          Widget.Box({
            vertical: true,
            children: [
              Widget.Box({
                children: [
                  Widget.Label({
                    className: "title",
                    label: notification.summary,
                    justification: "left",
                    maxWidthChars: 1,
                    truncate: "end",
                    wrap: true,
                    xalign: 0,
                    hexpand: true,
                  }),
                  Widget.Label({
                    className: "time",
                    label: GLib.DateTime.new_from_unix_local(notification.time).format("%H:%M"),
                  }),
                  Widget.Button({
                    className: "close-button",
                    vpack: "center",
                    child: Widget.Icon({ icon: icons.notifications.close }),
                    onClicked: () => {
                      notification.dismiss();
                    },
                  }),
                ],
              }),
              Widget.Label({
                className: "description",
                justification: "left",
                maxWidthChars: 1,
                truncate: "none",
                wrapMode: 1,
                xalign: 0,
                wrap: true,
                label: notification.body,
              }),
              // TODO fix notif hints
              // notification.hints.value
              //   ? Widget.ProgressBar({
              //       className: "progress",
              //       value: Number(notification.hints.value.unpack()) / 100,
              //     })
              //   : Widget.Box(),
            ],
          }),
        ],
      }),
      Widget.Box({
        className: notification.get_actions()?.length > 0 ? "actions visible" : "actions",
        children: notification.get_actions()?.map((action) =>
          Widget.Button({
            child: Widget.Label({ label: action.label }),
            onClicked: () => notification.invoke(action.id),
            hexpand: true,
          }),
        ),
      }),
    ],
  });

const NotificationReveal = (notification, visible = false) => {
  const slideLeftRevealer = Widget.Revealer({
    child: Notification(notification),
    revealChild: visible,
    transition: "slide_left",
    transitionDuration: 200,
    setup: (revealer) => {
      setTimeout(() => {
        revealer.revealChild = true;
      }, 1);
    },
  });

  const slideDownRevealer = Widget.Revealer({
    child: slideLeftRevealer,
    revealChild: true,
    transition: "slide_down",
    transitionDuration: 200,
  });

  const box = Widget.Box({
    hexpand: true,
    hpack: "end",
    attribute: {
      count: 0,
    },
    children: [slideDownRevealer],
  });

  box.attribute.destroyWithAnims = (shouldClose) => {
    slideLeftRevealer.revealChild = false;
    setTimeout(() => {
      slideDownRevealer.revealChild = false;
      setTimeout(() => {
        box.destroy();
        App.get_window("popupNotifications").visible = false;
      }, 200);
    }, 200);
  };

  return box;
};

export const NotificationNoReveal = (notification) => Notification(notification);

export default NotificationReveal;
