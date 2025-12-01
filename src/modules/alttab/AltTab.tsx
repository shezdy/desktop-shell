import AltTabHyprland from "./AltTabHyprland";

export let cycleNext = (isInitialPress?: boolean) => {}

export default () => {
  if (CURRENT_DESKTOP === "hyprland") {
    const altTabHyprland = AltTabHyprland()
    cycleNext = altTabHyprland.cycleNext;
    return altTabHyprland.window();
  }
  else
    return null
};