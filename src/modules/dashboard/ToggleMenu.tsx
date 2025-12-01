import { createState } from "gnim";
import icons from "../../icons";
import app from "ags/gtk4/app";
import GObject from "gnim/gobject";
import { Gtk } from "ags/gtk4";

/** name of the currently opened menu  */
export const [opened, setOpened] = createState("");
app.connect("window-toggled", (_, win) => {
  if (win.name === "dashboard" && !win.visible)
    setTimeout(() => {
      setOpened("");
    }, 500);
});

type ArrowProps = {
  name: string;
  pixelSize?: number;
  onActivate?: () => void;
};

export const Arrow = ({ name, pixelSize = 16, onActivate }: ArrowProps) => {
  return (
    <button
      class={"arrow"}
      onClicked={() => {
        setOpened(opened.get() === name ? "" : name);
        if (onActivate) onActivate();
      }}
    >
      <image
        iconName={icons.ui.arrow.right}
        pixelSize={pixelSize}
        class={opened.as((o) => {
          if (o === name) return "opened";
          else return "";
        })}
      ></image>
    </button>
  );
};

type MenuProps = {
  name: string;
  children: GObject.Object | Array<GObject.Object | string>;
};

export const Menu = ({ name, children }: MenuProps) => {
  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
      revealChild={opened.as((o) => o === name)}
    >
      <box cssClasses={["menu", name]} orientation={Gtk.Orientation.VERTICAL}>
        {children instanceof GObject.Object
          ? children
          : children.map((item) =>
              item instanceof Gtk.Widget ? item : <Gtk.Label label={item.toString()} />,
            )}
      </box>
    </revealer>
  );
};

// /**
//  * @param {Object} o
//  * @param {string} o.name - menu name
//  * @param {import('gi://Gtk').Gtk.Widget} o.icon
//  * @param {import('gi://Gtk').Gtk.Widget} o.title
//  * @param {import('gi://Gtk').Gtk.Widget[]} o.content
//  */
// export const Menu = ({ name, icon, title, content }) =>
//   Widget.Revealer({
//     transition: "slide_down",
//     revealChild: opened((v) => v === name),
//     child: Widget.Box({
//       className: `menu ${name}`,
//       vertical: true,
//       children: [
//         Widget.Box({
//           className: "title horizontal",
//           children: [icon, title],
//         }),
//         Widget.Separator(),
//         ...content,
//       ],
//     }),
//   });
