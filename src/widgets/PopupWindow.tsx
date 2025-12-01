import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Accessor, createState, onCleanup } from "gnim";
import Graphene from "gi://Graphene?version=1.0";
import Adw from "gi://Adw?version=1";
import options from "../options";

type PopupProps = JSX.IntrinsicElements["window"] & {
  children?: any;
  width?: number;
  height?: number;
  margin_top?: number;
  margin_bottom?: number;
  margin_start?: number;
  margin_end?: number;
  gdkmonitor?: Gdk.Monitor;
  transitionType?: Gtk.RevealerTransitionType;
  transitionDuration?: number;
  onKeyPressedHandler?: (
    source: Gtk.EventControllerKey,
    arg0: number,
    arg1: number,
    arg2: Gdk.ModifierType,
  ) => boolean | void;
};

const margin = 0;

export default ({
  children,
  name,
  width,
  height,
  margin_top = margin,
  margin_bottom = margin,
  margin_start = margin,
  margin_end = margin,
  gdkmonitor,
  transitionType = Gtk.RevealerTransitionType.SLIDE_DOWN,
  transitionDuration = options.transition.duration,
  halign = Gtk.Align.CENTER,
  valign = Gtk.Align.CENTER,
  keymode = Astal.Keymode.ON_DEMAND,
  $,
  onKeyPressedHandler = ({ widget }, keyval: number) => {
    if (keyval === Gdk.KEY_Escape) {
      widget.hide();
    }
  },
  ...props
}: PopupProps) => {
  const { TOP, BOTTOM, RIGHT, LEFT } = Astal.WindowAnchor;
  let contentbox: Adw.Clamp;
  const [visible, setVisible] = createState(false);
  const [revealed, setRevealed] = createState(false);

  function show() {
    setVisible(true);
    setRevealed(true);
  }
  function hide() {
    setRevealed(false);
  }

  function init(self: Gtk.Window) {
    // override existing show and hide methods
    Object.assign(self, { show, hide });
  }

  let win: Astal.Window;
  onCleanup(() => {
    win.destroy();
  });

  return (
    <window
      {...props}
      visible={visible}
      name={name}
      namespace={name}
      keymode={keymode}
      layer={Astal.Layer.OVERLAY}
      gdkmonitor={gdkmonitor}
      anchor={TOP | BOTTOM | RIGHT | LEFT}
      application={app}
      $={(self) => {
        win = self
        init(self);
        if ($) $(self);
      }}
      onNotifyVisible={({ visible }) => {
        if (visible) contentbox.grab_focus();
      }}
    >
      <Gtk.EventControllerKey
        onKeyPressed={onKeyPressedHandler}
        onImUpdate={() => {
          "imupdate";
        }}
        // propagationLimit={Gtk.PropagationLimit.SAME_NATIVE}
        // propagationPhase={Gtk.PropagationPhase.CAPTURE}
      />
      <Gtk.GestureClick
        onPressed={({ widget }, _, x, y) => {
          const [, rect] = children.compute_bounds(widget);
          const position = new Graphene.Point({ x, y });

          if (!rect.contains_point(position)) {
            widget.hide();
          }
        }}
      />
      <revealer
        transitionType={transitionType}
        transitionDuration={transitionDuration}
        revealChild={revealed}
        halign={halign}
        valign={valign}
        onNotifyChildRevealed={({ childRevealed }) => {
          setVisible(childRevealed);
        }}
      >
        <Adw.Clamp
          $={(self) => {
            contentbox = self;
          }}
          focusable
          maximum_size={width}
          heightRequest={height}
          margin_top={margin_top}
          margin_bottom={margin_bottom}
          margin_start={margin_start}
          margin_end={margin_end}
        >
          <box class={"window-content"}>{children}</box>
        </Adw.Clamp>
      </revealer>
    </window>
  );
};
