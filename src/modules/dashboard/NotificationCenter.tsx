import { Gtk } from "ags/gtk4";
import { createBinding, For } from "gnim";
import Notification from "../notifications/Notification";
import AstalNotifd from "gi://AstalNotifd?version=0.1";

export default () => {
  const notifd = AstalNotifd.get_default();
  const notifBind = createBinding(notifd, "notifications");

  const Placeholder = () => {
    return (
      <box
        class={"placeholder"}
        vexpand
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        visible={notifBind.as((n) => n.length === 0)}
      >
        {"No notifications"}
      </box>
    );
  };

  const NotificationHeader = () => {
    return (
      <box class={"notification-header"} halign={Gtk.Align.END}>
        <button
          onClicked={() => {
            for (const n of notifd.get_notifications()) {
              if (n) n.dismiss();
            }
          }}
        >
          {"Clear all"}
        </button>
      </box>
    );
  };

  const NotificationList = () => {
    return (
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For each={notifBind}>
          {(notif, index) => {
            return <Notification notification={notif}></Notification>;
          }}
        </For>
      </box>
    );
  };

  return (
    <box class={"notifications"} vexpand orientation={Gtk.Orientation.VERTICAL}>
      <Placeholder></Placeholder>
      <box
        vexpand
        orientation={Gtk.Orientation.VERTICAL}
        visible={notifBind.as((n) => n.length > 0)}
      >
        <scrolledwindow
          class={"notification-scrollable"}
          vexpand
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
          vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
        >
          <NotificationList></NotificationList>
        </scrolledwindow>
        <NotificationHeader></NotificationHeader>
      </box>
    </box>
  );
};
