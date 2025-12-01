import Brightness from "../../services/Brightness";
import ClockLabel from "../../widgets/ClockLabel";
import { Gtk } from "ags/gtk4";
import { toggleWindow } from "../../utils/utils";

export default () => (
  <button
    class={"clock-button"}
    onClicked={() => {
      toggleWindow("dashboard");
    }}
  >
    <ClockLabel></ClockLabel>
    <Gtk.EventControllerScroll
      flags={Gtk.EventControllerScrollFlags.VERTICAL}
      onScroll={(_event, _deltaX, deltaY) => {
        if (deltaY < 0) Brightness.screens = 0.8;
        else Brightness.screens = 0.3;
      }}
    />
  </button>
);
