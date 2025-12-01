import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import Adw from "gi://Adw";
import AstalNotifd from "gi://AstalNotifd";
import Pango from "gi://Pango";
import { createState } from "gnim";
import GLib from "gi://GLib?version=2.0";

function isIcon(icon?: string | null) {
  const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
  return icon && iconTheme.has_icon(icon);
}

function fileExists(path: string) {
  return GLib.file_test(path, GLib.FileTest.EXISTS);
}

function time(time: number, format = "%H:%M") {
  return GLib.DateTime.new_from_unix_local(time).format(format)!;
}

function urgency(n: AstalNotifd.Notification) {
  const { LOW, NORMAL, CRITICAL } = AstalNotifd.Urgency;
  switch (n.urgency) {
    case LOW:
      return "low";
    case CRITICAL:
      return "critical";
    default:
      return "normal";
  }
}

const NotificationIcon = (n: AstalNotifd.Notification) => {
  const icon = new Gtk.Image();
  icon.pixelSize = 78;

  if (n.appIcon && fileExists(n.appIcon)) icon.file = n.appIcon;
  else if (n.image && fileExists(n.image)) icon.file = n.image;
  else if (n.appIcon && isIcon(n.appIcon)) icon.iconName = n.appIcon;
  else icon.iconName = "dialog-information-symbolic";

  const box = new Gtk.Box({ cssClasses: ["icon"], overflow: Gtk.Overflow.HIDDEN });
  box.append(icon);

  return box;
};

type NotificationAnimated = Gtk.Box & {
  slideLeftRevealer: Gtk.Revealer;
  slideDownRevealer: Gtk.Revealer;
};

export const NotificationAnimated = ({
  notification: n,
  removeFromList,
}: {
  notification: AstalNotifd.Notification;
  removeFromList: () => void;
}) => {
  const [revealed, setRevealed] = createState(false);

  function show() {
    setRevealed(true);
  }

  function hide() {
    setRevealed(false);
  }

  function init(self: Gtk.Box) {
    // override existing show and hide methods
    Object.assign(self, { show, hide });
    setTimeout(() => {
      self.show();
    }, 1);
    setTimeout(() => {
      self.hide();
    }, 5200);
  }

  n.connect("resolved", () => {
    removeFromList()
  });

  return (
    <box hexpand={true} halign={Gtk.Align.END} $={init}>
      <revealer
        revealChild={revealed}
        transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
        transitionDuration={200}
        onNotifyChildRevealed={({ childRevealed }) => {
          if (!childRevealed) removeFromList();
        }}
      >
        <Notification notification={n} onCloseButtonClicked={() => hide()}></Notification>
      </revealer>
    </box>
  );

};

export default function Notification({
  notification: n,
  onCloseButtonClicked = () => n.dismiss()
}: {
  notification: AstalNotifd.Notification;
  onCloseButtonClicked?: () => void;
}) {
  return (
    <Adw.Clamp class={`notification ${urgency(n)}`}>
      <box class={"content"} orientation={Gtk.Orientation.VERTICAL}>
        <box class="header">
          <label
            class="app-name"
            halign={Gtk.Align.START}
            ellipsize={Pango.EllipsizeMode.END}
            label={n.appName || "Unknown"}
          />
          <label class="time" hexpand halign={Gtk.Align.END} label={time(n.time)} />
          <button class={"close-button"} onClicked={onCloseButtonClicked}>
            <image iconName="window-close-symbolic" />
          </button>
        </box>
        <Gtk.Separator visible />
        <box class="content">
          {NotificationIcon(n)}
          <box orientation={Gtk.Orientation.VERTICAL}>
            <label
              class="summary"
              halign={Gtk.Align.START}
              xalign={0}
              label={n.summary}
              ellipsize={Pango.EllipsizeMode.END}
            />
            {n.body && (
              <label
                class="body"
                wrap
                useMarkup
                halign={Gtk.Align.START}
                xalign={0}
                justify={Gtk.Justification.FILL}
                label={n.body}
              />
            )}
          </box>
        </box>
        {n.actions.length > 0 && (
          <box class="actions">
            {n.actions.map(({ label, id }) => (
              <button hexpand onClicked={() => n.invoke(id)}>
                <label label={label} halign={Gtk.Align.CENTER} hexpand />
              </button>
            ))}
          </box>
        )}
      </box>
    </Adw.Clamp>
  );
}
