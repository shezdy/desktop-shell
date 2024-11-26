import { exec, execAsync } from "astal";
import { Astal } from "astal/gtk3";
import icons from "../icons.js";
import { Applications, Hyprland } from "../imports.js";

const iconSubs = {
  "Spotify Premium": "com.spotify.Client",
  Joplin: "@joplinapp-desktop",
};

export function execSh(cmd) {
  if (!cmd || cmd === "") return;
  execAsync(["sh", "-c", `${cmd}`]).catch((error) => console.error(`execSh error: ${error}`));
}

export function execBash(cmd) {
  if (!cmd || cmd === "") return;
  execAsync(["bash", "-c", `${cmd}`]).catch((error) => console.error(`execBash error: ${error}`));
}

export function launchApp(app) {
  if (!app) return;
  Hyprland.message(`dispatch exec gio launch ${app.app.filename}`);
  app.frequency++;
}

/**
 * @param {object} client hyprland client
 * @returns client icon or fallback icon
 */
export function getHyprlandClientIcon(client) {
  if (!client) return icons.apps.fallback;
  let icon = "";

  if ((!icon || icon === "") && client.initialClass !== "")
    icon = Applications.exact_query(client.initialClass)[0]?.iconName;
  if ((!icon || icon === "") && client.initialTitle !== "")
    icon = Applications.exact_query(client.initialTitle)[0]?.iconName;

  icon = iconSubs[client.initialTitle] || icon;
  return Astal.Icon.lookup_icon(icon) ? icon : icons.apps.fallback;
}

export function minimizeFocused() {
  if (Hyprland.focusedWorkspace?.id)
    Hyprland.message(`dispatch movetoworkspacesilent special:m${Hyprland.focusedWorkspace.id}`);
}

export function restoreClient() {
  const client = Hyprland.get_clients().find(
    (c) => c.workspace.name === `special:m${Hyprland.focusedWorkspace.id}`,
  );
  if (client)
    Hyprland.message(
      `dispatch movetoworkspacesilent ${Hyprland.focusedWorkspace.id},address:0x${client.address}`,
    );
}

/**
 * @param {object} client  hyprland client
 * @param {boolean} cursorWarp
 */
export function focusClient(client, cursorWarp = false) {
  if (!client) return;
  let cmd = "[[BATCH]]";
  if (!cursorWarp) cmd += "keyword cursor:no_warps 1;";

  if (client.address.startsWith("0x")) client.address = client.address.substring(2);

  if (client.workspace.id < 1) {
    const normalWS = parseInt(client.workspace.name.match(/\d+$/)[0]);
    cmd += `dispatch movetoworkspace ${normalWS},address:0x${client.address};`;
  } else {
    cmd += `dispatch focuswindow address:0x${client.address};`;
  }

  if (!cursorWarp) cmd += "keyword cursor:no_warps 0";
  Hyprland.message(cmd);
}

/**
 * @param {object} client
 * @param {boolean} cursorWarp
 */
export function focusClientOrMinimize(client, cursorWarp = false) {
  if (!client) return;
  let cmd = "[[BATCH]]";
  if (!cursorWarp) cmd += "keyword cursor:no_warps 1;";

  if (client.workspace.id > 0) {
    if (client.address === Hyprland.focusedClient?.address)
      cmd += `dispatch movetoworkspacesilent special:m${client.workspace.id},address:0x${client.address};`;
    else cmd += `dispatch focuswindow address:0x${client.address};`;
  } else {
    cmd += `dispatch movetoworkspacesilent ${
      client.workspace.name.match(/\d+$/)[0] // get workspace number at the end of the special workspace name
    },address:0x${client.address};`;
  }

  if (!cursorWarp) cmd += "keyword cursor:no_warps 0";
  Hyprland.message(cmd);
}

/**
 * @param {object} client Hyprland client
 * @param {number} mode 1 for maximise, 0 for fullscreen
 * @param {boolean} cursorWarp
 */
export function fullscreenToggle(client, mode, cursorWarp = false) {
  if (!client) return;
  let cmd = "[[BATCH]]";
  if (!cursorWarp) cmd += "keyword cursor:no_warps 1;";

  cmd += `dispatch focuswindow address:0x${client.address}; dispatch fullscreen ${mode};`;

  if (!cursorWarp) cmd += "keyword cursor:no_warps 0";
  Hyprland.message(cmd);
}
