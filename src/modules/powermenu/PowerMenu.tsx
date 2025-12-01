import { Gtk } from "ags/gtk4";
import icons from "../../icons";
import options from "../../options";
import { closeWindow } from "../../utils/utils";
import PopupWindow from "../../widgets/PopupWindow";
import { ConfirmAction } from "./PowerMenuConfirm";
import { execAsync } from "ags/process";

const WINDOW_NAME = "powermenu";

type PowerMenuButtonProps = JSX.IntrinsicElements["button"] & {
  actionString?: string;
  confirm?: boolean;
};

const PowerMenuButton = ({ actionString, confirm = true, ...props }: PowerMenuButtonProps) => {
  const action = actionString as keyof typeof icons.powermenu;

  return (
    <button
      {...props}
      onClicked={() => {
        if (confirm)
          ConfirmAction(() => {
            execAsync(["sh", "-c", options.powermenu[action]]).catch((e) => console.error(e));
          });
        else {
          execAsync(["sh", "-c", options.powermenu[action]]).catch((e) => console.error(e));
        }
        closeWindow(WINDOW_NAME);
      }}
    >
      <Gtk.EventControllerMotion onEnter={(self) => self.get_widget()?.grab_focus()} />
      <box>
        <image iconName={icons.powermenu[action]} pixelSize={50}></image>
      </box>
    </button>
  );
};

export default () => {
  return (
    <PopupWindow
      name={WINDOW_NAME}
      transitionType={Gtk.RevealerTransitionType.NONE}
      transitionDuration={150}
    >
      <box>
        <PowerMenuButton actionString={"shutdown"}></PowerMenuButton>
        <PowerMenuButton actionString={"reboot"}></PowerMenuButton>
        <PowerMenuButton
          actionString={"lock"}
          onMap={(self) => {
            self.grab_focus();
          }}
        ></PowerMenuButton>
        <PowerMenuButton actionString={"suspend"} confirm={false}></PowerMenuButton>
        <PowerMenuButton actionString={"logout"}></PowerMenuButton>
      </box>
    </PopupWindow>
  );
};
