import { Variable, bind } from "astal";
import { GLib, Widget } from "../imports.js";

const time = Variable();

const update_time = () => {
  const now = GLib.DateTime.new_now_local();
  setTimeout(
    () => {
      update_time();
    },
    1000 * (60 - now.get_seconds()),
  );
  time.set(now);
};

update_time();

export default ({ format = "%a %d %b %H:%M", ...props } = {}) =>
  Widget.Label({
    className: "clock",
    label: bind(time).as((t) => t.format(format) || "wrong format"),
    ...props,
  });
