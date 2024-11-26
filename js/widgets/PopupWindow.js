import { Variable } from "astal";
import { App, Astal } from "astal/gtk3";
import { Gdk, Gtk, Widget } from "../imports.js";
import options from "../options.js";

export const closePopupWindow = (name, delay = options.transition.duration) => {
  const win = App.get_window(name).attribute.shouldClose.set(true);
};

export const Padding = (name, { css = "", hexpand = true, vexpand = true } = {}) =>
  Widget.EventBox({
    hexpand,
    vexpand,
    can_focus: false,
    onClick: (self, event) => {
      closePopupWindow(name);
    },
    child: Widget.Box({ css }),
  });

const PopupRevealer = (name, child, shouldClose, transition) =>
  Widget.Box({
    css: "padding: 1px;",
    child: Widget.Revealer({
      transition_type: transition,
      child: Widget.Box({
        class_name: "window-content",
        children: [child],
      }),
      transition_duration: options.transition.duration,
      setup: (self) => {
        self.hook(App, "window-toggled", (_, win) => {
          if (win.name === name && win.visible) {
            shouldClose.set(false);
            self.reveal_child = true;
          }
        });
        self.hook(shouldClose, () => {
          if (shouldClose.get() === true) {
            self.reveal_child = false;
            const win = App.get_window(name);
            if (transition === Gtk.RevealerTransitionType.NONE) win.visible = false;
            else
              setTimeout(() => {
                win.visible = false;
              }, options.transition.duration);
          }
        });
      },
    }),
  });

const Location = (name, child, shouldClose, transition) => ({
  center: () =>
    Widget.CenterBox({
      children: [
        Padding(name),
        Widget.CenterBox({
          vertical: true,
          children: [
            Padding(name),
            PopupRevealer(name, child, shouldClose, transition),
            Padding(name),
          ],
        }),
        Padding(name),
      ],
    }),
  top: () =>
    Widget.CenterBox({
      children: [
        Padding(name),
        Widget.Box({
          vertical: true,
          children: [PopupRevealer(name, child, transition), Padding(name)],
        }),
        Padding(name),
      ],
    }),
  right: () =>
    Widget.Box({
      children: [
        Padding(name),
        Widget.Box({
          hexpand: false,
          vertical: true,
          child: PopupRevealer(name, child, shouldClose, transition),
        }),
      ],
    }),
  "top-right": () =>
    Widget.Box({
      children: [
        Padding(name),
        Widget.Box({
          hexpand: false,
          vertical: true,
          children: [PopupRevealer(name, child, transition), Padding(name)],
        }),
      ],
    }),
  "top-center": () =>
    Widget.Box({
      children: [
        Padding(name),
        Widget.Box({
          hexpand: false,
          vertical: true,
          children: [PopupRevealer(name, child, transition), Padding(name)],
        }),
        Padding(name),
      ],
    }),
  "top-left": () =>
    Widget.Box({
      children: [
        Widget.Box({
          hexpand: false,
          vertical: true,
          children: [PopupRevealer(name, child, transition), Padding(name)],
        }),
        Padding(name),
      ],
    }),
  "bottom-left": () =>
    Widget.Box({
      children: [
        Widget.Box({
          hexpand: false,
          vertical: true,
          children: [Padding(name), PopupRevealer(name, child, transition)],
        }),
        Padding(name),
      ],
    }),
  "bottom-center": () =>
    Widget.Box({
      children: [
        Padding(name),
        Widget.Box({
          hexpand: false,
          vertical: true,
          children: [Padding(name), PopupRevealer(name, child, transition)],
        }),
        Padding(name),
      ],
    }),
  "bottom-right": () =>
    Widget.Box({
      children: [
        Padding(name),
        Widget.Box({
          hexpand: false,
          vertical: true,
          children: [Padding(name), PopupRevealer(name, child, transition)],
        }),
      ],
    }),
});

export default ({
  name,
  child,
  location = "center",
  transition = Gtk.RevealerTransitionType.NONE,
  setup = (self) => {
    self.hook(self, "key-press-event", (_, event) => {
      const key = event.get_keyval()[1];
      switch (key) {
        case Gdk.KEY_Escape:
          self.close();
          return true;
      }
    });
  },
  ...props
}) => {
  const shouldClose = Variable(false);
  return Widget.Window({
    name,
    class_names: [name, "popup-window"],
    visible: false,
    keymode: Astal.Keymode.ON_DEMAND,
    layer: Astal.Layer.TOP,
    attribute: {
      shouldClose: shouldClose,
    },
    anchor:
      Astal.WindowAnchor.TOP |
      Astal.WindowAnchor.LEFT |
      Astal.WindowAnchor.RIGHT |
      Astal.WindowAnchor.BOTTOM,
    close: () => {
      shouldClose.set(true);
    },
    toggle: () => {
      const self = App.get_window(name);
      if (self.visible) shouldClose.set(true);
      else self.visible = true;
    },
    onDestroy: () => {
      shouldClose.drop();
    },
    setup,
    child: Location(name, child, shouldClose, transition)[location](),
    ...props,
  });
};
