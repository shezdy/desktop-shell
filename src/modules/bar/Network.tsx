import app from "ags/gtk4/app";
import icons from "../../icons";
import { createBinding, With } from "gnim";
import options from "../../options";
import AstalNetwork from "gi://AstalNetwork?version=0.1";

const network = AstalNetwork.get_default()

const WifiIndicator = () => (
  <box name={"wifi"}>
    <image iconName={createBinding(network.wifi, "iconName")}></image>
    <label label={createBinding(network.wifi, "ssid")}></label>
  </box>
);

const WiredIndicator = () => (
  <button
    name={"wired"}
    onClicked={() => {
      const dashboard = app.get_window("dashboard");
      if (!dashboard) return;
      dashboard.visible = true;
    }}
  >
    <image
      class={"icon"}
      pixelSize={options.theme.bar.iconsize}
      iconName={createBinding(
        network,
        "connectivity",
      )((status) => {
        switch (status) {
          case 4: // FULL
            return icons.network.wired.connected;
          case 2: // PORTAL
            return icons.network.wired.portal;
          case 3: // LIMITED
            return icons.network.wired.limited;
          default:
            return icons.network.wired.disconnected;
        }
      })}
    ></image>
  </button>
);

export default () => {
  return (
    <box
      class={"network"}
    >
      <With value={createBinding(network, "primary")}>
        {(value) => {
          if (value === 2) {
            return <WifiIndicator></WifiIndicator>;
          } else {
            return <WiredIndicator></WiredIndicator>;
          }
        }}
      </With>
    </box>
  );
};
