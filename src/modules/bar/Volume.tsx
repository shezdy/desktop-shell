
import { createBinding, onCleanup } from "gnim";
import options from "../../options";
import { launchApp, toggleClassName } from "../../utils/utils";
import AstalWp from "gi://AstalWp?version=0.1";
import { Gdk, Gtk } from "ags/gtk4";

export default () => {
  const audio = AstalWp.get_default()

  return (
    <box
      class={"volume"}
      $={(self) => {
        const notifyMuteHandle = audio.defaultMicrophone.connect("notify::mute", () => {
          toggleClassName(self, "mic-muted", audio.defaultMicrophone.mute)
        });
        toggleClassName(self, "mic-muted", audio.defaultMicrophone.mute)

        onCleanup(() => {
          audio.defaultMicrophone.disconnect(notifyMuteHandle);
        });
      }}
    >
      <Gtk.GestureClick
        button={Gdk.BUTTON_PRIMARY}
        onPressed={() => {audio.defaultSpeaker.mute = !audio.defaultSpeaker.mute}}
      />
      <Gtk.GestureClick
        button={Gdk.BUTTON_SECONDARY}
        onPressed={() => launchApp("pavucontrol-qt")}
      />
      <Gtk.EventControllerScroll
        flags={Gtk.EventControllerScrollFlags.VERTICAL}
        onScroll={(_event, _deltaX, deltaY) => {
          if (deltaY < 0) {
            if (audio.defaultSpeaker.volume >= 0.95) audio.defaultSpeaker.volume = 1;
            else audio.defaultSpeaker.volume += 0.05;
          } else {
            if (audio.defaultSpeaker.volume <= 0.05) audio.defaultSpeaker.volume = 0;
            else audio.defaultSpeaker.volume -= 0.05;
          }
        }}
      />
      <box
        $={(_self) => {
          const notifyMuteHandle = audio.defaultSpeaker.connect("notify::mute", () =>
            audio.defaultSpeaker.notify("volume"),
          );

          onCleanup(() => {
            audio.defaultSpeaker.disconnect(notifyMuteHandle);
          });
        }}
      >
        <image
          class={"icon"}
          pixelSize={options.theme.bar.iconsize}
          iconName={createBinding(
            audio.defaultSpeaker,
            "volume",
          )((v) => {
            const vol = Math.round(v * 100);

            let icon = "high";
            if (vol <= 0 || audio.defaultSpeaker.mute) icon = "muted";
            else if (vol < 35) icon = "medium";
            else if (vol > 100) icon = "overamplified";

            return `audio-volume-${icon}-symbolic`;
          })}
        ></image>
        <label
          class={"label"}
          label={createBinding(
            audio.defaultSpeaker,
            "volume",
          )((v) => {
            const vol = Math.round(v * 100);
            if (vol <= 0 || audio.defaultSpeaker.mute) return "00%";
            if (vol < 10) return `0${vol}%`;
            if (vol < 100) return `${vol}%`;
            return `${vol}`;
          })}
        ></label>
      </box>
    </box>
  );
};
