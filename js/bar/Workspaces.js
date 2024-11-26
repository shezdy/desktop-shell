import { Hyprland, Widget } from "../imports.js";

const numWorkspaces = 6;

export default (monitor) => {
  const min = monitor * numWorkspaces + 1;
  const max = monitor * numWorkspaces + numWorkspaces;

  const ExtraWorkspaceButton = (id) =>
    Widget.Button({
      className: "extra-button",
      onClick: (self, event) => {
        switch (event.button) {
          case 1:
            Hyprland.message_async(`dispatch focusworkspaceoncurrentmonitor ${id}`, null);
            break;
          case 3:
            Hyprland.message_async(`dispatch movetoworkspacesilent ${id}`, null);
            break;
        }
      },
      child: Widget.Label({
        label: `${id}`,
      }),
      attribute: { id },
      setup: (self) => {
        self.toggleClassName("active", Hyprland.get_monitor(monitor)?.activeWorkspace.id === id);

        self.hook(Hyprland, "notify::focused-workspace", () => {
          if (Hyprland.focusedWorkspace.monitor.id === monitor) {
            self.toggleClassName("active", Hyprland.focusedWorkspace.id === id);
            // print(`${Hyprland.focusedWorkspace.id === id} active`);
          }
        });
      },
    });

  const extraWorkspaces = Widget.Box({
    setup: (self) => {
      const addExtraWorkspaceButton = (id) => {
        let low = 0;
        let high = self.children.length;

        while (low < high) {
          const mid = (low + high) >>> 1;
          if (self.children[mid].attribute.id < id) low = mid + 1;
          else high = mid;
        }

        const newButton = ExtraWorkspaceButton(id);
        self.add(newButton);
        self.reorder_child(newButton, low);
        newButton.show_all();
      };

      for (const ws of Hyprland.get_workspaces()) {
        if (ws.monitor.id !== monitor) continue;

        const id = ws.id;

        if ((id < min && id > 0) || id > max) {
          addExtraWorkspaceButton(id);
        }
      }

      self
        .hook(Hyprland, "event", (_, e, data) => {
          if (e === "moveworkspacev2") {
            const values = data.split(",");
            const id = parseInt(values[0]);
            if (
              ((id < min && id > 0) || id > max) &&
              Hyprland.get_workspace(id)?.monitor?.id === monitor
            ) {
              if (!self.children.find((c) => c.attribute.id === id)) {
                addExtraWorkspaceButton(id);
              }
            } else {
              self.children.find((c) => c.attribute.id === id)?.destroy();
            }
          }
        })
        .hook(Hyprland, "notify::focused-workspace", () => {
          const id = Hyprland.focusedWorkspace.id;
          if (
            ((id < min && id > 0) || id > max) &&
            Hyprland.get_workspace(id)?.monitor?.id === monitor
          ) {
            if (!self.children.find((c) => c.attribute.id === id)) {
              addExtraWorkspaceButton(id);
            }
          } else {
            self.children.find((c) => c.attribute.id === id)?.destroy();
          }
        })
        .hook(Hyprland, "workspace-added", (_, ws) => {
          if (ws && ws?.monitor?.id === monitor && ((ws.id < min && ws.id > 0) || ws.id > max)) {
            addExtraWorkspaceButton(ws.id);
          }
        })
        .hook(Hyprland, "workspace-removed", (_, id) => {
          self.children.find((c) => c.attribute.id === parseInt(id))?.destroy();
        });
    },
  });

  return Widget.Box({
    className: "workspaces",
    children: [
      Widget.EventBox({
        className: "eventbox",
        child: Widget.Box({
          children: [
            Widget.Box({
              homogeneous: true,
              className: "ws-box",
              hexpand: false,
              children: Array.from({ length: numWorkspaces }, (_, i) => i + min).map((i) =>
                Widget.Button({
                  className: "ws-button",
                  hexpand: false,
                  onClick: (self, event) => {
                    switch (event.button) {
                      case 1:
                        Hyprland.message(`dispatch focusworkspaceoncurrentmonitor ${i}`);
                        break;
                      case 3:
                        Hyprland.message(`dispatch movetoworkspacesilent ${i}`);
                        break;
                    }
                  },
                  child: Widget.Box({
                    hexpand: false,
                    className: "box",
                    // hpack: "center",
                  }),
                }),
              ),
              setup: (self) => {
                const update = (activeID) => {
                  for (const [i, btn] of self.children.entries()) {
                    const id = i + min;
                    if (activeID === id) {
                      btn.toggleClassName("active", true);
                      btn.toggleClassName("urgent", false);
                      continue;
                    }
                    btn.toggleClassName("active", false);
                    let occupied = Hyprland.get_workspace(id)?.get_clients().length > 0;
                    if (!occupied) {
                      // check for clients in the "minimized" workspace
                      const idString = id.toString();
                      for (const ws of Hyprland.get_workspaces()) {
                        if (!ws || ws.id > 0) continue;
                        if (
                          ws.name?.match(/\d+$/)?.[0] === idString &&
                          ws.get_clients().length > 0
                        ) {
                          occupied = true;
                          break;
                        }
                      }
                    }
                    btn.toggleClassName("occupied", occupied);
                  }
                };
                self
                  .hook(Hyprland, "notify::focused-workspace", () => {
                    if (
                      Hyprland.focusedWorkspace &&
                      (Hyprland.focusedWorkspace.monitor.id === monitor ||
                        (Hyprland.focusedWorkspace.id >= min &&
                          Hyprland.focusedWorkspace.id <= max))
                    )
                      update(Hyprland.focusedWorkspace.id);
                  })
                  .hook(Hyprland, "client-moved", (_, client, ws) => {
                    if (
                      Hyprland.focusedWorkspace &&
                      ws &&
                      (ws.monitor.id === monitor || (ws.id >= min && ws.id <= max))
                    )
                      update(Hyprland.focusedWorkspace.id);
                  })
                  .hook(Hyprland, "urgent", (_, address) => {
                    if (!address) return;
                    const wsId = Hyprland.get_client(`${address}`)?.workspace?.id;
                    if (!wsId || wsId === Hyprland.focusedWorkspace.id || wsId < min || wsId > max)
                      return;

                    self.children[(wsId - 1) % numWorkspaces]?.toggleClassName("urgent", true);
                  });

                update(Hyprland.get_monitor(monitor)?.activeWorkspace.id);
              },
            }),
            extraWorkspaces,
          ],
        }),
      }),
    ],
  });
};
