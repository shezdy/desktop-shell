import { App, Astal } from "astal/gtk3";
import { Widget } from "../imports.js";

export default (monitor, gdkmonitor) =>
  Widget.Window({
    name: `desktop${monitor}`,
    namespace: `desktop${monitor}`,
    className: "desktop",
    gdkmonitor,
    layer: Astal.Layer.BACKGROUND,
    exclusivity: Astal.Exclusivity.IGNORE,
    keymode: Astal.Keymode.NONE,
    anchor:
      Astal.WindowAnchor.TOP |
      Astal.WindowAnchor.LEFT |
      Astal.WindowAnchor.RIGHT |
      Astal.WindowAnchor.BOTTOM,
    child: Widget.EventBox({
      onClick: (self, event) => {
        switch (event.button) {
          case 3:
            App.get_window("launcher").visible = true;
            break;
        }
      },
    }),
  });
