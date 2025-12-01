import { createState, onCleanup } from "gnim";
import icons from "../../icons";
import options from "../../options";
import PopupWindow from "../../widgets/PopupWindow";
import AppItem, { AppItemType } from "./AppItem";
import { Gdk, Gtk } from "ags/gtk4";
import Apps from "../../services/Apps";
import apps from "../../services/Apps";

export default () => {
  const WINDOW_NAME = "launcher";

  const [searchTerm, setSearchTerm] = createState("");
  let flowbox: Gtk.FlowBox;

  const searchBar = new Gtk.Text({
    text: "",
  });
  const searchNotifyTextHandle = searchBar.connect("notify::text", () => {
    setSearchTerm(searchBar.text);
  });
  onCleanup(() => {
    searchBar.disconnect(searchNotifyTextHandle);
  });

  const defaultSortFunc = (a: any, b: any) => {
    if (a.pinIndex < 0 && b.pinIndex >= 0) return 1;
    if (a.pinIndex >= 0 && b.pinIndex < 0) return -1;
    return a.pinIndex - b.pinIndex || b.app.frequency - a.app.frequency;
  };
  const searchSortFunc = (a: any, b: any) => {
    return b.score - a.score;
  };

  const AppFlowBox = () => {
    return (
      <Gtk.FlowBox
        class={"app-list"}
        valign={Gtk.Align.START}
        halign={Gtk.Align.START}
        minChildrenPerLine={5}
        maxChildrenPerLine={5}
        selectionMode={Gtk.SelectionMode.SINGLE}
        onMap={(self) => {
          const firstChild = self.get_child_at_index(0);
          if (firstChild) {
            self.select_child(firstChild);
          }
          searchBar.grab_focus_without_selecting();
        }}
        $={(self) => {
          flowbox = self;
          self.set_sort_func(defaultSortFunc);

          const pins = new Map(options.launcher.pins.map((e, i) => [e, i]));

          const children: AppItemType[] = [];

          self.connect("child-activated", (self, child) => {
            (child as AppItemType).get_child()?.activate();
          });
          const eventController = new Gtk.EventControllerKey();
          eventController.propagationPhase = Gtk.PropagationPhase.CAPTURE;
          eventController.connect("key-pressed", (source, keyval: number) => {
            switch (keyval) {
              case Gdk.KEY_Up: {
                const selected = self.get_selected_children()[0];
                if (selected) {
                  const newSelection = flowbox.get_child_at_index(
                    selected.get_index() - flowbox.get_min_children_per_line(),
                  ) as Gtk.FlowBoxChild;
                  if (newSelection?.get_child_visible()) {
                    self.select_child(newSelection);
                    newSelection.grab_focus();
                  }
                }
                return true;
              }
              case Gdk.KEY_Down: {
                const selected = self.get_selected_children()[0];
                if (selected) {
                  const newSelection = flowbox.get_child_at_index(
                    selected.get_index() + flowbox.get_min_children_per_line(),
                  ) as Gtk.FlowBoxChild;
                  if (newSelection?.get_child_visible()) {
                    self.select_child(newSelection);
                    newSelection.grab_focus();
                  }
                }
                return true;
              }
              case Gdk.KEY_Left: {
                const selected = self.get_selected_children()[0];
                if (selected) {
                  const newSelection = flowbox.get_child_at_index(
                    selected.get_index() - 1,
                  ) as Gtk.FlowBoxChild as Gtk.FlowBoxChild;
                  if (newSelection?.get_child_visible()) {
                    self.select_child(newSelection);
                    newSelection.grab_focus();
                  }
                }
                return true;
              }
              case Gdk.KEY_Right: {
                const selected = self.get_selected_children()[0];
                if (selected) {
                  const newSelection = flowbox.get_child_at_index(
                    selected.get_index() + 1,
                  ) as Gtk.FlowBoxChild as Gtk.FlowBoxChild;
                  if (newSelection?.get_child_visible()) {
                    self.select_child(newSelection);
                    newSelection.grab_focus();
                  }
                }
                return true;
              }
            }
          });
          self.add_controller(eventController);

          for (const app of Apps.get_list()) {
            const pinIndex = pins.get(app.name.toLowerCase());
            const newChild = AppItem(app, pinIndex);

            self.append(newChild);
            children.push(newChild as AppItemType);
          }

          const searchTermSubDispose = searchTerm.subscribe(() => {
            const searchString = searchTerm.get();
            if (searchString.length < 1) {
              self.set_filter_func(null);
              self.set_sort_func(defaultSortFunc);
              const firstChild = self.get_child_at_index(0);
              if (firstChild) {
                self.select_child(firstChild);
              }
              searchBar.grab_focus_without_selecting();
            } else {
              for (const child of children) {
                child.score = apps.fuzzy_score(searchString, child.app);
              }

              self.set_filter_func((child: any) => child.score > 0);
              self.set_sort_func(searchSortFunc);

              const firstChild = self.get_child_at_index(0);
              if (firstChild) {
                self.select_child(firstChild);
                firstChild.grab_focus();
              }
            }
          });

          onCleanup(() => {
            searchTermSubDispose();
          });
        }}
      ></Gtk.FlowBox>
    );
  };

  const AppLauncher = () => {
    return (
      <box orientation={Gtk.Orientation.VERTICAL} class={"launcher"}>
        <box class={"searchbar"}>
          <image iconName={icons.apps.search}></image>
          {searchBar}
        </box>
        <scrolledwindow
          vscrollbarPolicy={Gtk.PolicyType.ALWAYS}
          hscrollbarPolicy={Gtk.PolicyType.NEVER}
          onMap={(self) => {
            searchBar.grab_focus_without_selecting();
            searchBar.set_text("");
            self.vadjustment.value = self.vadjustment.lower;
          }}
          $={(self) => {
            const searchTermSubDispose = searchTerm.subscribe(() => {
              self.vadjustment.value = self.vadjustment.lower;
            });
            onCleanup(() => {
              searchTermSubDispose();
            });
          }}
        >
          <AppFlowBox></AppFlowBox>
        </scrolledwindow>
      </box>
    );
  };

  return (
    <PopupWindow
      name={WINDOW_NAME}
      transitionType={Gtk.RevealerTransitionType.NONE}
      onKeyPressedHandler={(source, keyval) => {
        switch (keyval) {
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
            source.widget.hide();
            return true;
          default:
            if (!searchBar.is_focus()) {
              searchBar.grab_focus_without_selecting();
              source.forward(searchBar);
            }
            return false;
        }
      }}
    >
      <box>
        <AppLauncher></AppLauncher>
      </box>
    </PopupWindow>
  );
};
