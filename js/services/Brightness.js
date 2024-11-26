import { exec, execAsync } from "astal";
import { GObject, property, register, signal } from "astal/gobject";
import { execSh } from "../helpers/Misc.js";
import options from "../options.js";

const Screen = GObject.registerClass(
  {
    Properties: {
      text: GObject.ParamSpec.string(
        "name",
        "Name",
        "Name of Screen",
        GObject.ParamFlags.READWRITE,
        "",
      ),
      brightness: GObject.ParamSpec.double(
        "brightness",
        "Brightness",
        "Brightness of the screens",
        GObject.ParamFlags.READWRITE,
        Number.MIN_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        0,
      ),
    },
    Signals: {
      changed: {},
    },
  },
  class Screen extends GObject.Object {
    #name = "";
    #brightness = 0;

    get name() {
      return this.#name;
    }

    get brightness() {
      return this.#brightness;
    }

    set brightness(p) {
      let percent = p;
      if (p <= 0) percent = 0.01;

      if (p > 1) percent = 1;

      try {
        execAsync(`brightnessctl s ${percent * 100}% -d ${this.#name} -q`, () => {
          this.#brightness = percent;
          this.notify("brightness");
          this.emit("changed");
        });
      } catch (error) {
        console.error(`Error setting screens: ${error}`);
      }
    }

    constructor(name, brightness) {
      super();
      this.#name = name;
      this.#brightness = brightness;
    }
  },
);

const Brightness = GObject.registerClass(
  {
    Properties: {
      screens: GObject.ParamSpec.jsobject(
        "screens",
        "Screens",
        "Map of all screens",
        GObject.ParamFlags.READWRITE,
        undefined,
      ),
    },
  },
  class Brightness extends GObject.Object {
    #screens;

    async #syncScreens() {
      try {
        execAsync("brightnessctl --class=backlight -l -m", (out) => {
          for (const screen of out.split("\n")) {
            const info = screen.split(",");
            if (!this.#screens.get(info[0]))
              this.#screens.set(info[0], new Screen(info[0], info[2] / info[4]));
          }
        });
      } catch (error) {
        console.error(`Error syncing screens: ${error}`);
      }
    }

    get screens() {
      if (!this.#screens) return undefined;
      return Array.from(this.#screens.values());
    }

    set screens(percent) {
      if (!this.#screens) {
        execSh(options.fallbackBrightnessCmd(percent * 100));
        return;
      }
      this.#syncScreens();
      for (const [name, screen] of this.#screens) {
        if (name === "ddcci5") screen.brightness = percent + 0.1;
        else screen.brightness = percent;
      }
      this.notify("screens");
      this.emit("changed");
    }

    constructor() {
      super();
      try {
        this.#screens = new Map();
        const out = exec("brightnessctl --class=backlight -l -m");
        if (out.startsWith("Failed")) {
          this.#screens = undefined;
          return;
        }
        for (const screen of out.split("\n")) {
          const info = screen.split(",");
          this.#screens.set(info[0], new Screen(info[0], info[2] / info[4]));
        }
      } catch (error) {
        this.#screens = undefined;
      }
    }
  },
);

const brightness = new Brightness();

export default brightness;
