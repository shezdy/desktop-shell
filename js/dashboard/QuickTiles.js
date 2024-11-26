import { Variable, bind } from "astal";
import { App, Astal } from "astal/gtk3";
import icons from "../icons.js";
import { Gtk, Hyprland, PowerProfiles, Widget } from "../imports.js";
import options from "../options.js";
import Brightness from "../services/Brightness.js";
import NightLight from "../services/NightLight.js";
import FontIcon from "../widgets/FontIcon.js";

const BrightnessPreset = (brightness, text) =>
  Widget.Button({
    className: "brightness-preset",
    hexpand: true,
    onClicked: () => {
      Brightness.screens = brightness;
    },
    child: FontIcon({ icon: text }),
  });

const ExecQuickTile = ({ exec, icon, labelText }) => {
  return Widget.Button({
    hexpand: true,
    onClicked: () => {
      App.get_window("dashboard").visible = false;
      Hyprland.message(`dispatch exec ${exec}`);
    },
    child: Widget.CenterBox({
      vpack: "center",
      startWidget: Widget.Box({
        vpack: "center",
        children: [icon, Widget.Label({ label: labelText })],
      }),
      endWidget: Widget.Box({
        vpack: "center",
        hpack: "end",
        children: [
          Widget.Icon({
            icon: icons.ui.go.next,
            className: "open-icon",
          }),
        ],
      }),
    }),
  });
};

const PowerProfileTile = () =>
  Widget.Button({
    hexpand: true,
    onClicked: () => {
      const profiles = PowerProfiles.get_profiles();
      const i = profiles.findIndex((p) => p?.profile === PowerProfiles?.activeProfile);
      if (i !== -1) PowerProfiles.activeProfile = profiles[(i + 1) % profiles.length].profile;
    },
    child: Widget.Box({
      vpack: "center",
      children: [
        Widget.Icon({ icon: icons.powermode.profile.Balanced }),
        Widget.Label({
          label: bind(PowerProfiles, "active-profile").as((p) => p[0].toUpperCase() + p.slice(1)),
        }),
      ],
    }),
  });

const NightLightTile = () => {
  if (!NightLight) return null;
  return Widget.Button({
    attribute: {
      enabled: false,
    },
    hexpand: true,
    onClicked: () => {
      NightLight.toggle();
    },
    child: Widget.Box({
      valign: Gtk.Align.CENTER,
      children: [
        Widget.Icon({ icon: "weather-clear-night-symbolic" }),
        Widget.Box({
          className: "text-box",
          vertical: true,
          children: [
            Widget.Label({
              label: "Night Light",
            }),
            Widget.Label({
              label: bind(NightLight, "text"),
              className: "subtext",
            }),
          ],
        }),
      ],
    }),
  });
};

export default () =>
  Widget.Box({
    className: "quick-tiles horizontal",
    children: [
      Widget.Box({
        vertical: true,
        children: [
          Widget.Box({
            vertical: false,
            homogeneous: true,
            children: [
              ExecQuickTile({
                exec: "nm-connection-editor",
                icon: Widget.Icon({ icon: icons.network.wired.connected }),
                labelText: "Connections",
              }),
              ExecQuickTile({
                exec: "opensnitch-ui",
                icon: FontIcon({ icon: "", className: "opensnitch" }),
                labelText: "Firewall",
              }),
            ],
          }),
          Widget.Box({
            vertical: false,
            homogeneous: true,
            children: [NightLightTile(), PowerProfileTile()],
          }),
          Widget.Box({
            vertical: false,
            homogeneous: true,
            children: [
              BrightnessPreset(0.0, icons.brightness.low),
              BrightnessPreset(0.3, icons.brightness.medium),
              BrightnessPreset(0.8, icons.brightness.high),
            ],
          }),
        ],
      }),
    ],
  });
