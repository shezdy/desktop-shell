import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import { openWindow } from "../../utils/utils";
import { onCleanup } from "gnim";

export default ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  let win: Astal.Window;
  onCleanup(() => {
    win.destroy();
  });

  return (
    <window
      namespace={`desktop-${gdkmonitor.connector}`}
      name={`desktop-${gdkmonitor.connector}`}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.BACKGROUND}
      keymode={Astal.Keymode.NONE}
      class={"desktop"}
      anchor={
        Astal.WindowAnchor.TOP |
        Astal.WindowAnchor.LEFT |
        Astal.WindowAnchor.RIGHT |
        Astal.WindowAnchor.BOTTOM
      }
      application={app}
      visible={true}
      gdkmonitor={gdkmonitor}
      $={(self) => {
        win = self;
      }}
    >
      <Gtk.GestureClick button={Gdk.BUTTON_SECONDARY} onPressed={() => openWindow("launcher")} />
    </window>
  );
};
