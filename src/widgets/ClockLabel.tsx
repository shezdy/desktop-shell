import { createState } from "gnim";
import GLib from "gi://GLib?version=2.0";

const [time, setTime] = createState(GLib.DateTime.new_now_local());

const update_time = () => {
  const now = GLib.DateTime.new_now_local();
  setTimeout(
    () => {
      update_time();
    },
    1000 * (60 - now.get_seconds())
  );
  setTime(now);
};

update_time();

export default ({ format = "%a %d %b %H:%M", ...props }) => {
  return (
    <label
      class={"clock"}
      label={time.as((t) => t.format(format) || "ClockLabel: bad time format")}
      {...props}
    ></label>
  );
};
