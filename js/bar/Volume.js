import { bind } from "astal";
import { Astal } from "astal/gtk3";
import { Audio, Gdk, Hyprland, Widget } from "../imports.js";

export default () =>
  Widget.Button({
    className: "volume",
    onClick: (self, event) => {
      switch (event.button) {
        case 1:
          Audio.defaultSpeaker.mute = !Audio.defaultSpeaker.mute;
          break;
        case 3:
          Hyprland.message("dispatch exec pavucontrol");
          break;
      }
    },
    onScroll: (self, event) => {
      if (event.delta_y < 0) {
        if (Audio.defaultSpeaker.volume >= 0.95) Audio.defaultSpeaker.volume = 1;
        else Audio.defaultSpeaker.volume += 0.05;
      } else {
        if (Audio.defaultSpeaker.volume <= 0.05) Audio.defaultSpeaker.volume = 0;
        else Audio.defaultSpeaker.volume -= 0.05;
      }
    },
    setup: (self) => {
      self.hook(Audio.defaultMicrophone, "notify::mute", () =>
        self.toggleClassName("mic-muted", Audio.defaultMicrophone.mute),
      );
    },
    child: Widget.Box({
      vpack: "fill",
      setup: (self) => {
        self.hook(Audio.defaultSpeaker, "notify::mute", () =>
          Audio.defaultSpeaker.notify("volume"),
        );
      },
      children: [
        Widget.Icon({
          className: "icon",
          icon: bind(Audio.defaultSpeaker, "volume").as((v) => {
            const vol = Math.round(v * 100);

            let icon = "high";
            if (vol <= 0 || Audio.defaultSpeaker.mute) icon = "muted";
            else if (vol < 35) icon = "medium";
            else if (vol > 100) icon = "overamplified";

            return `audio-volume-${icon}-symbolic`;
          }),
        }),
        Widget.Label({
          className: "label",
          label: bind(Audio.defaultSpeaker, "volume").as((v) => {
            const vol = Math.round(v * 100);
            if (vol <= 0 || Audio.defaultSpeaker.mute) return "00%";
            if (vol < 10) return `0${vol}%`;
            if (vol < 100) return `${vol}%`;
            return `${vol}`;
          }),
        }),
      ],
    }),
  });
