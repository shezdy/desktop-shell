import { Astal, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { focusClient, getClientIcon } from "../../utils/hyprland";
import Pango from "gi://Pango?version=1.0";
import Mutex from "../../utils/mutex";
import { toggleClassName } from "../../utils/utils";
import Adw from "gi://Adw?version=1";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export default () => {
  const hyprland = AstalHyprland.get_default();
  const altTabBox = new Gtk.Box({ cssClasses: ["alt-tab"] });
  const mutex = new Mutex();
  let selectedChild: Gtk.FlowBoxChild | null = null;
  let clients: string | any[] = [];
  let submap = false;
  let ignoreCycle = true;

  const selectChild = (index: number) => {
    if (selectedChild) {
      toggleClassName(selectedChild.get_child(), "selected", false);
    }
    const flowbox = altTabBox.get_first_child() as Gtk.FlowBox;
    if (flowbox) {
      const child = flowbox.get_child_at_index(index);
      if (child) {
        toggleClassName(child.get_child(), "selected", true);
        selectedChild = child;
      }
    }
  };

  const syncClientsAndShow = () => {
    // Not using Hyprland.clients because focusHistoryID will be out of date
    try {
      const out = hyprland.message("j/clients");
      clients = JSON.parse(out)
        .filter((client: any) => client.title !== "")
        .sort((a: any, b: any) => {
          return a.focusHistoryID > b.focusHistoryID;
        });

      if (clients.length === 0) return;

      const firstChild = altTabBox.get_first_child();
      if (firstChild) altTabBox.remove(firstChild);
      altTabBox.append(AltTabFlowbox(clients, 7));

      if (clients.length === 1) selectChild(0);
      else selectChild(1);

      altTabBox.parent.visible = true;
      submap = true;
      ignoreCycle = true;
    } catch (error) {
      console.error(error);
    }
  };

  const focusClientAndHide = async (submapName: string) => {
    if (submap && submapName === "") {
      submap = false;
      altTabBox.parent.visible = false;
      const index = selectedChild?.get_index();
      if (index) focusClient(clients[index], true);
    }
  };

  hyprland.connect("submap", (_, submapName) => {
    if (submapName === "alttab") mutex.runExclusive(() => syncClientsAndShow());
    else mutex.runExclusive(() => focusClientAndHide(submapName));
  });

  const cycleNext = (isInitialPress = false) => {
    mutex.runExclusive(() => {
      if (!submap) return;
      if (ignoreCycle && isInitialPress) {
        // ignore the first press, but continuously cycle if held down.
        ignoreCycle = false;
        return;
      }
      const selectedIndex = selectedChild?.get_index();
      if (selectedIndex !== undefined) {
        if (selectedIndex >= clients.length - 1) selectChild(0);
        else selectChild(selectedIndex + 1);
      }
    });
  };

  const ClientItem = (client: any, index: number) => {
    const icon = new Gtk.Image({
      cssClasses: ["icon"],
      iconName: getClientIcon(client),
      pixelSize: 64,
    });

    const label = new Gtk.Label({
      cssClasses: ["title"],
      label: client.title,
      ellipsize: Pango.EllipsizeMode.END,
      wrapMode: Pango.WrapMode.WORD_CHAR,
      lines: 2,
    });

    const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, valign: Gtk.Align.CENTER });
    box.append(icon);
    box.append(label);

    const clamp = new Adw.Clamp({ maximumSize: 128, heightRequest: 128, widthRequest: 128 });
    clamp.set_child(box)

    const button = new Gtk.Button({ cssClasses: ["client"] });
    button.connect("clicked", () => {
      selectChild(index);
    });

    button.set_child(clamp);

    return button;
  };

  const AltTabFlowbox = (clients: any, colNum: number) => {
    const flowbox = new Gtk.FlowBox({
      cssClasses: ["app-list"],
      minChildrenPerLine: colNum,
      max_children_per_line: colNum,
      selection_mode: Gtk.SelectionMode.NONE,
    });
    for (let i = 0; i < clients.length; i++) {
      flowbox.append(ClientItem(clients[i], i));
    }
    return flowbox;
  };

  const AltTabWindow = () => {
    return (
      <window
        namespace={`alttab`}
        name={`alttab`}
        layer={Astal.Layer.OVERLAY}
        keymode={Astal.Keymode.NONE}
        // anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        application={app}
        visible={false}
      >
        {altTabBox}
      </window>
    );
  };

  return { window: AltTabWindow, cycleNext: cycleNext };
};
