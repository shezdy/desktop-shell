import { closeWindow, openWindow } from "../../utils/utils";
import { createState } from "gnim";
import PopupWindow from "../../widgets/PopupWindow";
import { Gdk, Gtk } from "ags/gtk4";

const WINDOW_NAME = "confirm";
const [action, setAction] = createState(() => {});

export function ConfirmAction(fun: () => void) {
  setAction(() => fun);
  openWindow("confirm");
}

export default () => {
  return (
    <PopupWindow name={WINDOW_NAME} transitionType={Gtk.RevealerTransitionType.NONE}>
      <box orientation={Gtk.Orientation.VERTICAL} class={"confirm"}>
        <box class={"text-box"}>
          <label class={"desc"} label={"Are you sure?"} hexpand></label>
        </box>
        <box cssClasses={["buttons", "horizontal"]}>
          <button
            hexpand
            onClicked={() => {
              closeWindow("confirm");
            }}
            onMap={(self) => {
              self.grab_focus();
            }}
          >
            <Gtk.EventControllerMotion onEnter={(self) => self.get_widget()?.grab_focus()} />
            {"No"}
          </button>
          <button
            hexpand
            onClicked={() => {
              closeWindow("confirm");
              action.get()();
            }}
          >
            <Gtk.EventControllerMotion onEnter={(self) => self.get_widget()?.grab_focus()} />
            {"Yes"}
          </button>
          <Gtk.EventControllerKey
            onKeyPressed={({ widget }, keyval: number) => {
              switch (keyval) {
                case Gdk.KEY_y:
                case Gdk.KEY_Y:
                  widget.get_last_child()?.grab_focus();
                  return true;
                case Gdk.KEY_n:
                case Gdk.KEY_N:
                  widget.get_first_child()?.grab_focus();
                  return true;
                default:
                  return false;
              }
            }}
          />
        </box>
      </box>
    </PopupWindow>
  );
};