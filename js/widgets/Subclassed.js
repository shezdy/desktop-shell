import { Gdk, Gtk, Widget, astalify } from "astal/gtk3";
import GObject from "gi://GObject";

export class Calendar extends astalify(Gtk.Calendar) {
  static {
    GObject.registerClass(Calendar);
  }

  constructor(props) {
    super(props || {});
  }
}

export class FlowBox extends astalify(Gtk.FlowBox) {
  static {
    GObject.registerClass(FlowBox);
  }

  constructor(props) {
    super(props || {});
  }
}

export class FlowBoxChild extends astalify(Gtk.FlowBoxChild) {
  static {
    GObject.registerClass(FlowBoxChild);
  }

  constructor(props) {
    super(props || {});
  }
}

export class Menu extends astalify(Gtk.Menu) {
  static {
    GObject.registerClass(Menu);
  }

  constructor(props) {
    super(props || {});
  }
}

export class MenuItem extends astalify(Gtk.MenuItem) {
  static {
    GObject.registerClass(MenuItem);
  }

  constructor(props) {
    super(props || {});
  }
}

export class Separator extends astalify(Gtk.Separator) {
  static {
    GObject.registerClass(Separator);
  }

  constructor(props) {
    super(props || {});
  }
}
