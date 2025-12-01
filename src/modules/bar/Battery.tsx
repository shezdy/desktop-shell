import AstalBattery from "gi://AstalBattery?version=0.1";
import { toggleWindow } from "../../utils/utils";
import { createBinding } from "gnim";

// not tested
export default () => {
  const battery = AstalBattery.get_default();

  const percent = createBinding(battery, "percentage")((p) => `${Math.floor(p * 100)}%`);

  return (
    <button
      class={"battery"}
      visible={createBinding(battery, "isPresent")}
      onClicked={() => {
        toggleWindow("dashboard");
      }}
    >
      <box>
        <image iconName={createBinding(battery, "iconName")}></image>
        <label label={percent}></label>
      </box>
    </button>
  );
};
