import options from "../../options";
import AltTabHyprland from "./AltTabHyprland";

export let cycleNext = (isInitialPress?: boolean) => {}

export default () => {
  if (options.currentDesktop === "hyprland") {
    const altTabHyprland = AltTabHyprland()
    cycleNext = altTabHyprland.cycleNext;
    return altTabHyprland.window();
  }
  else
    return null
};