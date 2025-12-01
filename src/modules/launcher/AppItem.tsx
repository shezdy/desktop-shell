import Pango from "gi://Pango?version=1.0";
import icons from "../../icons";
import { closeWindow, launchApp, lookupIcon } from "../../utils/utils";
import { Gtk } from "ags/gtk4";
import AstalApps from "gi://AstalApps?version=0.1";

export type AppItemType = Gtk.FlowBoxChild & {
  app: AstalApps.Application
  pinIndex: number;
  score: number;
};

export default (app: AstalApps.Application, pinIndex = -1) => {
  const title = new Gtk.Label({
    cssClasses: ["title"],
    label: app.name,
    maxWidthChars: 18,
    ellipsize: Pango.EllipsizeMode.END,
  });

  const textBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    halign: Gtk.Align.CENTER,
  });
  textBox.append(title);

  const icon = new Gtk.Image({
    iconName: lookupIcon(app.iconName) ? app.iconName : icons.apps.fallback,
    pixelSize: 48,
  });

  const contentBox = new Gtk.Box({
    cssClasses: ["box"],
    orientation: Gtk.Orientation.VERTICAL,
    valign: Gtk.Align.CENTER,
  });
  contentBox.append(icon);
  contentBox.append(textBox);

  const button = new Gtk.Button({
    cssClasses: ["app-item"],
    can_focus: false,
    child: contentBox,
  });
  button.connect("clicked", () => {
    closeWindow("launcher");
    // @ts-expect-error
    launchApp(`gio launch ${app.app.filename}`);
  });

  const flowBoxChild = new Gtk.FlowBoxChild({ child: button });

  Object.assign(flowBoxChild, { app: app, pinIndex: pinIndex, score: 0 });

  return flowBoxChild;
};
