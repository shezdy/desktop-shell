import AstalWp from "gi://AstalWp?version=0.1";
import { createBinding, For } from "gnim";
import icons from "../../icons";
import { Arrow, Menu } from "./ToggleMenu";
import { Gtk } from "ags/gtk4";
import Pango from "gi://Pango?version=1.0";
import { closeWindow, launchApp, lookupIcon } from "../../utils/utils";
const wp = AstalWp.get_default();

function getIcon(icon: string) {
  if (lookupIcon(icon)) return icon;
  else return "audio-card-symbolic";
}

enum DeviceType {
  SPEAKER = "defaultSpeaker",
  MIC = "defaultMicrophone",
}

const VolumeIndicator = ({ type }: { type: DeviceType }) => {
  return (
    <button
      onClicked={() => {
        if (wp.audio[type]) wp.audio[type].mute = !wp.audio[type].mute;
      }}
    >
      <image
        iconName={type === DeviceType.SPEAKER ? icons.audio.volume.high : icons.audio.mic.high}
      ></image>
    </button>
  );
};

const VolumeSlider = ({ type }: { type: DeviceType }) => {
  return (
    <slider
      hexpand
      drawValue={false}
      step={0.05}
      page={0.05}
      value={createBinding(wp.audio[type], "volume")}
      onChangeValue={(source, scrollType, value) => {
        const realValue = Math.ceil(value * 20) / 20;
        wp.audio[type].volume = realValue;
      }}
    ></slider>
  );
};

export const SpeakerSliderRow = () => {
  return (
    <box visible={createBinding(wp.audio, "speakers").as((s) => s.length > 0)}>
      <VolumeIndicator type={DeviceType.SPEAKER}></VolumeIndicator>
      <VolumeSlider type={DeviceType.SPEAKER}></VolumeSlider>
      {/* <Arrow name="volume-mixer"></Arrow> */}
      <Arrow name="sink-selector"></Arrow>
    </box>
  );
};

export const MicrophoneSliderRow = () => {
  return (
    <box visible={createBinding(wp.audio, "microphones").as((m) => m.length > 0)}>
      <VolumeIndicator type={DeviceType.MIC}></VolumeIndicator>
      <VolumeSlider type={DeviceType.MIC}></VolumeSlider>
      <Arrow name="source-selector"></Arrow>
    </box>
  );
};

const SettingsButton = () => {
  return (
    <button
      hexpand
      onClicked={() => {
        closeWindow("dashboard");
        launchApp("pavucontrol-qt");
      }}
    >
      <box>
        <image iconName={icons.settings}></image>
        {"Audio Settings"}
      </box>
    </button>
  );
};

const VolumeMixerItem = ({ stream }: { stream: AstalWp.Stream }) => {
  return (
    <box class={"mixer-item"}>
      <image
        tooltipText={createBinding(stream, "name")}
        iconName={createBinding(stream, "icon").as((icon) => {
          return lookupIcon(icon) ? icon : icons.mpris.fallback;
        })}
      ></image>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box>
          <label
            xalign={0}
            maxWidthChars={10}
            ellipsize={Pango.EllipsizeMode.END}
            label={createBinding(stream, "description")}
          ></label>
          <label
            label={createBinding(stream, "volume").as((v) => `${Math.ceil(v * 100)}%`)}
            halign={Gtk.Align.END}
            hexpand
          ></label>
        </box>
        <slider
          hexpand
          drawValue={false}
          value={createBinding(stream, "volume")}
          onChangeValue={(source, scrollType, value) => {
            stream.volume = value;
          }}
        ></slider>
      </box>
    </box>
  );
};

export const VolumeMixer = () => {
  const streamsBinding = createBinding(wp.audio, "streams");

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      class={"volume-mixer"}
      visible={streamsBinding.as((streams) => {
        return streams.length > 0;
      })}
    >
      <box cssClasses={["title", "horizontal"]}>
        <image iconName={icons.audio.mixer}></image>
        {"Apps"}
      </box>
      <Gtk.Separator></Gtk.Separator>
      <box orientation={Gtk.Orientation.VERTICAL} class={"item-box"}>
        <For each={streamsBinding}>
          {(item: AstalWp.Stream, index) => {
            return <VolumeMixerItem stream={item}></VolumeMixerItem>;
          }}
        </For>
      </box>
    </box>
  );
};

const DeviceItem = ({ device, type }: { device: AstalWp.Endpoint; type: DeviceType }) => {
  return (
    <button
      hexpand
      onClicked={() => {
        device.isDefault = true;
      }}
      class={createBinding(device, "isDefault").as((isDefault) => {
        return isDefault ? "selected" : "";
      })}
    >
      <box>
        <image iconName={getIcon(device.icon)}></image>{" "}
        <label
          label={(device.description || "").split(" ").slice(0, 4).join(" ")}
          ellipsize={Pango.EllipsizeMode.END}
        ></label>
      </box>
    </button>
  );
};

export const SinkSelector = () => {
  return (
    <Menu name="sink-selector">
      <box orientation={Gtk.Orientation.VERTICAL}>
        <VolumeMixer></VolumeMixer>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box cssClasses={["title", "horizontal"]}>
            <image iconName={icons.audio.type.speaker}></image>
            {"Sinks"}
          </box>
          <Gtk.Separator></Gtk.Separator>
          <For each={createBinding(wp.audio, "speakers")}>
            {(item: AstalWp.Endpoint, index) => {
              return <DeviceItem device={item} type={DeviceType.SPEAKER}></DeviceItem>;
            }}
          </For>
        </box>
        <Gtk.Separator></Gtk.Separator>
        <SettingsButton></SettingsButton>
      </box>
    </Menu>
  );
};

export const SourceSelector = () => {
  return (
    <Menu name="source-selector">
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box cssClasses={["title", "horizontal"]}>
            <image iconName={icons.audio.mic.high}></image>
            {"Sources"}
          </box>
          <Gtk.Separator></Gtk.Separator>
          <For each={createBinding(wp.audio, "microphones")}>
            {(item: AstalWp.Endpoint, index) => {
              return <DeviceItem device={item} type={DeviceType.MIC}></DeviceItem>;
            }}
          </For>
        </box>
        <Gtk.Separator></Gtk.Separator>
        <SettingsButton></SettingsButton>
      </box>
    </Menu>
  );
};
