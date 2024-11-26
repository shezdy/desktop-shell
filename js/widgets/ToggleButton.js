import { Variable } from "astal";
import { App, Astal } from "astal/gtk3";
import icons from "../icons.js";
import { Widget } from "../imports.js";

/** name of the currently opened menu  */
export const opened = Variable("");
App.connect("window-toggled", (_, win) => {
  if (win.name === "dashboard" && !win.visible)
    setTimeout(() => {
      opened.set("");
    }, 500);
});

/**
 * @param {string} name - menu name
 * @param {(() => void) | false=} activate
 */
export const Arrow = (name, activate) => {
  let deg = 0;
  let iconOpened = false;
  return Widget.Button({
    className: "arrow",
    child: Widget.Icon({
      icon: icons.ui.arrow.right,
      setup: (self) => {
        self.hook(opened, (icon) => {
          if ((opened.get() === name && !iconOpened) || (opened.get() !== name && iconOpened)) {
            const step = opened.get() === name ? 10 : -10;
            iconOpened = !iconOpened;
            for (let i = 0; i < 9; ++i) {
              setTimeout(() => {
                deg += step;
                icon.css = `-gtk-icon-transform: rotate(${deg}deg);`;
              }, 15 * i);
            }
          }
        });
      },
    }),
    onClick: () => {
      opened.set(opened.get() === name ? "" : name);
      if (typeof activate === "function") activate();
    },
  });
};

/**
 * @param {Object} o
 * @param {string} o.name - menu name
 * @param {import('gi://Gtk').Gtk.Widget} o.icon
 * @param {import('gi://Gtk').Gtk.Widget} o.label
 * @param {() => void} o.activate
 * @param {() => void} o.deactivate
 * @param {boolean=} o.activateOnArrow
 * @param {[import('gi://GObject').GObject.Object, () => boolean]} o.connection
 */
export const ArrowToggleButton = ({
  name,
  icon,
  label,
  activate,
  deactivate,
  activateOnArrow = true,
  connection: [service, condition],
}) =>
  Widget.Box({
    className: "toggle-button",
    setup: (self) => {
      self.hook(service, () => {
        self.toggleClassName("active", condition());
      });
    },
    children: [
      Widget.Button({
        child: Widget.Box({
          hexpand: true,
          className: "label-box horizontal",
          children: [icon, label],
        }),
        onClicked: () => {
          if (condition()) {
            deactivate();
            if (opened.get() === name) opened.set("");
          } else {
            activate();
          }
        },
      }),
      Arrow(name, activateOnArrow && activate),
    ],
  });

/**
 * @param {Object} o
 * @param {string} o.name - menu name
 * @param {import('gi://Gtk').Gtk.Widget} o.icon
 * @param {import('gi://Gtk').Gtk.Widget} o.title
 * @param {import('gi://Gtk').Gtk.Widget[]} o.content
 */
export const Menu = ({ name, icon, title, content }) =>
  Widget.Revealer({
    transition: "slide_down",
    revealChild: opened((v) => v === name),
    child: Widget.Box({
      className: `menu ${name}`,
      vertical: true,
      children: [
        Widget.Box({
          className: "title horizontal",
          children: [icon, title],
        }),
        Widget.Separator(),
        ...content,
      ],
    }),
  });

/**
 * @param {Object} o
 * @param {import('gi://Gtk').Gtk.Widget} o.icon
 * @param {() => void} o.toggle
 * @param {[import('gi://GObject').GObject.Object, () => boolean]} o.connection
 */
export const SimpleToggleButton = ({ icon, toggle, connection: [service, condition] }) =>
  Widget.Button({
    className: "simple-toggle",
    setup: (self) => {
      self.hook(service, () => {
        self.toggleClassName("active", condition());
      });
    },
    child: icon,
    onClicked: toggle,
  });
