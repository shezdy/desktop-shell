import { Widget } from "../imports.js";
import GObject from "gi://GObject";
import Gtk from "gi://Gtk";

export default ({ icon = "", ...rest }) => {
  const widget = Widget.Label({
    label: icon,
    ...rest,
  });

  widget.toggleClassName("font-icon");

  return widget;
};
