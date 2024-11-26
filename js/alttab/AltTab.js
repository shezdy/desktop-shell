import { Variable, bind } from "astal";
import { App, Astal } from "astal/gtk3";
import { focusClient, getHyprlandClientIcon } from "../helpers/Misc.js";
import Mutex from "../helpers/Mutex.js";
import { Gtk, Hyprland, Widget } from "../imports.js";

const mutex = new Mutex();
const selectedIndex = Variable(1);
let clients = [];
let submap = false;
let ignoreCycle = true;

const syncClientsAndShow = () => {
  // Not using Hyprland.clients because focusHistoryID will be out of date

  try {
    const out = Hyprland.message("j/clients");
    clients = JSON.parse(out)
      .filter((client) => client.title !== "")
      .sort((a, b) => {
        return a.focusHistoryID > b.focusHistoryID;
      });

    if (clients.length === 0) return;

    altTabBox.children = [AltTabFlowbox(clients, 10)];

    if (clients.length === 1) selectedIndex.set(0);
    else selectedIndex.set(1);

    altTabBox.parent.visible = true;
    submap = true;
    ignoreCycle = true;
  } catch (error) {
    console.error(error);
  }
};

const focusClientAndHide = async (submapName) => {
  if (submap && submapName === "") {
    submap = false;
    altTabBox.parent.visible = false;
    focusClient(clients[selectedIndex.get()], true);
  }
};

Hyprland.connect("submap", (_self, submapName) => {
  if (submapName === "alttab") mutex.runExclusive(syncClientsAndShow);
  else mutex.runExclusive(focusClientAndHide, submapName);
});

export const cycleNext = (isInitialPress = false) => {
  mutex.runExclusive(() => {
    if (!submap) return;
    if (ignoreCycle && isInitialPress) {
      // ignore the first press, but continuously cycle if held down.
      ignoreCycle = false;
      return;
    }
    if (selectedIndex.get() >= clients.length - 1) selectedIndex.set(0);
    else selectedIndex.set(selectedIndex.get() + 1);
  });
};

const ClientItem = (client, index) => {
  return Widget.Button({
    child: Widget.Box({
      vertical: true,
      valign: Gtk.Align.Center,
      children: [
        Widget.Icon({
          className: "icon",
          icon: getHyprlandClientIcon(client),
          css: "font-size: 64px;",
        }),
        Widget.Label({
          className: "title",
          label: client.title,
          truncate: "end",
          wrapMode: 2, // wrap at word boundaries, but fall back to char
          lines: 2,
        }),
      ],
    }),
    onClicked: () => {
      selectedIndex.set(index);
    },
    className: selectedIndex((i) => (i === index ? "selected client" : "client")),
  });
};

const AltTabFlowbox = (clients, colNum) =>
  Widget.FlowBox({
    className: "app-list",
    minChildrenPerLine: colNum,
    maxChildrenPerLine: colNum,
    selectionMode: Gtk.SelectionMode.NONE,
    setup: (self) => {
      for (let i = 0; i < clients.length; i++) {
        self.add(ClientItem(clients[i], i));
      }
      self.show_all();
    },
  });

const AltTabBox = () =>
  Widget.Box({
    className: "alt-tab",
  });
const altTabBox = AltTabBox();

export default () =>
  Widget.Window({
    name: "alttab",
    className: "alt-tab-window",
    layer: Astal.Layer.OVERLAY,
    keymode: Astal.Keymode.NONE,
    visible: false,
    child: altTabBox,
  });
