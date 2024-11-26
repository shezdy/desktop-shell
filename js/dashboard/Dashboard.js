import { Variable } from "astal";
import { App, Astal, astalify } from "astal/gtk3";
import { Gdk, Gtk, Widget } from "../imports.js";
import Brightness from "../services/Brightness.js";
import PopupWindow, { closePopupWindow } from "../widgets/PopupWindow.js";
// import BrightnessSliderRow, { BrightnessMixer } from "./BrightnessSettings.js";
import Header from "./Header.js";
import NotificationCenter from "./NotificationCenter.js";
import QuickTiles from "./QuickTiles.js";
import {
  AppMixer,
  MicrophoneSliderRow,
  SinkSelector,
  SourceSelector,
  VolumeSliderRow,
} from "./VolumeSettings.js";
import GObject from "gi://GObject";

const WINDOW_NAME = "dashboard";

const Row = (children = [], menus = [], ...props) =>
  Widget.Box({
    vertical: true,
    children: [
      Widget.Box({
        className: "row horizontal",
        children,
      }),
      ...menus,
    ],
    ...props,
  });

const Dashboard = () =>
  Widget.Box({
    vertical: true,
    homogeneous: false,
    vpack: "fill",
    className: "dashboard",
    children: [
      Header(),
      Widget.Separator(),
      Widget.Box({
        className: "quick-settings",
        vertical: true,
        children: [
          QuickTiles(),
          Widget.Box({
            className: "sliders-box vertical",
            vertical: true,
            children: [
              Row([VolumeSliderRow()], [SinkSelector(), AppMixer()]),
              Row([MicrophoneSliderRow()], [SourceSelector()]),
            ],
            // sliderRows: [
            //   Row([VolumeSliderRow()], [SinkSelector(), AppMixer()]),
            //   Row([MicrophoneSliderRow()], [SourceSelector()]),
            // ],
            // setup: (self) => {
            //   // const sliderRows = [
            //   //   Row([VolumeSliderRow()], [SinkSelector(), AppMixer()]),
            //   //   Row([MicrophoneSliderRow()], [SourceSelector()]),
            //   // ];
            //   // if (Brightness.screens) {
            //   //   sliderRows.push(Row([BrightnessSliderRow()], [BrightnessMixer()]));
            //   // }
            //   // self.children = self.sliderRows;
            // },
          }),
        ],
      }),
      Widget.Separator(),
      NotificationCenter(),
      Widget.Separator(),
      Widget.Box({
        className: "calendar",
        child: Widget.Calendar({
          hexpand: true,
          hpack: "center",
        }),
      }),
    ],
  });

export default () =>
  PopupWindow({
    name: WINDOW_NAME,
    transition: Gtk.RevealerTransitionType.SLIDE_LEFT,
    location: "right",
    child: Dashboard(),
  });
