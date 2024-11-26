import { Variable, bind } from "astal";
import { App, Astal } from "astal/gtk3";
import icons from "../icons.js";
import { Applications, Gdk, Gtk, Widget } from "../imports.js";
import options from "../options.js";
import PopupWindow from "../widgets/PopupWindow.js";
import AppItem from "./AppItem.js";

const WINDOW_NAME = "launcher";
const searchTerm = Variable("");

const searchBar = Widget.Entry({
  hexpand: false,
  primaryIconName: icons.apps.search,
  setup: (self) => {
    self.grab_focus_without_selecting();
  },
  text: searchTerm(),
  on_changed: ({ text }) => {
    searchTerm.set(text);
  },
});

const defaultSortFunc = (a, b) => {
  if (a.pinIndex < 0 && b.pinIndex >= 0) return 1;
  if (a.pinIndex >= 0 && b.pinIndex < 0) return -1;
  return a.pinIndex - b.pinIndex || b.app.frequency - a.app.frequency;
};
const searchSortFunc = (a, b) => {
  return b.score - a.score;
};

const Applauncher = () => {
  const flowbox = () =>
    Widget.FlowBox({
      className: "app-list",
      valign: Gtk.Align.START,
      halign: Gtk.Align.START,
      minChildrenPerLine: 5,
      maxChildrenPerLine: 5,
      selectionMode: Gtk.SelectionMode.BROWSE,
      setup: (self) => {
        self.set_sort_func(defaultSortFunc);

        const pins = new Map(options.launcher.pins.map((e, i) => [e, i]));

        for (const app of Applications.get_list()) {
          const pinIndex = pins.get(app.name.toLowerCase());
          self.add(AppItem(app, pinIndex));
        }

        self.hook(searchTerm, (self) => {
          if (searchTerm.get().length < 1) {
            self.set_filter_func(null);
            self.set_sort_func(defaultSortFunc);
            self.select_child(self.get_child_at_index(0));
            self.get_child_at_index(0).grab_focus();
            return;
          }
          for (const ch of self.get_children()) {
            ch.score = Applications.fuzzy_score(searchTerm.get(), ch.app);
          }
          self.set_filter_func((ch) => ch.score > 0);
          self.set_sort_func(searchSortFunc);
          self.select_child(self.get_child_at_index(0));
          self.get_child_at_index(0).grab_focus();
        });

        self.hook(self, "child-activated", (self, child) => {
          child.get_child().activate();
        });
      },
    });

  return Widget.Box({
    vertical: true,
    className: "launcher",
    children: [
      searchBar,
      Widget.Scrollable({
        hscroll: "never",
        vscroll: "always",
        child: bind(Applications, "list").as(() => flowbox()),
        setup: (self) => {
          self.hook(searchTerm, () => {
            self.vadjustment.value = self.vadjustment.lower;
          });
          self.hook(self, "map", () => {
            self.vadjustment.value = self.vadjustment.lower;
          });
        },
      }),
    ],
    setup: (self) => {
      self.hook(self, "map", () => {
        // recreate the list every time the window is opened
        // Applications.reload();
        // Applications.notify("list");

        searchTerm.set("");
        searchBar.grab_focus();
      });
    },
  });
};

export default () =>
  PopupWindow({
    name: WINDOW_NAME,
    transition: Gtk.RevealerTransitionType.NONE,
    layer: Astal.Layer.OVERLAY,
    keymode: Astal.Keymode.ON_DEMAND,
    exclusivity: Astal.Exclusivity.IGNORE,
    location: "center",
    child: Applauncher(),
    setup: (self) => {
      self.hook(self, "key-press-event", (_, event) => {
        const key = event.get_keyval()[1];
        switch (key) {
          case Gdk.KEY_downarrow:
          case Gdk.KEY_Up:
          case Gdk.KEY_Down:
          case Gdk.KEY_Left:
          case Gdk.KEY_Right:
          case Gdk.KEY_Tab:
          case Gdk.KEY_Return:
          case Gdk.KEY_Page_Up:
          case Gdk.KEY_Page_Down:
          case Gdk.KEY_Home:
          case Gdk.KEY_End:
            return false;
          case Gdk.KEY_Escape:
            self.close();
            return true;
          default:
            if (!searchBar.isFocus) {
              searchBar.grab_focus_without_selecting();
            }
            return false;
        }
      });
    },
  });
