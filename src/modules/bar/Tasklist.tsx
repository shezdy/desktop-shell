import { focusClientOrMinimize, fullscreenToggle, getClientIcon, getHyprlandMonitor } from "../../utils/hyprland";
import Pango from "gi://Pango?version=1.0";
import { createBinding, For, onCleanup } from "gnim";
import { toggleClassName } from "../../utils/utils";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Gdk, Gtk } from "ags/gtk4";

const hyprland = AstalHyprland.get_default();

const TaskButtonSetVisible = (self: Gtk.Box, client: AstalHyprland.Client, monitorId: number) => {
  if (!client.workspace || !client.monitor) {
    self.visible = false;
    return;
  }

  toggleClassName(self, "minimized", client.workspace?.id <= 0);
  if (client.get_monitor()?.id !== monitorId) {
    self.visible = false;
    return;
  }
  if (
    client.workspace.id !== hyprland.get_monitor(monitorId)?.activeWorkspace.id &&
    !client.workspace.name.match(
      new RegExp(`special:m${hyprland.get_monitor(monitorId)?.activeWorkspace.id}`),
    )
  ) {
    self.visible = false;
    return;
  }
  if (client.xwayland && client.title === "") {
    self.visible = false;
    return;
  }
  if (!client.mapped) {
    self.visible = false;
    return;
  }
  self.visible = true;
};

const TaskButton = (client: AstalHyprland.Client, monitorId: number) => {
  return (
    <box
      hexpand={true}
      $={(self) => {
        // client.connect("removed", () => {
        //   self.unparent();
        // });
        TaskButtonSetVisible(self, client, monitorId);
        toggleClassName(self, "active", hyprland.focusedClient?.address === client?.address);

        const focusedWorkspaceHandler = hyprland.connect("notify::focused-workspace", () => {
          TaskButtonSetVisible(self, client, monitorId);
        });

        const clientMovedHandler = hyprland.connect("client-moved", () => {
          TaskButtonSetVisible(self, client, monitorId);
        });

        const focusedClientHandler = hyprland.connect("notify::focused-client", () => {
          toggleClassName(self, "active", hyprland.focusedClient?.address === client?.address);
        });

        onCleanup(() => {
          hyprland.disconnect(focusedWorkspaceHandler);
          hyprland.disconnect(clientMovedHandler);
          hyprland.disconnect(focusedClientHandler);
        });
      }}
    >
      <Gtk.GestureClick
        button={Gdk.BUTTON_PRIMARY}
        onPressed={() => {
          focusClientOrMinimize(client);
        }}
      />
      <Gtk.GestureClick
        button={Gdk.BUTTON_MIDDLE}
        onPressed={() => {
          hyprland.message(`dispatch closewindow address:0x${client.address}`);
        }}
      />
      <Gtk.GestureClick
        button={Gdk.BUTTON_SECONDARY}
        onPressed={() => {
          fullscreenToggle(client, 1, false);
        }}
      />
      <image class={"icon"} iconName={getClientIcon(client)} pixelSize={14}></image>
      <label
        class={"title"}
        ellipsize={Pango.EllipsizeMode.END}
        $={(self) => {
          const update = () => {
            let str = client.title;
            if (client.floating) str = `󰁞 ${str}`;
            if (client.fullscreen) str = `󱇬 ${str}`;
            self.label = str;
          };

          const notifyTitleHandle = client.connect("notify::title", update);
          const notifyFloatingHandle = client.connect("notify::floating", update);
          const notifyFullscreenHandle = client.connect("notify::fullscreen", update);
          update();

          onCleanup(() => {
            client.disconnect(notifyTitleHandle);
            client.disconnect(notifyFloatingHandle);
            client.disconnect(notifyFullscreenHandle);
          });
        }}
      ></label>
    </box>
  );
};

export default ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const monitorId = getHyprlandMonitor(gdkmonitor)?.id;
  if (monitorId === undefined) return <box></box>;

  const clientsBinding = createBinding(hyprland, "clients").as((clients) =>
    clients.sort((a, b) => b.pid - a.pid),
  );

  return (
    <box class={"tasklist"} hexpand={true} homogeneous={true}>
      <For each={clientsBinding}>{(client) => TaskButton(client, monitorId)}</For>
    </box>
  );
};
