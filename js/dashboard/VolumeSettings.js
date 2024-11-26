import { bind } from "astal";
import { App, Astal } from "astal/gtk3";
import icons from "../icons.js";
import { Audio, Hyprland, Widget } from "../imports.js";
import { Arrow } from "../widgets/ToggleButton.js";
import { Menu } from "../widgets/ToggleButton.js";

function getAudioTypeIcon(icon) {
  const substitues = [
    ["audio-headset-bluetooth", icons.audio.type.headphones],
    ["audio-card-analog-usb", icons.audio.type.speaker],
    ["audio-card-analog-pci", icons.audio.type.headphones],
    ["audio-input-microphone", icons.audio.mic.high],
    ["audio-input-microphone-analog-usb", icons.audio.mic.high],
  ];

  for (const [from, to] of substitues) {
    if (from === icon) return to;
  }

  return icons.audio.type.speaker;
}

const VolumeIndicator = (type = "speaker") =>
  Widget.Button({
    onClicked: () => {
      if (Audio[type]) Audio[type].isMuted = !Audio[type].isMuted;
    },
    child: Widget.Icon({
      setup: (self) => {
        const update = () => {
          if (!Audio.defaultSpeaker.icon) {
            if (type === "speaker") self.icon = icons.audio.type.headphones;
            else self.icon = icons.audio.mic.high;
            return;
          }

          self.icon =
            type === "speaker"
              ? getAudioTypeIcon(Audio.defaultSpeaker?.iconName || "")
              : icons.audio.mic.high;

          self.tooltipText = `Volume ${Math.ceil(Audio[`default-${type}`].volume * 100)}%`;
        };
        self.hook(Audio, `notify::default-${type}`, update);
        update();
      },
    }),
  });

const VolumeSlider = (type = "speaker") =>
  Widget.Slider({
    hexpand: true,
    drawValue: false,
    value: bind(Audio[`default-${type}`], "volume").as((v) => {
      return v;
    }),
    setup: (self) => {
      const updateVolume = () => {
        Audio[`default-${type}`].volume = self.value;
      };
      self.hook(self, "dragged", updateVolume);
    },
  });

export const VolumeSliderRow = () =>
  Widget.Box({
    children: [
      VolumeIndicator("speaker"),
      VolumeSlider("speaker"),
      Widget.Box({
        vpack: "center",
        child: Arrow("app-mixer", null),
        visible: bind(Audio, "streams").as((streams) => streams.length > 0),
      }),
      Widget.Box({
        vpack: "center",
        child: Arrow("sink-selector", null),
      }),
    ],
  });

export const MicrophoneSliderRow = () =>
  Widget.Box({
    visible: bind(Audio, "microphones").as((r) => r.length > 0),
    children: [
      VolumeIndicator("microphone"),
      VolumeSlider("microphone"),
      Widget.Box({
        vpack: "center",
        child: Arrow("source-selector"),
      }),
    ],
  });

const MixerItem = (stream) =>
  Widget.Box({
    hexpand: true,
    className: "mixer-item horizontal",
    stream: stream,
    children: [
      Widget.Icon({
        tooltipText: bind(stream, "name"),
        icon: bind(stream, "icon").as((icon) =>
          Astal.Icon.lookup_icon(icon || "") ? icon : icons.mpris.fallback,
        ),
      }),
      Widget.Box({
        vertical: true,
        children: [
          Widget.Label({
            xalign: 0,
            maxWidthChars: 10,
            truncate: "end",
            label: bind(stream, "description"),
          }),
          Widget.Slider({
            hexpand: true,
            drawValue: false,
            value: bind(stream, "volume"),
            setup: (self) => {
              const updateVolume = () => {
                stream.volume = self.value;
              };
              self.hook(self, "dragged", updateVolume);
            },
          }),
        ],
      }),
      Widget.Label({
        xalign: 1,
        label: bind(stream, "volume").as((v) => `${Math.ceil(v * 100)}%`),
      }),
    ],
  });

const DeviceItem = (device) =>
  Widget.Button({
    device: device,
    hexpand: true,
    onClick: () => {
      device.isDefault = true;
    },
    className: bind(device, "is-default").as((isDefault) => {
      return isDefault ? "selected" : "";
    }),
    child: Widget.Box({
      children: [
        Widget.Icon({
          icon: getAudioTypeIcon(device.icon || ""),
          tooltipText: device.icon,
        }),
        Widget.Label({
          label: (device.description || "").split(" ").slice(0, 4).join(" "),
          truncate: "end",
        }),
      ],
    }),
  });

const SettingsButton = () =>
  Widget.Button({
    onClicked: () => {
      App.get_window("dashboard").close();
      Hyprland.messageAsync("dispatch exec pavucontrol");
    },
    hexpand: true,
    child: Widget.Box({
      children: [Widget.Icon({ icon: icons.settings }), Widget.Label({ label: "Settings" })],
    }),
  });

export const AppMixer = () =>
  Menu({
    name: "app-mixer",
    icon: Widget.Icon({ icon: icons.audio.mixer }),
    title: Widget.Label({ label: "Application Mixer" }),
    content: [
      Widget.Box({
        vertical: true,
        className: "mixer",
        setup: (self) => {
          // const update = () => {
          //   self.children = Audio.get_streams().map(MixerItem);
          // };
          // self.hook(Audio, "notify::streams", update);
          // update();

          for (const stream of Audio.get_streams()) {
            self.add(MixerItem(stream));
          }
          self.hook(Audio, "stream-added", (_, stream) => {
            self.add(MixerItem(stream));
          });
          self.hook(Audio, "stream-removed", (_, stream) => {
            self.children.find((c) => c.stream === stream)?.destroy();
          });
        },
      }),
      Widget.Box({
        vertical: true,
        className: "mixer",
      }),
    ],
  });

export const SinkSelector = () =>
  Menu({
    name: "sink-selector",
    icon: Widget.Icon({ icon: icons.audio.generic }),
    title: Widget.Label({ label: "Sinks" }),
    content: [
      Widget.Box({
        vertical: true,
        // children: bind(Audio, "speakers").as((s) => s.map((s) => DeviceItem(s, true))),
        setup: (self) => {
          // const update = () => {
          //   self.children = Audio.get_speakers().map(DeviceItem);
          // };
          // self.hook(Audio, "notify::speakers", update);
          // update();

          for (const speaker of Audio.get_speakers()) {
            self.add(DeviceItem(speaker));
          }
          self.hook(Audio, "speaker-added", (_, speaker) => {
            self.add(DeviceItem(speaker));
          });
          self.hook(Audio, "speaker-removed", (_, speaker) => {
            self.children.find((c) => c.device === speaker)?.destroy();
          });
        },
      }),
      Widget.Separator(),
      SettingsButton(),
    ],
  });

export const SourceSelector = () =>
  Menu({
    name: "source-selector",
    icon: Widget.Icon({ icon: icons.audio.mic.high }),
    title: Widget.Label({ label: "Sources" }),
    content: [
      Widget.Box({
        vertical: true,
        //children: bind(Audio, "microphones").as((s) => s.map((s) => DeviceItem(s, false))),
        setup: (self) => {
          // const update = () => {
          //   self.children = Audio.get_microphones().map((s) => DeviceItem(s, "microphone"));
          // };
          // self.hook(Audio, "notify::microphones", update);
          // update();
          for (const mic of Audio.get_microphones()) {
            self.add(DeviceItem(mic));
          }
          self.hook(Audio, "microphone-added", (_, mic) => {
            self.add(DeviceItem(mic));
          });
          self.hook(Audio, "microphone-removed", (_, mic) => {
            self.children.find((c) => c.device === mic)?.destroy();
          });
        },
      }),
      Widget.Separator(),
      Widget.Button({
        onClick: () => {
          App.get_window("dashboard").close();
          Hyprland.messageAsync("dispatch exec noisetorch");
        },
        hexpand: true,
        child: Widget.Box({
          children: [
            Widget.Icon({ icon: icons.audio.mixer }),
            Widget.Label({ label: "NoiseTorch" }),
          ],
        }),
      }),
      SettingsButton(),
    ],
  });
