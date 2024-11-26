import { Battery } from "../imports.js";
export default () =>
  Widget.Button({
    className: "battery",
    onClicked: () => App.toggleWindow("dashboard"),
    visible: Battery.bind("available"),
    child: Widget.Box({
      vpack: "fill",
      children: [
        Widget.Icon({
          className: "icon",
          icon: Battery.bind("icon-name"),
        }),
        Widget.Label({
          className: "label",
          label: Battery.bind("percent").as((p) => {
            if (p < 10) return `0${p}%`;
            if (p < 100) return `${p}%`;
            return p;
          }),
        }),
      ],
    }),
  });
