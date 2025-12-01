import { Gtk } from "ags/gtk4";
import options from "../options";

type AvatarProps = JSX.IntrinsicElements["box"] & {
  pixelSize: number
};

export default ({ pixelSize, ...props }: AvatarProps) => {
  return (
    <box
      class={"avatar"}
      overflow={Gtk.Overflow.HIDDEN}
      {...props}
    >
      <image file={options.avatar} pixelSize={pixelSize}></image>
    </box>
  );
};
