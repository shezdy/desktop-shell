import { bind } from "astal";
import { focusClientOrMinimize, fullscreenToggle, getHyprlandClientIcon } from "../helpers/Misc.js";
import { Hyprland, Widget } from "../imports.js";

const TaskButton = (client, monitorID) => {
  return Widget.Button({
    onClick: (self, event) => {
      switch (event.button) {
        case 1:
          focusClientOrMinimize(client);
          break;
        case 2:
          Hyprland.message(`dispatch closewindow address:0x${client.address}`);
          break;
        case 3:
          fullscreenToggle(client, 1, false);
          break;
      }
    },
    hexpand: true,
    child: Widget.Box({
      children: [
        Widget.Icon({
          className: "icon",
          icon: getHyprlandClientIcon(client),
          css: "font-size: 14px;",
        }),
        Widget.Label({
          className: "title",
          truncate: "end",
          setup: (self) => {
            const update = () => {
              let str = client.title;
              if (client.floating) str = `󰁞 ${str}`;
              if (client.fullscreen) str = `󱇬 ${str}`;
              self.label = str;
            };
            self.hook(client, "notify::title", update);
            self.hook(client, "notify::floating", update);
            self.hook(client, "notify::fullscreen", update);
            update();
          },
        }),
      ],
    }),
    attribute: {
      address: client.address,
    },
    client: client,
    setup: (self) => {
      self.hook(Hyprland, "notify::focused-client", () => {
        self.toggleClassName("active", Hyprland.focusedClient?.address === client?.address);
      });
    },
  });
};

export default (monitorID) => {
  return Widget.Box({
    className: "tasklist",
    hexpand: true,
    homogeneous: true,
    setup: (self) => {
      // workaround for first startup, Hyprland monitor.activeWorkspace doesn't get updated by astal
      let monitorFocusedWs = Hyprland.get_monitor(monitorID)?.activeWorkspace.id;
      const updateChild = (c) => {
        if (!c.client) {
          c?.destroy();
          return;
        }
        if (!c.client.workspace || !c.client.monitor) {
          c.visible = false;
          return;
        }
        c.visible =
          c.client.monitor.id === monitorID &&
          (c.client.workspace.id === monitorFocusedWs ||
            c.client.workspace.name.match(new RegExp(`special:m${monitorFocusedWs}`))) &&
          !(c.client.xwayland && c.client.title === "") && // if it is xwayland and has no title it is probably a tooltip or smth
          c.client.mapped;
        c.toggleClassName("minimized", c.client.workspace.id <= 0);
      };

      const filterChildren = () => {
        for (const c of self.children) {
          updateChild(c);
        }
      };

      const clients = Hyprland.get_clients();
      for (let i = clients.length - 1; i >= 0; i--) {
        const client = clients[i];
        if (client.mapped && client.monitor !== -1) self.add(TaskButton(client, monitorID));
      }

      self
        .hook(Hyprland, "client-removed", (self, address) => {
          if (address) {
            self.children.find((c) => c.attribute.address === address)?.destroy();
          }
        })
        .hook(Hyprland, "client-added", (self, client) => {
          if (client) {
            const button = TaskButton(client, monitorID);
            updateChild(button);
            self.add(button);
            self.reorder_child(button, 0);
          }
        })
        .hook(Hyprland, "notify::focused-workspace", () => {
          if (Hyprland.focusedWorkspace.monitor.id === monitorID) {
            monitorFocusedWs = Hyprland.focusedWorkspace.id;
            filterChildren();
          }
        })
        .hook(Hyprland, "client-moved", (self, client) => {
          updateChild(self.children.find((c) => c.client.address === client.address));
        });

      filterChildren();
    },
  });
};
