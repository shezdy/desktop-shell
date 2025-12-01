import { Gtk } from "ags/gtk4";
import { closeWindow, launchApp } from "../../utils/utils";
import icons from "../../icons";
import { createBinding } from "gnim";
import NightLight from "../../services/NightLight";
import Brightness from "../../services/Brightness";
import AstalPowerProfiles from "gi://AstalPowerProfiles?version=0.1";

type ExecQuickTileProps = JSX.IntrinsicElements["button"] & {
  exec: string;
  icon: Gtk.Widget;
  labelText: string;
};

type BrightnessPresetProps = JSX.IntrinsicElements["button"] & {
  brightness: number;
  iconName: string;
};

export default () => {
  const powerProfiles = AstalPowerProfiles.get_default();

  const ExecQuickTile = ({ exec, icon, labelText, ...props }: ExecQuickTileProps) => {
    return (
      <button
        {...props}
        hexpand
        onClicked={() => {
          closeWindow("dashboard");
          launchApp(exec);
        }}
      >
        <box>
          <box hexpand>
            {icon}
            <label label={labelText}></label>
          </box>
          <box>
            <image iconName={icons.ui.arrow.right} pixelSize={12}></image>
          </box>
        </box>
      </button>
    );
  };

  const NightLightTile = () => {
    if (!NightLight) return <box></box>;

    return (
      <button
        hexpand
        onClicked={() => {
          NightLight?.toggle();
        }}
      >
        <box>
          <image iconName={"weather-clear-night-symbolic"}></image>
          <box orientation={Gtk.Orientation.VERTICAL} class={"text-box"} valign={Gtk.Align.CENTER}>
            {"Night Light"}
            <label label={createBinding(NightLight, "text")} class={"subtext"}></label>
          </box>
        </box>
      </button>
    );
  };

  const BrightnessPreset = ({ brightness, iconName }: BrightnessPresetProps) => {
    return (
      <button
        class={"brightness-preset"}
        hexpand
        onClicked={() => {
          Brightness.screens = brightness;
        }}
      >
        <image iconName={iconName} pixelSize={20}></image>
      </button>
    );
  };

  return (
    <box cssClasses={["quick-tiles", "horiontal"]} hexpand>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box homogeneous>
          <ExecQuickTile
            exec="nm-connection-editor"
            icon={new Gtk.Image({ iconName: icons.network.transmit })}
            labelText="Connections"
          ></ExecQuickTile>
          <ExecQuickTile
            exec="opensnitch-ui"
            icon={new Gtk.Image({ iconName: icons.network.firewall, pixelSize: 18 })}
            labelText="Firewall"
          ></ExecQuickTile>
        </box>

        <box homogeneous>
          <NightLightTile></NightLightTile>
          <button
            hexpand
            onClicked={() => {
              const profiles = powerProfiles.get_profiles();
              const i = profiles.findIndex((p) => p?.profile === powerProfiles?.activeProfile);
              if (i !== -1)
                powerProfiles.activeProfile = profiles[(i + 1) % profiles.length].profile;
            }}
          >
            <box>
              <image
                iconName={createBinding(powerProfiles, "activeProfile").as((profile) => {
                  if (profile === "performance") return icons.powermode.profile.Performance;
                  else if (profile === "power-saver") return icons.powermode.profile.Quiet;
                  else return icons.powermode.profile.Balanced;
                })}
              ></image>
              <label
                label={createBinding(powerProfiles, "activeProfile").as((profile) => {
                  return profile[0].toUpperCase() + profile.slice(1);
                })}
              ></label>
            </box>
          </button>
        </box>

        <box homogeneous>
          <BrightnessPreset brightness={0.0} iconName={icons.brightness.low}></BrightnessPreset>
          <BrightnessPreset brightness={0.3} iconName={icons.brightness.medium}></BrightnessPreset>
          <BrightnessPreset brightness={0.8} iconName={icons.brightness.high}></BrightnessPreset>
        </box>
      </box>
    </box>
  );
};

// export default () =>
//   Widget.Box({
//     className: "quick-tiles horizontal",
//     children: [
//       Widget.Box({
//         vertical: true,
//         children: [
//           Widget.Box({
//             vertical: false,
//             homogeneous: true,
//             children: [
//               ExecQuickTile({
//                 exec: "nm-connection-editor",
//                 icon: Widget.Icon({ icon: icons.network.wired.connected }),
//                 labelText: "Connections",
//               }),
//               ExecQuickTile({
//                 exec: "opensnitch-ui",
//                 icon: FontIcon({ icon: "", className: "opensnitch" }),
//                 labelText: "Firewall",
//               }),
//             ],
//           }),
//           Widget.Box({
//             vertical: false,
//             homogeneous: true,
//             children: [NightLightTile(), PowerProfileTile()],
//           }),
//           Widget.Box({
//             vertical: false,
//             homogeneous: true,
//             children: [
//               BrightnessPreset(0.0, icons.brightness.low),
//               BrightnessPreset(0.3, icons.brightness.medium),
//               BrightnessPreset(0.8, icons.brightness.high),
//             ],
//           }),
//         ],
//       }),
//     ],
//   });
