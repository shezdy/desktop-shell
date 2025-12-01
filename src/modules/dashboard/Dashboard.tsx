import { Astal, Gtk } from "ags/gtk4";
import PopupWindow from "../../widgets/PopupWindow";
import Header from "./Header";
import QuickTiles from "./QuickTiles";
import NotificationCenter from "./NotificationCenter";
import GObject from "gnim/gobject";
import {
  MicrophoneSliderRow,
  SinkSelector,
  SourceSelector,
  SpeakerSliderRow,
  VolumeMixer,
} from "./VolumeSettings";

const WINDOW_NAME = "dashboard";

type RowProps = JSX.IntrinsicElements["box"] & {
  children: GObject.Object | Array<GObject.Object | string>;
  menus?: Array<GObject.Object | string>;
};

const Row = ({ children, menus = [], ...props }: RowProps) => {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} {...props}>
      <box cssClasses={["row", "horizontal"]}>
        {children instanceof GObject.Object
          ? children
          : children.map((item) =>
              item instanceof Gtk.Widget ? item : <Gtk.Label label={item.toString()} />,
            )}
      </box>
      {menus.map((item) =>
        item instanceof Gtk.Widget ? item : <Gtk.Label label={item.toString()} />,
      )}
    </box>
  );
};

export default () => {
  const Dashboard = ({ ...props }) => {
    return <box orientation={Gtk.Orientation.VERTICAL} class={"dashboard"} {...props}></box>;
  };

  return (
    <PopupWindow
      name={WINDOW_NAME}
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      halign={Gtk.Align.END}
      valign={Gtk.Align.FILL}
      keymode={Astal.Keymode.NONE}
    >
      <Dashboard>
        <Header></Header>
        <Gtk.Separator></Gtk.Separator>
        <box class={"quick-settings"} orientation={Gtk.Orientation.VERTICAL}>
          <QuickTiles></QuickTiles>
          <box cssClasses={["sliders-box", "vertical"]} orientation={Gtk.Orientation.VERTICAL}>
            <Row menus={[<SinkSelector></SinkSelector>]}>
              <SpeakerSliderRow></SpeakerSliderRow>
            </Row>
            <Row menus={[<SourceSelector></SourceSelector>]}>
              <MicrophoneSliderRow></MicrophoneSliderRow>
            </Row>
          </box>
        </box>
        <Gtk.Separator></Gtk.Separator>
        <NotificationCenter></NotificationCenter>
        <Gtk.Separator></Gtk.Separator>
        <Gtk.Calendar></Gtk.Calendar>
      </Dashboard>
    </PopupWindow>
  );
};

// export default () =>
//   PopupWindow({
//     name: WINDOW_NAME,
//     namespace: WINDOW_NAME,
//     transition: Gtk.RevealerTransitionType.SLIDE_LEFT,
//     location: "right",
//     child: Dashboard(),
//   });
