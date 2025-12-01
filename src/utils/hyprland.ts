import { Gdk } from "ags/gtk4";
import icons from "../icons";
import { lookupIcon } from "./utils";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Apps from "../services/Apps";

const hyprland = AstalHyprland.get_default();

type IconSubs = {
  [appTitle: string]: string;
};
const iconSubs: IconSubs = {
  "Spotify Premium": "com.spotify.Client",
  Joplin: "@joplinapp-desktop",
  "FINAL FANTASY XIV": "xivlauncher",
};

export function getHyprlandMonitor(gdkmonitor: Gdk.Monitor) {
  for (const m of hyprland.monitors) {
    if (m.name === gdkmonitor.connector) return m;
  }
  return null;
}

export function getClientIcon(client: AstalHyprland.Client | null) {
  if (!client) return icons.apps.fallback;
  let icon = "";

  if ((!icon || icon === "") && client.initialClass !== "")
    icon = Apps.exact_query(client.initialClass)[0]?.iconName;
  if ((!icon || icon === "") && client.initialTitle !== "")
    icon = Apps.exact_query(client.initialTitle)[0]?.iconName;

  icon = iconSubs[client.initialTitle] || icon;
  if (!icon) return icons.apps.fallback;
  return lookupIcon(icon) ? icon : icons.apps.fallback;
}

export function minimizeFocused() {
  if (hyprland.focusedWorkspace?.id)
    hyprland.message(`dispatch movetoworkspacesilent special:m${hyprland.focusedWorkspace.id}`);
}

export function restoreClient() {
  const client = hyprland
    .get_clients()
    .find((c) => c.workspace.name === `special:m${hyprland.focusedWorkspace.id}`);
  if (client)
    hyprland.message(
      `dispatch movetoworkspacesilent ${hyprland.focusedWorkspace.id},address:0x${client.address}`,
    );
}

export function focusClient(client: AstalHyprland.Client, cursorWarp = false) {
  if (!client) return;
  let cmd = "[[BATCH]]";
  if (!cursorWarp) cmd += "keyword cursor:no_warps 1;";

  if (client.address.startsWith("0x")) client.address = client.address.substring(2);

  if (client.workspace.id < 1) {
    const matchResult = client.workspace.name.match(/\d+$/)?.[0];
    if (matchResult) {
      const normalWS = parseInt(matchResult);
      cmd += `dispatch movetoworkspace ${normalWS},address:0x${client.address};`;
    }
  } else {
    cmd += `dispatch focuswindow address:0x${client.address};`;
  }

  if (!cursorWarp) cmd += "keyword cursor:no_warps 0";
  hyprland.message(cmd);
}

export function focusClientOrMinimize(client: AstalHyprland.Client, cursorWarp = false) {
  if (!client) return;
  let cmd = "[[BATCH]]";
  if (!cursorWarp) cmd += "keyword cursor:no_warps 1;";

  if (client.workspace.id > 0) {
    if (client.address === hyprland.focusedClient?.address)
      cmd += `dispatch movetoworkspacesilent special:m${client.workspace.id},address:0x${client.address};`;
    else cmd += `dispatch focuswindow address:0x${client.address};`;
  } else {
    const matchResult = client.workspace.name.match(/\d+$/)?.[0]; // get workspace number at the end of the special workspace name
    if (matchResult) {
      cmd += `dispatch movetoworkspacesilent ${matchResult},address:0x${client.address};`;
    }
  }

  if (!cursorWarp) cmd += "keyword cursor:no_warps 0";
  hyprland.message(cmd);
}

export function fullscreenToggle(client: AstalHyprland.Client, mode: number, cursorWarp = false) {
  if (!client) return;
  let cmd = "[[BATCH]]";
  if (!cursorWarp) cmd += "keyword cursor:no_warps 1;";

  cmd += `dispatch focuswindow address:0x${client.address}; dispatch fullscreen ${mode};`;

  if (!cursorWarp) cmd += "keyword cursor:no_warps 0";
  hyprland.message(cmd);
}
