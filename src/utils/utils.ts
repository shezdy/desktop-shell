import { Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import GLib from "gi://GLib?version=2.0";

export function toggleClassName(widget: Gtk.Widget | null, cssClass: string, state: boolean) {
  if (!widget) return;
  if (state) widget.add_css_class(cssClass);
  else widget.remove_css_class(cssClass);
}

let iconThemeCache: Gtk.IconTheme | null = null;
function getIconTheme(): Gtk.IconTheme {
  if (!iconThemeCache) {
    iconThemeCache = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
  }
  return iconThemeCache;
}

export function lookupIcon(icon?: string | null) {
  return !!icon && getIconTheme().has_icon(icon);
}

export function toggleWindow(name: string): void {
  const win = app.get_window(name);
  if (!win) {
    console.warn(`Window "${name}" not found`);
    return;
  }

  if (win.visible) {
    win.hide();
  } else {
    win.show();
  }
}

export function openWindow(name: string): void {
  const win = app.get_window(name);
  if (!win) {
    console.warn(`Window "${name}" not found`);
    return;
  }

  win.show();
}

export function closeWindow(name: string): void {
  const win = app.get_window(name);
  if (!win) {
    console.warn(`Window "${name}" not found`);
    return;
  }

  win.hide();
}

function parseArgv(cmdline: string): string[] {
  try {
    // Quote/escape aware (handles spaces, quotes, etc.)
    const [ok, argv] = GLib.shell_parse_argv(cmdline) as unknown as [boolean, string[]];
    if (ok && argv.length) return argv;
  } catch (_) {
    /* fall through */
  }
  // Fallback: naive split
  return cmdline.trim().split(/\s+/).filter(Boolean);
}

export function launchApp(cmdline: string) {
  if (cmdline.length === 0) return;

  if (CURRENT_DESKTOP === "hyprland" && GLib.find_program_in_path("hyprctl")) {
    console.log("launching app with hyprctl");
    GLib.spawn_async(
      null,
      ["hyprctl", "dispatch", "exec", cmdline],
      null,
      GLib.SpawnFlags.SEARCH_PATH,
      null,
    );
  } else {
    const argv = parseArgv(cmdline);
    if (argv.length === 0) return;
    console.log("launching app detached");
    const base = GLib.find_program_in_path("setsid")
      ? ["setsid", "sh", "-c", 'exec "$@" >/dev/null 2>&1 &', "_"]
      : ["sh", "-c", 'exec "$@" >/dev/null 2>&1 &', "_"];

    GLib.spawn_async(null, [...base, ...argv], null, GLib.SpawnFlags.SEARCH_PATH, null);
  }
}
