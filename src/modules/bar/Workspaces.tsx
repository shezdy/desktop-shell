import { createBinding, For, onCleanup } from "gnim";
import { toggleClassName } from "../../utils/utils";
import { getHyprlandMonitor } from "../../utils/hyprland";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import { Gdk, Gtk } from "ags/gtk4";

const numWorkspaces = 6;
const hyprland = AstalHyprland.get_default();

type ExtraWorkspaceButton = Gtk.Box & {
  workspaceId: number;
};

const ExtraWorkspaceButton = (id: number, monitorId: number) => {
  const box = new Gtk.Box();
  box.add_css_class("extra-button");

  const notifyFocusedWorkspaceHandle = hyprland.connect("notify::focused-workspace", () => {
    if (hyprland.focusedWorkspace.monitor.id === monitorId) {
      toggleClassName(box, "active", hyprland.focusedWorkspace.id === id);
    }
  });

  const primaryClick = new Gtk.GestureClick({ button: Gdk.BUTTON_PRIMARY });
  const primaryClickPressedHandle = primaryClick.connect("pressed", () => {
    hyprland.message_async(`dispatch focusworkspaceoncurrentmonitor ${id}`, null);
  });
  box.add_controller(primaryClick);

  const secondaryClick = new Gtk.GestureClick({ button: Gdk.BUTTON_SECONDARY });
  const secondaryClickPressedHandle = secondaryClick.connect("pressed", () => {
    hyprland.message_async(`dispatch movetoworkspacesilent ${id}`, null);
  });
  box.add_controller(secondaryClick);

  onCleanup(() => {
    hyprland.disconnect(notifyFocusedWorkspaceHandle);
    primaryClick.disconnect(primaryClickPressedHandle);
    secondaryClick.disconnect(secondaryClickPressedHandle);
  });

  box.append(new Gtk.Label({ label: `${id}` }));

  Object.assign(box, { workspaceId: id });

  hyprland.connect("notify::focused-workspace", () => {
    if (hyprland.focusedWorkspace.id === id) {
      box.add_css_class("active");
      box.remove_css_class("urgent");
    } else {
      box.remove_css_class("active");
    }
  });
  toggleClassName(box, "active", hyprland.focusedWorkspace.id === id);

  return box as ExtraWorkspaceButton;
};

const ExtraWorkspacesBox = ({
  monitorId: monitor,
  min,
  max,
}: {
  monitorId: number;
  min: number;
  max: number;
}) => {
  const workspaces = createBinding(hyprland, "workspaces").as((workspaces) =>
    workspaces
      .filter((ws) => {
        if (ws.monitor?.id === monitor) {
          if (ws.id < 1) {
            return false;
          } else if (ws.id < min || ws.id > max) {
            return true;
          }
        }
        return false
      })
      .sort((a, b) => a.id - b.id),
  );

  return (
    <box>
      <For each={workspaces}>{(ws) => ExtraWorkspaceButton(ws.id, monitor)}</For>
    </box>
  );
};

export default ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  const monitorId = getHyprlandMonitor(gdkmonitor)?.id;
  if (monitorId === undefined) return <box></box>;

  const min = monitorId * numWorkspaces + 1;
  const max = monitorId * numWorkspaces + numWorkspaces;

  return (
    <box class={"workspaces"}>
      <box class={"ws-box"} homogeneous={true}>
        {Array.from({ length: numWorkspaces }, (_, i) => i + min).map((id) => {
          return (
            <box
              class={"ws-button"}
              halign={Gtk.Align.CENTER}
              $={(self) => {
                const setOccupied = () => {
                  let occupied = hyprland.get_workspace(id)?.get_clients().length > 0;
                  if (!occupied) {
                    // check for clients in the "minimized" workspace
                    // i only use special workspaces for minimized windows
                    const idString = id.toString();
                    for (const ws of hyprland.get_workspaces()) {
                      if (!ws || ws.id > 0) continue;
                      if (ws.name?.match(/\d+$/)?.[0] === idString && ws.get_clients().length > 0) {
                        occupied = true;
                        break;
                      }
                    }
                  }
                  toggleClassName(self, "occupied", occupied);
                };

                if (hyprland.get_monitor(monitorId)?.activeWorkspace.id === id)
                  self.add_css_class("active");
                setOccupied();

                const notifyFocusedWorkspaceHandle = hyprland.connect(
                  "notify::focused-workspace",
                  () => {
                    if (
                      !hyprland.focusedWorkspace ||
                      hyprland.focusedWorkspace.monitor.id !== monitorId ||
                      hyprland.focusedWorkspace.id < min ||
                      hyprland.focusedWorkspace.id > max
                    )
                      return;
                    if (hyprland.focusedWorkspace.id === id) {
                      self.add_css_class("active");
                      self.remove_css_class("urgent");
                    } else {
                      self.remove_css_class("active");
                      setOccupied();
                    }
                  },
                );

                const clientMovedHandle = hyprland.connect("client-moved", (_, client, ws) => {
                  if (
                    !hyprland.focusedWorkspace ||
                    !ws ||
                    ws.monitor.id !== monitorId ||
                    ws.id < min ||
                    ws.id > max
                  )
                    return;
                  setOccupied();
                });

                const urgentHandle = hyprland.connect("urgent", (_, address) => {
                  if (!address) return;
                  const wsId = hyprland.get_client(`${address}`)?.workspace?.id;
                  if (!wsId || wsId !== id) return;
                  self.add_css_class("urgent");
                });

                onCleanup(() => {
                  hyprland.disconnect(notifyFocusedWorkspaceHandle);
                  hyprland.disconnect(clientMovedHandle);
                  hyprland.disconnect(urgentHandle);
                });
              }}
            >
              <Gtk.GestureClick
                button={Gdk.BUTTON_PRIMARY}
                onPressed={() => {
                  hyprland.message_async(`dispatch focusworkspaceoncurrentmonitor ${id}`, null);
                }}
              />
              <Gtk.GestureClick
                button={Gdk.BUTTON_SECONDARY}
                onPressed={() => {
                  hyprland.message_async(`dispatch movetoworkspacesilent ${id}`, null);
                }}
              />
              <box class={"box"} halign={Gtk.Align.CENTER}></box>
            </box>
          );
        })}
      </box>
      <ExtraWorkspacesBox monitorId={monitorId} min={min} max={max}></ExtraWorkspacesBox>
    </box>
  );
};
