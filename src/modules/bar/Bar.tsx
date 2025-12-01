import app from "ags/gtk4/app";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import Clock from "./Clock";
import Media from "./Media";
import Network from "./Network";
import SysTray from "./SysTray";
import Tasklist from "./Tasklist";
import Volume from "./Volume";
import Workspaces from "./Workspaces";
import { onCleanup } from "gnim";
import { openWindow } from "../../utils/utils";
import AstalHyprland from "gi://AstalHyprland?version=0.1";
import Battery from "./Battery";

const LauncherButton = () => {
  return (
    <button
      onClicked={() => {
        openWindow("launcher");
      }}
      class={"launcher-button"}
    ></button>
  );
};

const SysIndicators = () => {
  return (
    <box
      class={"system-indicators"}
      $={(self) => {
        const windowToggledHandler = app.connect("window-toggled", (app, win) => {
          if (win.name === "dashboard") {
            const cssClass = "active";
            if (win.visible) self.add_css_class(cssClass);
            else self.remove_css_class(cssClass);
          }
        });

        onCleanup(() => {
          app.disconnect(windowToggledHandler);
        });
      }}
    >
      <Volume></Volume>
      <Battery></Battery>
      <Network></Network>
      <Clock></Clock>
    </box>
  );
};

const ConfigErrorIndicator = () => {
  if (CURRENT_DESKTOP !== "hyprland") return <box></box>;
  const hyprland = AstalHyprland.get_default();

  return (
    <button
      class={"error-indicator"}
      visible={false}
      onClicked={() => {
        hyprland.message("dispatch exec [float;size 800 500] kitty -e hyprpm update");
      }}
      $={(self) => {
        const update = () => {
          const errors = JSON.parse(hyprland.message("j/configerrors"));
          if (errors[0] !== "") {
            self.visible = true;
            self.tooltipText = errors.join("\n");
          } else {
            self.visible = false;
          }
        };

        const configReloadedHandle = hyprland.connect("config-reloaded", update);
        onCleanup(() => {
          hyprland.disconnect(configReloadedHandle);
        });
        update();
      }}
    >
      <box>
        <image iconName={"dialog-warning-symbolic"} pixelSize={13}></image>
      </box>
    </button>
  );
};

const Left = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => (
  <box class={"left"}>
    <LauncherButton></LauncherButton>
    <Workspaces gdkmonitor={gdkmonitor}></Workspaces>
    <ConfigErrorIndicator></ConfigErrorIndicator>
  </box>
);

const Center = ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => (
  <box class={"center"}>
    <Tasklist gdkmonitor={gdkmonitor}></Tasklist>
  </box>
);

const Right = () => (
  <box class={"right"} halign={Gtk.Align.END}>
    <SysTray></SysTray>
    <Media></Media>
    <SysIndicators></SysIndicators>
  </box>
);

export default ({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) => {
  let win: Astal.Window;
  onCleanup(() => {
    win.destroy();
  });

  return (
    <window
      namespace={`bar-${gdkmonitor.connector}`}
      name={`bar-${gdkmonitor.connector}`}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
      application={app}
      visible={true}
      gdkmonitor={gdkmonitor}
      $={(self) => {
        win = self;
      }}
    >
      <box class={"bar"} homogeneous={false}>
        <Left gdkmonitor={gdkmonitor}></Left>
        <Center gdkmonitor={gdkmonitor}></Center>
        <Right></Right>
      </box>
    </window>
  );
};
