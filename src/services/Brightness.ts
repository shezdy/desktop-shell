import { GObject, property, register, signal } from "astal/gobject";
import options from "../options";
import { exec, execAsync } from "ags/process";

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

      execAsync(["sh", "-c", `brightnessctl s ${percent * 100}% -d ${this.#name} -q`])
        .then((out) => {
          this.#brightness = percent;
          this.notify("brightness");
          this.emit("changed");
        })
        .catch((e) => console.error(`brightness service, error setting screen: ${e}`));
    }

    constructor(name: string, brightness: number) {
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
      ),
    },
  },
  class Brightness extends GObject.Object {
    #screens;

    async #syncScreens() {
      try {
        execAsync(["sh", "-c", "brightnessctl --class=backlight -l -m"])
          .then((out) => {
            for (const screen of out.split("\n")) {
              const info = screen.split(",");
              if (!this.#screens?.get(info[0]))
                this.#screens?.set(
                  info[0],
                  new Screen(info[0], parseFloat(info[2]) / parseFloat(info[4])),
                );
            }
          })
          .catch((e) => console.error(`brightness service, error syncing screens: ${e}`));
      } catch (error) {
        console.error(`Error syncing screens: ${error}`);
      }
    }

    get screens(): number[] | null {
      if (!this.#screens) return null;
      return Array.from(this.#screens.values());
    }

    set screens(percent: number) {
      if (!this.#screens) {
        execAsync(["sh", "-c", options.fallbackBrightnessCmd(percent * 100)]).catch((e) =>
          console.error(`brightness service, error executing fallback: ${e}`),
        );
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

      this.#screens = new Map();

      execAsync(["sh", "-c", "brightnessctl --class=backlight -l -m"])
        .then((out) => {
          if (out.startsWith("Failed")) {
            // @ts-expect-error
            this.#screens = undefined;
            return;
          }
          for (const screen of out.split("\n")) {
            const info = screen.split(",");
            this.#screens.set(
              info[0],
              new Screen(info[0], parseFloat(info[2]) / parseFloat(info[4])),
            );
          }
        })
        .catch((e) => {
          // @ts-expect-error
          this.#screens = undefined;
        });
    }
  },
);

const brightness = new Brightness();

export default brightness;
