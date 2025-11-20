import Apps from "gi://AstalApps";
import Hyprland from "gi://AstalHyprland";
// import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import Mpris from "gi://AstalMpris";
import Network from "gi://AstalNetwork";
import Notifd from "gi://AstalNotifd";
import PowerProfiles from "gi://AstalPowerProfiles";
import Tray from "gi://AstalTray";
import Wp from "gi://AstalWp";
import GLib from "gi://GLib";
import Gdk from "gi://Gdk?version=3.0";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";
import { Widget as W } from "astal/gtk3";
import {
  Calendar,
  FlowBox,
  FlowBoxChild,
  Menu,
  MenuItem,
  PopoverMenu,
  Separator,
} from "./widgets/Subclassed";

const apps = new Apps.Apps({
  nameMultiplier: 2,
  entryMultiplier: 1,
  executableMultiplier: 0.5,
});
const hyprland = Hyprland.get_default();
const mpris = Mpris.get_default();
const network = Network.get_default();
const notifd = Notifd.get_default();
const systemtray = Tray.get_default();
const audio = Wp.get_default().audio;
const powerprofiles = PowerProfiles.get_default();

// wrapper to avoid having to use 'new' for every widget
const Widget = {};
for (const [name, cls] of Object.entries(W)) {
  Widget[name] = (props) => new cls(props);
}
Widget.Calendar = (props) => new Calendar(props);
Widget.FlowBox = (props) => new FlowBox(props);
Widget.FlowBoxChild = (props) => new FlowBoxChild(props);
Widget.Menu = (props) => new Menu(props);
Widget.MenuItem = (props) => new MenuItem(props);
Widget.PopoverMenu = (props) => new PopoverMenu(props);
Widget.Separator = (props) => new Separator(props);

export {
  GLib,
  Gdk,
  Gio,
  Gtk,
  apps as Applications,
  audio as Audio,
  // Battery,
  hyprland as Hyprland,
  mpris as Mpris,
  network as Network,
  notifd as Notifications,
  // PowerProfiles,
  systemtray as SystemTray,
  powerprofiles as PowerProfiles,
  Widget,
};
