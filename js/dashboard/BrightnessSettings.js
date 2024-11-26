import icons from "../icons.js";
import { Widget } from "../imports.js";
import Brightness from "../services/Brightness.js";
import FontIcon from "../widgets/FontIcon.js";
import { Arrow, Menu } from "../widgets/ToggleButton.js";

const setBrightness = (brightness) => {
  Brightness.screens = brightness;
};

export const setButton = (brightness, text) =>
  Widget.Button({
    className: "brightness-preset",
    hexpand: true,
    onClicked: () => {
      setBrightness(brightness);
    },
    child: FontIcon(text),
  });

const BrightnessScreen = (screen) =>
  Widget.Box({
    hexpand: true,
    className: "mixer-item horizontal",
    children: [
      Widget.Icon(icons.brightness.screen),
      Widget.Box({
        vertical: true,
        children: [
          Widget.Box({
            children: [
              Widget.Label({
                xalign: 0,
                maxWidthChars: 10,
                truncate: "end",
                label: screen.bind("name"),
              }),
              Widget.Label({
                xalign: 1,
                label: screen.bind("brightness").as((b) => `${Math.floor(b * 100)}%`),
              }),
            ],
          }),
          Widget.Slider({
            hexpand: true,
            drawValue: false,
            roundDigits: true,
            step: 0.1,
            value: screen.bind("brightness"),
            onChange: ({ value }) => {
              screen.brightness = value;
            },
          }),
        ],
      }),
    ],
  });

export const BrightnessMixer = () =>
  Menu({
    name: "brightness-mixer",
    icon: Widget.Icon(icons.brightness.indicator),
    title: Widget.Label("Screens"),
    content: [
      Widget.Box({
        vertical: true,
        className: "mixer",
        children: Brightness.bind("screens").as((s) => s.map(BrightnessScreen)),
      }),
    ],
  });

const BrightnessIcon = () =>
  Widget.Icon({
    className: "brightness-icon",
    icon: icons.brightness.indicator,
  });

const BrightnessSlider = () =>
  Widget.Slider({
    hexpand: true,
    drawValue: false,
    roundDigits: true,
    step: 0.1,
    value: Brightness.screens[0].bind("brightness"),
    onChange: ({ value }) => {
      Brightness.screens = value;
    },
  });

export default () =>
  Widget.Box({
    vertical: false,
    children: [
      BrightnessIcon(),
      BrightnessSlider(),
      Widget.Box({
        vpack: "center",
        child: Arrow("brightness-mixer"),
        visible: Brightness.bind("screens").as((s) => s.length > 1),
      }),
    ],
  });
