import { App, Astal } from "astal/gtk3";
import { launchApp } from "../helpers/Misc.js";
import icons from "../icons.js";
import { Gtk, Widget } from "../imports.js";

export default (app, pinIndex = -1) => {
  const title = Widget.Label({
    className: "title",
    label: app.name,
    maxWidthChars: 18,
    truncate: "end",
  });

  const icon = Widget.Icon({
    icon: Astal.Icon.lookup_icon(app.iconName || "") ? app.iconName || "" : icons.apps.fallback,
    css: "font-size: 48px;",
  });

  const textBox = Widget.Box({
    vertical: true,
    hpack: "center",
    children: [title],
  });

  return Widget.FlowBoxChild({
    app,
    pinIndex,
    score: 0,
    child: Widget.Button({
      className: "app-item",
      // tooltipText: app.description,
      onClicked: () => {
        App.get_window("launcher").visible = false;
        launchApp(app);
      },
      canFocus: false,
      child: Widget.Box({
        className: "box",
        vertical: true,
        valign: Gtk.Align.CENTER,
        children: [icon, textBox],
      }),
    }),
  });
};
