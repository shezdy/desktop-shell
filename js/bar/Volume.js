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
      if (event.delta_y < 0) Audio.defaultSpeaker.volume += 0.05;
      else Audio.defaultSpeaker.volume -= 0.05;
    },
    child: Widget.Box({
      vpack: "fill",
      children: [
        Widget.Icon({
          className: "icon",
          setup: (self) => {
            const update = () => {
              if (!Audio.defaultSpeaker) return;
              const vol = Math.ceil(Audio.defaultSpeaker.volume * 100);

              let icon = "high";
              if (vol <= 0 || Audio.defaultSpeaker.mute) icon = "muted";
              else if (vol < 35) icon = "medium";
              else if (vol > 100) icon = "overamplified";

              self.icon = `audio-volume-${icon}-symbolic`;
            };

            self.hook(Audio.defaultSpeaker, "notify::volume", update);
            self.hook(Audio.defaultSpeaker, "notify::mute", update);
            update();
          },
        }),
        Widget.Label({
          className: "label",
          label: bind(Audio.defaultSpeaker, "volume").as((v) => {
            const vol = Math.ceil(v * 100);
            // if (vol <= 0) self.label = "󰖁 ";
            // else if (vol < 10) self.label = `󰕾 0${vol}%`;
            // else if (vol < 100) self.label = `󰕾 ${vol}%`;
            // else self.label = `󰕾 ${vol}`;
            if (vol <= 0 || Audio.defaultSpeaker.mute) return "00%";
            if (vol < 10) return `0${vol}%`;
            if (vol < 100) return `${vol}%`;
            return `${vol}`;
          }),
        }),
      ],
    }),
  });
