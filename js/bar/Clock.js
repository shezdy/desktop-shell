import { App } from "astal/gtk3";
import { Widget } from "../imports.js";
import Brightness from "../services/Brightness.js";
import ClockLabel from "../widgets/ClockLabel.js";

export default () =>
  Widget.Button({
    className: "clock-button",
    onClicked: () => App.get_window("dashboard").toggle(),
    onScroll: (self, event) => {
      if (event.delta_y < 0) Brightness.screens = 0.8;
      else Brightness.screens = 0.3;
    },
    child: ClockLabel(),
  });
