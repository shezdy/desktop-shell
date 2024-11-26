import { bind } from "astal";
import { App } from "astal/gtk3";
import icons from "../icons.js";
import { Network, Widget } from "../imports.js";

const WifiIndicator = () =>
  Widget.Box({
    name: "wifi",
    // children: [
    //   Widget.Icon({
    //     icon: bind(Network.wifi, "icon-name"),
    //   }),
    //   Widget.Label({
    //     label: bind(Network.wifi, "ssid"),
    //   }),
    // ],
  });

const WiredIndicator = () =>
  Widget.Button({
    name: "wired",
    onClicked: () => {
      App.get_window("dashboard").visible = true;
    },
    child: Widget.Icon({
      className: "icon",
      icon: bind(Network, "connectivity").as((status) => {
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
      }),
    }),
  });

export default () =>
  Widget.Stack({
    className: "network",
    children: [WifiIndicator(), WiredIndicator()],
    shown: bind(Network, "primary").as((p) => {
      if (p === 2) return "wifi";
      return "wired";
    }),
  });
