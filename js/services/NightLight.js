import { exec } from "astal";
import { GObject, property, register, signal } from "astal/gobject";
import { GLib, Gio } from "../imports.js";
import options from "../options.js";

const NightLight = GObject.registerClass(
  {
    Properties: {
      temperature: GObject.ParamSpec.double(
        "temperature",
        "Temperature",
        "temperature of the screens",
        GObject.ParamFlags.READWRITE,
        Number.MIN_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        6500,
      ),
      text: GObject.ParamSpec.string(
        "text",
        "Text",
        "string representation of when the next automatic temperature change is",
        GObject.ParamFlags.READWRITE,
        "",
      ),
    },
    Signals: {
      changed: {},
    },
  },
  class NightLight extends GObject.Object {
    // static {
    //   Service.register(
    //     NightLight,
    //     {},
    //     {
    //       temperature: ["number", "rw"],
    //       text: ["string", "r"],
    //     },
    //   );
    // }

    _temperature = 6500;
    _on;
    _currentTimeout = null;
    _text = "";

    get temperature() {
      return this._temperature;
    }

    set temperature(t) {
      Gio.DBus.session.call_sync(
        "rs.wl-gammarelay",
        "/",
        "org.freedesktop.DBus.Properties",
        "Set",
        new GLib.Variant("(ssv)", ["rs.wl.gammarelay", "Temperature", GLib.Variant.new_uint16(t)]),
        null,
        Gio.DBusCallFlags.NONE,
        -1,
        null,
      );

      this._temperature = t;
      if (t === 6500) {
        this._on = false;
        this._text = `On at ${options.nightlight.on}`;
        this._setNightLightTimeout(true);
      } else {
        this._on = true;
        this._text = `Until ${options.nightlight.off}`;
        this._setNightLightTimeout(false);
      }

      this.notify("temperature");
      this.notify("text");
      this.emit("changed");
    }

    get text() {
      return this._text;
    }

    _timeStringToDate(timeString, now) {
      const [hours, minutes] = timeString.split(":");
      const date = new Date(now);
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return date;
    }

    _isDateBetweenTimes(date, startTime, endTime) {
      const startDate = this._timeStringToDate(startTime, date);
      const endDate = this._timeStringToDate(endTime, date);

      if (startDate.getTime() >= endDate.getTime()) {
        endDate.setDate(endDate.getDate() + 1);
      }

      const dateTomorrow = new Date(date);
      dateTomorrow.setDate(date.getDate() + 1);

      return (
        (date.getTime() >= startDate.getTime() && date.getTime() <= endDate.getTime()) ||
        (dateTomorrow.getTime() >= startDate.getTime() &&
          dateTomorrow.getTime() <= endDate.getTime())
      );
    }

    _setNightLightTimeout(on) {
      const now = Date.now();
      const time = this._timeStringToDate(on ? options.nightlight.on : options.nightlight.off, now);
      if (now > time) time.setDate(time.getDate() + 1);
      this._currentTimeout?.destroy();
      if (on)
        this._currentTimeout = setTimeout(() => {
          this.temperature = options.nightlight.temp;
        }, time - now);
      else
        this._currentTimeout = setTimeout(() => {
          this.temperature = 6500;
        }, time - now);
    }
    service = null;

    _syncTemperature() {
      const reply = Gio.DBus.session.call_sync(
        "rs.wl-gammarelay",
        "/",
        "org.freedesktop.DBus.Properties",
        "Get",
        new GLib.Variant("(ss)", ["rs.wl.gammarelay", "Temperature"]),
        null,
        Gio.DBusCallFlags.NONE,
        -1,
        null,
      );

      const [t] = reply.recursiveUnpack();
      this._temperature = t;
      console.log(`Unpacked Result: ${t}`);
    }

    toggle() {
      if (this._on) this.temperature = 6500;
      else this.temperature = options.nightlight.temp;
    }

    constructor() {
      super();

      if (this._isDateBetweenTimes(new Date(), options.nightlight.on, options.nightlight.off))
        this.temperature = options.nightlight.temp;
      else this.temperature = 6500;
    }
  },
);

let service = null;

if (
  exec(
    "which wl-gammarelay-rs",
    () => true,
    () => false,
  )
) {
  exec("wl-gammarelay-rs run");
  service = new NightLight();
}

export default service;
